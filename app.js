/* =========================================================================
   app.js – Ablaufsteuerung fuer "10 Minuten fuer mehr Fitness"
   Vanilla JS, keine Abhaengigkeiten.

   Kernidee Timing:
   - Wir zaehlen NICHT stumpf Sekunden herunter (das driftet), sondern merken
     uns eine Referenzzeit auf Basis von performance.now() und berechnen die
     Restzeit bei jedem Tick neu.
   - Ein setInterval-Loop (alle 200 ms) aktualisiert die Anzeige. setInterval
     statt requestAnimationFrame, weil rAF in Hintergrund-Tabs pausiert.
   ========================================================================= */

(function () {
  'use strict';

  // ---- Timeline aus PROGRAM + Pausen bauen -------------------------------
  // Ergebnis: flache Liste aus Uebungs- und Pausen-Segmenten.
  function buildTimeline() {
    const tl = [];
    PROGRAM.forEach((ex, i) => {
      tl.push({
        typ: 'uebung',
        name: ex.name,
        beschreibung: ex.beschreibung,
        hinweis: ex.hinweis,
        dauer: ex.dauer,
        sketch: ex.sketch,
        exIndex: i,        // 0-basiert
        exNummer: i + 1,   // 1-basiert (Anzeige)
      });
      // Pause nach jeder Uebung ausser der letzten.
      if (i < PROGRAM.length - 1) {
        tl.push({
          typ: 'pause',
          name: 'Pause',
          dauer: PAUSE_DAUER,
          sketch: 'pause',
          nextName: PROGRAM[i + 1].name,
          nextNummer: i + 2,
        });
      }
    });
    return tl;
  }

  const TIMELINE = buildTimeline();
  const ANZAHL_UEBUNGEN = PROGRAM.length;
  const GESAMTDAUER = TIMELINE.reduce((s, seg) => s + seg.dauer, 0);
  const RING_UMFANG = 2 * Math.PI * 54; // muss zu r=54 in styles.css passen

  // ---- State -------------------------------------------------------------
  const state = {
    phase: 'idle',      // idle | running | paused | finished
    segIndex: 0,        // aktueller Index in TIMELINE
    segStart: 0,        // performance.now() beim Segmentstart (ms)
    verbleibendBeiPause: 0, // Restsekunden, wenn pausiert
    sound: true,
    timerId: null,          // Handle der setInterval-Schleife
    lastBeepSecond: null,   // um Countdown-Beeps nicht doppelt zu spielen
  };

  const TICK_MS = 200;      // Aktualisierungsintervall der Anzeige

  // ---- DOM-Referenzen ----------------------------------------------------
  const el = {
    app: document.querySelector('.app'),
    startScreen: document.getElementById('startScreen'),
    startBtn: document.getElementById('startBtn'),
    startList: document.getElementById('startList'),
    startSketch: document.getElementById('startSketch'),
    stage: document.getElementById('stage'),
    phaseBadge: document.getElementById('phaseBadge'),
    segCounter: document.getElementById('segCounter'),
    segName: document.getElementById('segName'),
    segHint: document.getElementById('segHint'),
    segDesc: document.getElementById('segDesc'),
    segNext: document.getElementById('segNext'),
    stageSketch: document.getElementById('stageSketch'),
    timer: document.getElementById('timer'),
    timerText: document.getElementById('timerText'),
    timerProgress: document.getElementById('timerProgress'),
    timeline: document.getElementById('timeline'),
    elapsedText: document.getElementById('elapsedText'),
    totalText: document.getElementById('totalText'),
    pauseBtn: document.getElementById('pauseBtn'),
    skipBtn: document.getElementById('skipBtn'),
    resetBtn: document.getElementById('resetBtn'),
    soundBtn: document.getElementById('soundBtn'),
    doneScreen: document.getElementById('doneScreen'),
    restartBtn: document.getElementById('restartBtn'),
  };

  // ---- Hilfsfunktionen ---------------------------------------------------
  function formatZeit(sekunden) {
    const s = Math.max(0, Math.ceil(sekunden));
    const m = Math.floor(s / 60);
    const rest = s % 60;
    return m + ':' + String(rest).padStart(2, '0');
  }

  function aktuellesSegment() {
    return TIMELINE[state.segIndex];
  }

  // Bereits abgeschlossene Zeit VOR dem aktuellen Segment (Sekunden).
  function zeitVorSegment(index) {
    let t = 0;
    for (let i = 0; i < index; i++) t += TIMELINE[i].dauer;
    return t;
  }

  // ---- Audio (Web Audio API, kein File) ----------------------------------
  let audioCtx = null;
  function ensureAudio() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  }
  function beep(frequenz, dauerMs, lautstaerke) {
    if (!state.sound || !audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = frequenz;
    gain.gain.value = lautstaerke == null ? 0.15 : lautstaerke;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    const t0 = audioCtx.currentTime;
    // sanftes Aus-/Einblenden gegen Knacken
    gain.gain.setValueAtTime(gain.gain.value, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dauerMs / 1000);
    osc.start(t0);
    osc.stop(t0 + dauerMs / 1000);
  }
  function beepCountdown() { beep(660, 150, 0.12); }
  function beepSegmentWechsel(typ) {
    // Uebung startet: hoeher; Pause startet: tiefer.
    if (typ === 'uebung') { beep(880, 200, 0.18); }
    else { beep(440, 200, 0.15); }
  }
  function beepFinale() {
    beep(660, 200, 0.2);
    setTimeout(() => beep(880, 400, 0.2), 220);
  }

  // ---- Wake Lock: Bildschirm waehrend des Trainings anlassen -------------
  // Browser lösen den Wake Lock automatisch, wenn der Tab in den Hintergrund
  // geht -> beim Zurueckkehren (visibilitychange) neu anfordern.
  let wakeLock = null;
  async function requestWakeLock() {
    try {
      if ('wakeLock' in navigator) {
        wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener('release', function () { wakeLock = null; });
      }
    } catch (e) {
      // Nicht unterstuetzt oder abgelehnt -> still ignorieren.
    }
  }
  async function releaseWakeLock() {
    try {
      if (wakeLock) { await wakeLock.release(); wakeLock = null; }
    } catch (e) { /* ignorieren */ }
  }

  // ---- Figur: Comic-Video (mit SVG-Fallback) -----------------------------
  // Für diese Übungen liegen animierte Comic-Clips in videos/<key>.mp4 vor.
  // Fallback auf die SVG-Figur bei prefers-reduced-motion oder Ladefehler.
  const VIDEO_KEYS = new Set([
    'spruenge', 'bodywaves', 'hueftdrehungen', 'armschwuenge', 'tote-arme',
    'golfschwuenge', 'marschieren', 'ballett-squats', 'halteposition',
  ]);
  const reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setFigure(container, key) {
    if (key === 'pause') {
      // In der Pause steht die Comic-Figur ruhig da (statisches Bild).
      container.innerHTML = '<img class="sketch-img" src="videos/pause.jpg" alt="" />';
      const im = container.querySelector('img');
      if (im) {
        im.addEventListener('error', function () {
          container.innerHTML = SKETCHES.pause || '';
        }, { once: true });
      }
      return;
    }
    if (VIDEO_KEYS.has(key) && !reduceMotion) {
      container.innerHTML = '<video class="sketch-video" src="videos/' + key +
        '.mp4" autoplay muted loop playsinline preload="auto"></video>';
      const v = container.querySelector('video');
      if (v) {
        // Bei fehlendem/fehlerhaftem Video zurück auf die SVG-Figur.
        v.addEventListener('error', function () {
          container.innerHTML = SKETCHES[key] || '';
        }, { once: true });
      }
    } else {
      container.innerHTML = SKETCHES[key] || '';
    }
  }

  // ---- Rendering: Startbildschirm ----------------------------------------
  function renderStart() {
    setFigure(el.startSketch, PROGRAM[0].sketch);
    el.startList.innerHTML = PROGRAM
      .map((ex, i) =>
        '<li><span class="num">' + (i + 1) + '</span>' +
        '<span class="txt"><strong>' + escapeHtml(ex.name) + '</strong>' +
        '<em>' + escapeHtml(ex.beschreibung) + '</em></span></li>')
      .join('');
    el.totalText.textContent = formatZeit(GESAMTDAUER);
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  // ---- Rendering: Zeitstrahl (einmalig aufbauen) -------------------------
  function renderTimeline() {
    el.timeline.innerHTML = '';
    TIMELINE.forEach((seg, i) => {
      const div = document.createElement('div');
      div.className = 'timeline__seg' + (seg.typ === 'pause' ? ' timeline__seg--pause' : '');
      div.style.flexGrow = String(seg.dauer);
      div.dataset.index = String(i);
      div.title = seg.typ === 'uebung'
        ? ('Übung ' + seg.exNummer + ': ' + seg.name)
        : ('Pause – danach: ' + seg.nextName);
      const fill = document.createElement('div');
      fill.className = 'fill';
      div.appendChild(fill);
      if (seg.typ === 'uebung') {
        const lbl = document.createElement('span');
        lbl.className = 'lbl';
        lbl.textContent = String(seg.exNummer);
        div.appendChild(lbl);
      }
      el.timeline.appendChild(div);
    });
  }

  // ---- Rendering: aktuelles Segment --------------------------------------
  function renderSegment() {
    const seg = aktuellesSegment();
    el.app.dataset.phase = seg.typ; // steuert Farbwelt via CSS

    if (seg.typ === 'uebung') {
      el.phaseBadge.textContent = 'Übung';
      el.segCounter.textContent = 'Übung ' + seg.exNummer + ' von ' + ANZAHL_UEBUNGEN;
      el.segName.textContent = seg.name;
      el.segHint.textContent = seg.hinweis || '';
      el.segHint.hidden = !seg.hinweis;
      el.segDesc.textContent = seg.beschreibung;
      el.segNext.hidden = true;
    } else {
      el.phaseBadge.textContent = 'Pause';
      el.segCounter.textContent = 'Kurze Pause';
      el.segName.textContent = 'Durchatmen';
      el.segHint.textContent = 'Locker stehen · ruhig atmen';
      el.segHint.hidden = false;
      el.segDesc.textContent = 'Locker bleiben und kurz erholen.';
      el.segNext.hidden = false;
      el.segNext.textContent = 'Als Nächstes: ' + seg.nextNummer + '. ' + seg.nextName;
    }
    setFigure(el.stageSketch, seg.sketch);

    // Zeitstrahl-Segmente markieren
    Array.prototype.forEach.call(el.timeline.children, function (child, i) {
      child.classList.toggle('is-current', i === state.segIndex);
      child.classList.toggle('is-done', i < state.segIndex);
      if (i < state.segIndex) child.querySelector('.fill').style.width = '100%';
      if (i > state.segIndex) child.querySelector('.fill').style.width = '0%';
    });
  }

  // ---- Ticker (setInterval-Loop) -----------------------------------------
  // setInterval statt requestAnimationFrame, damit der Timer auch dann
  // sauber weiterlaeuft, wenn der Tab im Hintergrund liegt (rAF pausiert
  // dann). Die Restzeit kommt aus performance.now(), bleibt also driftfrei.
  function startLoop() {
    stopLoop();
    state.timerId = setInterval(tick, TICK_MS);
  }
  function stopLoop() {
    if (state.timerId !== null) {
      clearInterval(state.timerId);
      state.timerId = null;
    }
  }

  function tick() {
    if (state.phase !== 'running') return;
    const seg = aktuellesSegment();
    const vergangen = (performance.now() - state.segStart) / 1000;
    const verbleibend = seg.dauer - vergangen;

    if (verbleibend <= 0) {
      naechstesSegment();
      return;
    }

    updateAnzeige(seg, verbleibend);

    // Countdown-Beeps bei 3, 2, 1 Sekunden Rest
    const ganzeSek = Math.ceil(verbleibend);
    if (ganzeSek <= 3 && ganzeSek !== state.lastBeepSecond) {
      state.lastBeepSecond = ganzeSek;
      beepCountdown();
    }
  }

  function updateAnzeige(seg, verbleibend) {
    el.timerText.textContent = formatZeit(verbleibend);

    // Ring-Fortschritt (leert sich)
    const anteil = Math.max(0, Math.min(1, verbleibend / seg.dauer));
    el.timerProgress.style.strokeDasharray = RING_UMFANG.toFixed(2);
    el.timerProgress.style.strokeDashoffset = (RING_UMFANG * (1 - anteil)).toFixed(2);

    // Countdown-Highlight
    el.timer.classList.toggle('is-ending', verbleibend <= 3.999);

    // Zeitstrahl-Fuellung des aktuellen Segments
    const current = el.timeline.children[state.segIndex];
    if (current) {
      const segAnteil = 1 - verbleibend / seg.dauer;
      current.querySelector('.fill').style.width = (segAnteil * 100).toFixed(1) + '%';
    }

    // Gesamtfortschritt
    const elapsed = zeitVorSegment(state.segIndex) + (seg.dauer - verbleibend);
    el.elapsedText.textContent = formatZeit(elapsed);
  }

  // ---- Segmentwechsel ----------------------------------------------------
  function naechstesSegment() {
    // aktuelles Segment als erledigt markieren
    const cur = el.timeline.children[state.segIndex];
    if (cur) {
      cur.classList.add('is-done');
      cur.classList.remove('is-current');
      cur.querySelector('.fill').style.width = '100%';
    }

    if (state.segIndex >= TIMELINE.length - 1) {
      finish();
      return;
    }
    state.segIndex += 1;
    starteSegment();
  }

  function starteSegment() {
    const seg = aktuellesSegment();
    state.segStart = performance.now();
    state.lastBeepSecond = null;
    renderSegment();
    updateAnzeige(seg, seg.dauer);
    beepSegmentWechsel(seg.typ);
    startLoop();
  }

  // ---- Steuerung ---------------------------------------------------------
  function start() {
    ensureAudio();
    requestWakeLock();
    state.phase = 'running';
    state.segIndex = 0;
    el.startScreen.hidden = true;
    el.doneScreen.hidden = true;
    el.stage.hidden = false;
    renderTimeline();
    starteSegment();
  }

  function togglePause() {
    if (state.phase === 'running') {
      // pausieren: Restzeit einfrieren
      const seg = aktuellesSegment();
      const vergangen = (performance.now() - state.segStart) / 1000;
      state.verbleibendBeiPause = seg.dauer - vergangen;
      state.phase = 'paused';
      stopLoop();
      el.pauseBtn.textContent = '▶ Weiter';
      el.phaseBadge.textContent = 'Pausiert';
    } else if (state.phase === 'paused') {
      // fortsetzen: Referenzzeit so setzen, dass Restzeit erhalten bleibt
      ensureAudio();
      const seg = aktuellesSegment();
      state.segStart = performance.now() - (seg.dauer - state.verbleibendBeiPause) * 1000;
      state.phase = 'running';
      el.pauseBtn.textContent = '⏸ Pause';
      renderSegment(); // Badge/Farbe zuruecksetzen
      startLoop();
    }
  }

  function skip() {
    if (state.phase !== 'running' && state.phase !== 'paused') return;
    if (state.phase === 'paused') {
      state.phase = 'running';
      el.pauseBtn.textContent = '⏸ Pause';
    }
    naechstesSegment();
  }

  function reset() {
    stopLoop();
    releaseWakeLock();
    state.phase = 'idle';
    state.segIndex = 0;
    el.pauseBtn.textContent = '⏸ Pause';
    el.app.dataset.phase = 'idle';
    el.stage.hidden = true;
    el.doneScreen.hidden = true;
    el.startScreen.hidden = false;
  }

  function finish() {
    stopLoop();
    releaseWakeLock();
    state.phase = 'finished';
    el.app.dataset.phase = 'finished';
    el.stage.hidden = true;
    el.doneScreen.hidden = false;
    el.elapsedText.textContent = formatZeit(GESAMTDAUER);
    beepFinale();
  }

  function toggleSound() {
    state.sound = !state.sound;
    if (state.sound) ensureAudio();
    el.soundBtn.setAttribute('aria-pressed', String(state.sound));
    el.soundBtn.textContent = state.sound ? '🔊 Ton' : '🔇 Ton';
  }

  // ---- Tab-Wechsel: bei Rueckkehr Anzeige sofort auffrischen --------------
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && (state.phase === 'running' || state.phase === 'paused')) {
      // Wake Lock wird beim Verlassen des Tabs automatisch geloest -> erneut anfordern.
      requestWakeLock();
    }
    if (!document.hidden && state.phase === 'running') {
      // Beim Zurueckkehren die Anzeige sofort auffrischen (die Restzeit
      // wird ohnehin aus performance.now() korrekt neu berechnet).
      tick();
    }
  });

  // ---- Events ------------------------------------------------------------
  el.startBtn.addEventListener('click', start);
  el.pauseBtn.addEventListener('click', togglePause);
  el.skipBtn.addEventListener('click', skip);
  el.resetBtn.addEventListener('click', reset);
  el.soundBtn.addEventListener('click', toggleSound);
  el.restartBtn.addEventListener('click', start);

  // Tastatur: Leertaste = Pause/Weiter (wenn im Training)
  document.addEventListener('keydown', function (e) {
    if (e.code === 'Space' && (state.phase === 'running' || state.phase === 'paused')) {
      e.preventDefault();
      togglePause();
    }
  });

  // ---- Init --------------------------------------------------------------
  renderStart();
})();
