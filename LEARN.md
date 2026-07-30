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
