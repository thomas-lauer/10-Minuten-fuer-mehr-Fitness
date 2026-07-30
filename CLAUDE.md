# CLAUDE.md – Technische Dokumentation

Technischer Überblick über die App „10 Minuten für mehr Fitness".

## Tech-Stack

- **Reines HTML/CSS/Vanilla-JavaScript** – keine Frameworks, kein Build-Schritt,
  keine externen Abhängigkeiten und kein CDN.
- Läuft direkt aus dem Dateisystem und ist damit **GitHub-Pages-fähig** (Dateien
  einfach ablegen).

## Dateistruktur

| Datei | Zweck |
|-------|-------|
| `index.html` | Grundgerüst: Start-, Trainings- und Abschlussbereich, Container für Timer/Zeitstrahl/Controls. |
| `styles.css` | Sketch-Look, ruhige Qigong-Farbwelt (Grün/Erdtöne), Timer-Ring, Zeitstrahl, Responsive- und Dark-Mode. |
| `exercises.js` | Datenmodell: `PROGRAM` (Array der Übungen) und Konstante `PAUSE_DAUER`. |
| `sketches.js` | Objekt `SKETCHES`: animierte Inline-SVG-Figuren je Übung (+ `pause`). |
| `app.js` | Gesamte Ablauflogik: Timeline-Aufbau, State-Machine, Timer, Zeitstrahl, Audio, Steuerung. |
| `README.md` | Nutzerdoku / Programmbeschreibung. |
| `LEARN.md` | Erkenntnisse und gelöste Probleme. |

## Datenmodell (`exercises.js`)

```js
const PAUSE_DAUER = 10; // Sekunden Pause zwischen zwei Segmenten

const PROGRAM = [
  { id, name, beschreibung, dauer /* Sek. */, sketch /* Key in SKETCHES */ },
  ...
];
```

Pausen sind **nicht** Teil von `PROGRAM`. Sie werden zur Laufzeit erzeugt (siehe
`buildTimeline`), damit man Pausen zentral über eine Konstante steuern kann.

## Ablauflogik (`app.js`)

Alles liegt in einer IIFE (kein globaler Scope-Müll).

### Timeline
`buildTimeline()` erzeugt aus `PROGRAM` + `PAUSE_DAUER` eine flache Liste
`TIMELINE` aus Segmenten `{ typ: 'uebung' | 'pause', dauer, ... }`. Nach jeder
Übung außer der letzten wird ein Pausen-Segment eingefügt.

- 9 Übungen + 8 Pausen = **17 Segmente**, Gesamtdauer `9·60 + 8·10 = 620 s = 10:20`.

### State-Machine
`state.phase`: `idle → running → finished`, plus `paused`.
`state.segIndex` zeigt auf das aktuelle Segment in `TIMELINE`.

### Timing (wichtig)
Der Timer zählt **nicht** stumpf Sekunden herunter (das driftet). Stattdessen:

- Beim Segmentstart wird `state.segStart = performance.now()` gemerkt.
- Restzeit = `segment.dauer - (performance.now() - segStart) / 1000`.
- Ein **`setInterval(tick, 200)`**-Loop aktualisiert die Anzeige.

`setInterval` statt `requestAnimationFrame`, weil rAF in **Hintergrund-Tabs
pausiert** – der Timer soll aber auch dann weiterlaufen. Die Restzeit-Berechnung
über `performance.now()` hält die Anzeige trotzdem exakt (kein aufaddierter Drift).

### Pause/Fortsetzen
Beim Pausieren wird die Restzeit eingefroren. Beim Fortsetzen wird `segStart` so
zurückgerechnet, dass die eingefrorene Restzeit erhalten bleibt:
`segStart = now - (dauer - restzeit) * 1000`.

### Audio (`Web Audio API`)
Kein Audio-File. Kurze Töne per `AudioContext`-Oszillator:
- Übung startet → höherer Ton (880 Hz), Pause startet → tieferer Ton (440 Hz).
- Countdown-Piepser (660 Hz) bei 3/2/1 Sekunden Rest.
- Abschluss-Fanfare am Ende.

`AudioContext` wird erst nach dem ersten Klick initialisiert/`resume()`-t
(Browser-Autoplay-Policy). Ton ist per Button an-/abschaltbar (`state.sound`).

### Zeitstrahl
`renderTimeline()` baut die Balken einmalig auf; jedes Segment bekommt
`flex-grow = dauer` → Breite proportional zur Dauer. `updateAnzeige()` füllt das
aktuelle Segment (`.fill` width), `renderSegment()` setzt `is-current`/`is-done`.

### Farbwelt
Der Container `.app` trägt `data-phase` (`uebung`/`pause`/…); CSS schaltet darüber
zwischen Grün (Übung) und Ocker (Pause) um.

### Animierte Skizzen
Jede Figur in `sketches.js` besteht aus einem statischen Grundgerüst und bewegten
Teil-Gruppen mit Klassen `sk-*` (z. B. `sk-arm-r`, `sk-hip`, `sk-fig`). Die
eigentliche Bewegung (`@keyframes`) und der Drehpunkt (`transform-origin` in
viewBox-Einheiten) liegen in `styles.css` und werden über die Wurzelklasse
`anim-<key>` am `<svg>` ausgewählt. Voraussetzung ist `transform-box: view-box`
(global auf `.sk-*` gesetzt), damit `transform-origin` in den viewBox-Koordinaten
0–100 interpretiert wird – so rotieren Arme sauber um die Schulter (50,40), Beine
um die Hüfte (50,66). `prefers-reduced-motion` schaltet alle Skizzen-Animationen ab.

Zusätzlich hat jede Übung in `exercises.js` ein kurzes Feld `hinweis` (Bewegungs-Cue,
z. B. „Arme schwingen · vor–zurück"), das als Pill unter dem Titel angezeigt wird.

## Anpassen

- **Übung/Dauer ändern oder ergänzen:** `PROGRAM` in `exercises.js`. Neuer
  `sketch`-Key muss in `SKETCHES` (`sketches.js`) existieren.
- **Pausenlänge:** `PAUSE_DAUER` in `exercises.js`.
- **Bewegungshinweis:** Feld `hinweis` je Übung in `exercises.js`.
- **Neue Skizze:** SVG-String unter neuem Key in `SKETCHES`; `viewBox="0 0 100 130"`
  und `stroke="currentColor"` beibehalten (theme-fähig). Für Bewegung bewegte Teile
  in eine `sk-*`-Gruppe legen, am `<svg>` `anim-<key>` ergänzen und in `styles.css`
  passende `@keyframes` + `transform-origin` definieren.
- **Tempo/Genauigkeit der Anzeige:** `TICK_MS` in `app.js`.

## Lokal ausführen

Doppelklick auf `index.html`, oder statischer Server:

```bash
python -m http.server 8000   # http://localhost:8000
```

## Deployment (GitHub Pages)

Repository-Settings → Pages → Branch `main`, Ordner `/root`. Da keine Build-Tools
nötig sind, wird die Seite direkt aus den statischen Dateien ausgeliefert.
