# LEARN.md – Erkenntnisse & gelöste Probleme

Sammlung der Stolperfallen aus der Entwicklung dieser App.

## 1. Übungen aus dem Video extrahieren

**Ausgangslage:** Quelle war ein 55 s langes Screen-Recording eines Instagram-Reels
(`ScreenRecorderProject1.mp4`, 1374×1332), kein Text.

**Vorgehen:** Mit **ffmpeg** ein Frame pro Sekunde extrahiert und verkleinert:

```bash
ffmpeg -i ScreenRecorderProject1.mp4 -vf "fps=1,scale=800:-1" frames/frame_%03d.jpg
```

Die eingeblendeten Titel-Overlays („1 min – Lymphatische Sprünge" usw.) ließen sich
so zuverlässig ablesen. Ergebnis: 8 Übungen + Intro/Abschluss. **Lehre:** 1 fps ist
für Text-Overlays ausreichend und spart enorm Bild-Auswertung gegenüber voller
Framerate.

## 2. Timer-Drift – warum nicht einfach herunterzählen?

Ein naives `setInterval(() => rest--, 1000)` driftet: Intervalle feuern nie exakt
im Sekundentakt, Verzögerungen summieren sich, und in Hintergrund-Tabs werden
Timer gedrosselt.

**Lösung:** Referenzzeitpunkt mit `performance.now()` beim Segmentstart merken und
die Restzeit bei jedem Tick **neu berechnen** (`dauer - vergangen`). Der Tick dient
nur der Anzeige; die Wahrheit ist immer die berechnete Differenz → kein Drift.

## 3. `requestAnimationFrame` läuft nicht im Hintergrund (und beim Testen nicht)

Erste Version nutzte einen `requestAnimationFrame`-Loop. Problem: **rAF pausiert,
sobald die Seite nicht gerendert/kompositiert wird** – also in inaktiven Tabs und
auch in der Test-Vorschau, wenn das Browser-Pane nicht sichtbar ist. Symptom im
Test: Timer blieb bei `1:00` stehen, `elapsed` bei `0:00`.

**Lösung:** Umstellung auf **`setInterval(tick, 200)`**. `setInterval` ist ein
Timer-Task und feuert unabhängig vom Rendering. In Kombination mit der
`performance.now()`-Berechnung bleibt die Anzeige exakt, läuft aber auch im
Hintergrund weiter. **Lehre:** Für Countdown-Logik ist rAF die falsche Wahl –
es ist an die Bildrate/Sichtbarkeit gekoppelt, nicht an die reale Zeit.

## 4. Audio-Autoplay-Policy

`AudioContext` startet in modernen Browsern im Zustand `suspended` und darf erst
nach einer **Nutzerinteraktion** Ton ausgeben. Deshalb wird der Context erst im
Start-/Ton-Klick erzeugt bzw. `resume()`-t. Würde man ihn beim Laden anlegen,
bliebe er stumm.

## 5. Lokale Datei außerhalb des Projekt-Roots ließ sich nicht live rendern

Das Öffnen per `file://` aus einem Pfad außerhalb des erkannten Projektordners
rendert im Vorschau-Pane nur einen statischen Snapshot (kein JS-Ablauf).

**Lösung fürs Testen:** einen statischen Server im Projektordner starten
(`python -m http.server 8777`) und über `http://127.0.0.1:8777` testen. Für den
Endnutzer genügt weiterhin der Doppelklick auf `index.html`.

## 6. SVG-Skizzen theme-fähig halten

Die Strichmännchen nutzen `stroke="currentColor"` statt fester Farben. Dadurch
lassen sich Übung (Grün) und Pause (Ocker) allein über die CSS-Textfarbe des
Containers umschalten – kein Nachzeichnen oder Farbduplikat je Zustand nötig.

## 7. Statische Figuren erklärten die Übung schlecht → Animation

Rückmeldung aus der Praxis: Ein einzelnes, statisches Strichmännchen vermittelt die
eigentliche **Bewegung** nicht. Lösung: die Figuren animieren (CSS-Keyframes) und je
Übung einen kurzen Bewegungs-Cue (`hinweis`) einblenden.

**Stolperfalle Drehpunkt:** Rotiert man einen Arm/ein Bein per CSS, liegt der
Drehpunkt standardmäßig **nicht** an der Schulter/Hüfte, sondern am Rand der
Bounding-Box – die Gliedmaße „fliegt weg". Fix: `transform-box: view-box` auf die
animierten Gruppen setzen; dann interpretiert der Browser `transform-origin` in den
**viewBox-Einheiten** (0–100). So dreht der Arm exakt um die Schulter `(50,40)`.
Verifiziert mit `getScreenCTM()`: der Schulterpunkt driftet unter Rotation 0 px.

**Testbarkeit:** Ob eine Animation greift, lässt sich headless prüfen, indem man je
Skizze `getComputedStyle(part).animationName` liest (≠ `none`). Sichtbare Frames sind
dafür nicht nötig – praktisch, wenn das Vorschau-Pane nicht rendert (siehe Punkt 3).

## 8. Bildstil-Iteration → illustrierte Flat-Design-Figuren

Die reinen Strichmännchen erklärten die Übungen schlecht. Nach mehreren Varianten
(animierte Sticks, Silhouette, echtes Videobild, Voxel/Minecraft, isometrisch) fiel
die Wahl auf **illustrierte Flat-Design-Figuren** (Comic-Person mit Kleidung).

Nützliche Bausteine dabei:
- **Figuren generisch bauen:** ein `fig(...)`-Baukasten mit Teil-Helfern
  (`armStraight`, `legsWide`, `HEAD` …) statt 10× kompletter SVGs – neue Pose = neue
  Arm-/Bein-Kombination, gemeinsame Farb-/Kopf-Basis.
- **Headless-Sanity-Check ohne Pixel:** Da das Vorschau-Pane keine Frames rendert,
  prüft `element.getBBox()` je Figur, ob alle Teile innerhalb der viewBox liegen und
  nicht leer sind – fängt grobe Geometriefehler ab, ohne die Figur „sehen" zu müssen.
- **Sackgasse Rasterung:** Der Umweg, SVGs im Browser per Canvas → PNG-`toDataURL`
  zu rastern und das Base64 herauszukopieren, scheiterte an Kopier-/Längenfehlern der
  langen Base64-Strings. Für Selbstkontrolle sind `getComputedStyle`/`getBBox`
  zuverlässiger.

## 9. „Passt nicht aufs Handy" → viewport-fittendes Layout + Wake Lock

Die Trainingsansicht war auf dem Smartphone ~270 px zu hoch (Scrollen nötig).
Größter Übeltäter: Timer und Figur waren gestapelt. Lösung: auf schmalen Screens
**Timer und Skizze nebeneinander** (`.stage__visual { flex-direction: row }`),
kleinere Figur, kompaktere Abstände, Footer im Training ausblenden, Beschreibung auf
wenige Zeilen begrenzen. So passt die aktive Ansicht exakt in den Viewport
(getestet 375×812, 375×667, 360×640 → 0 px Überlauf).

**Bildschirm anlassen:** die **Wake Lock API** (`navigator.wakeLock.request('screen')`)
hält den Bildschirm an; wichtig ist, sie beim `visibilitychange` erneut anzufordern,
weil der Lock beim Tab-Wechsel automatisch freigegeben wird.

**Test-Stolperfalle:** Nach CSS-Änderungen zeigte der Vorschau-Browser weiter die
**gecachte** `styles.css` (auch nach Reload). Verlässlich half, das Stylesheet per JS
mit Cache-Buster neu zu laden: `link.href = 'styles.css?bust=' + zufallszahl`, dann
messen. Sonst testet man gegen den alten Stand. Zusätzlich: wiederholtes
Stylesheet-Nachladen bei gleichzeitig umgeschaltetem `prefers-color-scheme` kann in
der Emulation den Media-Query-Zustand „verkleben" – im Zweifel in einem **frischen
Tab** gegenprüfen.

## 10. Dark Mode: fest kodierte Button-Farbe war unlesbar

Im Dark Mode waren die Steuer-Buttons unleserlich: `.btn` hatte `background: #fff`
fest kodiert, während die Textfarbe `var(--ink)` im Dark Mode hell wird → heller Text
auf Weiß. Fix: Button-Hintergrund über eine Variable `--btn-bg` steuern (hell im Light-,
dunkel im Dark-Mode). Lehre: Bei Themes **keine Farbe fest kodieren**, die mit einer
themebasierten Gegenfarbe kombiniert wird – immer beide über Variablen führen. Kontrolle
per WCAG-Kontrastverhältnis (Ziel ≥ 4.5): jetzt Button 9.5, Badges/Zahlen 5.4.

## 11. KI-Comic-Videos je Übung (Higgsfield-Pipeline)

Die Übungen gibt es zusätzlich als KI-generierte Comic-Loops (Video mit SVG-Fallback).
Pipeline: Original-Reel-Frame → Comic-Stilisierung (Nano Banana 2) → Image-to-Video
(Seedance 2.0) → tonlose Web-Version (ffmpeg). Stolperfallen:

- **Image-to-Video allein macht keinen Comic:** Ein Foto direkt zu animieren behält
  den Foto-Look. Erst das Standbild in den Comic-Stil bringen (Bild-Modell mit dem
  Frame als Referenz), dann animieren.
- **Umlaut im Pfad bricht Hintergrund-Skripte:** Ein `powershell -File script.ps1`
  las das „ü" im Videopfad falsch → ffmpeg-Frame-Extraktion schlug fehl. Fix: Quelle
  auf einen ASCII-Pfad kopieren.
- **CLI-Binärdatei verschwand in langen Läufen:** In den langen Hintergrund-Batches
  fehlte plötzlich `hf.exe`. Zuverlässiger war, die Clips **einzeln im Vordergrund**
  zu erzeugen und die CLI bei Bedarf pro Aufruf neu zu installieren (mit Windows-`tar`
  im PATH).
- **Seedance-Gliedmaßen-Duplikat:** Bei schnellen Bewegungen (tiefe Kniebeuge)
  entstanden doppelte Beine. Gegenmittel: im Prompt „single consistent body, exactly
  one pair of legs/arms, no duplicated limbs" und eine ruhigere Startpose.
- **Kosten:** Seedance 720p ≈ 4,5 Credits/s (5 s ≈ 22,5), Bild ≈ 2 — alle 9 Übungen
  inkl. Fehlversuche ~350 Credits.
