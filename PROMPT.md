# PROMPT.md — Der ideale Prompt für dieses Projekt

Dieser Prompt bündelt alle Anforderungen und Entscheidungen so, dass das komplette
Projekt in **einem Durchlauf** entsteht — ohne die Iterationsschleifen, die beim
ersten Mal nötig waren (v. a. beim Bildstil). Einfach den folgenden Block als
Aufgabe geben (und den Pfad zum Video anpassen).

---

## Copy-&-Paste-Prompt

> **Rolle & Ziel**
> Baue eine eigenständige, offline lauffähige Web-App „10 Minuten für mehr Fitness",
> die ein von Tai Chi/Qigong inspiriertes Kurz-Workout als geführte Trainingssession
> mit Timer abspielt.
>
> **Quelle analysieren**
> Analysiere das Video `./ScreenRecorderProject1.mp4` (Screen-Recording eines
> Instagram-Reels). Extrahiere die Übungen per ffmpeg-Frame-Extraktion
> (`ffmpeg -i video.mp4 -vf "fps=1,scale=800:-1" frames/frame_%03d.jpg`) und lies die
> eingeblendeten Titel-Overlays aus. Erwartetes Ergebnis (falls abweichend, das
> Gelesene verwenden):
>
> | # | Übung | Dauer |
> |---|-------|-------|
> | 1 | Lymphatische Sprünge | 60 s |
> | 2 | Bodywaves | 60 s |
> | 3 | Hüftdrehungen | 60 s |
> | 4 | Armschwünge | 60 s |
> | 5 | Tote Arme | 60 s |
> | 6 | Golfschwünge | 60 s |
> | 7 | Marschieren | 60 s |
> | 8 | Ballett-Squats | 60 s |
> | 9 | Tiefe Halteposition (Abschluss) | 60 s |
>
> **Ablauf-Logik**
> - Ein **Startbutton** startet die Session; danach laufen die Segmente automatisch ab.
> - Jede Übung dauert **1 Minute**, dazwischen jeweils **10 Sekunden Pause**
>   (8 Pausen). Der 9. Punkt (Halteposition) ist der Abschluss → Gesamtdauer **10:20**.
> - **Großer Timer** (mm:ss) mit Fortschrittsring pro Segment (Übung UND Pause).
> - **Live-Zeitstrahl** der ganzen Session: jedes Segment proportional zur Dauer,
>   aktuelles Segment hervorgehoben, erledigte gefüllt.
> - Steuerung: **Pause/Weiter** (auch Leertaste), **Überspringen**, **Neustart**,
>   **Ton an/aus**.
> - **Akustische Signale** per Web Audio API (kein Audio-File, stummschaltbar):
>   Ton bei jedem Übergang + Countdown-Piepser in den letzten 3 Sekunden + Abschlusston.
>
> **Darstellung je Übung**
> - **Kurzbeschreibung** (1–2 Sätze) je Übung — sowohl während der Übung als auch
>   vorab in einer Übungsliste auf dem Startbildschirm.
> - **Kurzer Bewegungshinweis/Cue** als Pill unter dem Titel (z. B.
>   „Arme schwingen · vor–zurück").
> - **Animierte, illustrierte Comic-Figur (Flat-Design)** je Übung, die die Bewegung
>   vorführt — KEINE Strichmännchen. Freundliche Figur mit Kopf/Haaren/Shirt/Hose,
>   eigene Pose + CSS-Animation pro Übung (Sprung, Hüftkreis, Arm-/Beinschwung,
>   Squat tief–hoch, Atmen …).
>
> **Technik-Vorgaben**
> - Reines **HTML/CSS/Vanilla-JavaScript**, **keine Frameworks, kein Build, kein CDN**,
>   voll offline lauffähig und GitHub-Pages-fähig.
> - Timer über **`performance.now()`-Referenzzeit** (driftfrei) und einen
>   **`setInterval`-Loop** aktualisieren — NICHT `requestAnimationFrame` (pausiert in
>   Hintergrund-Tabs) und NICHT stumpfes Sekunden-Herunterzählen.
> - Figuren als Inline-SVG (viewBox `0 0 140 200`) über einen kleinen Baukasten
>   generieren (gemeinsame Farb-/Kopf-/Torso-Basis, variable Arme/Beine). Bewegte
>   Teile in Gruppen `fl-*`; Animationen als `@keyframes` in CSS, ausgewählt über
>   Wurzelklasse `anim-fl-<key>`. `transform-box: view-box` setzen, damit
>   `transform-origin` in viewBox-Einheiten gilt (Arme drehen um die Schulter, Beine
>   um die Hüfte). `prefers-reduced-motion` abschalten. Responsive + Dark-Mode.
> - Datenmodell in `exercises.js` (`PROGRAM` mit `name/beschreibung/hinweis/dauer/
>   sketch`, Konstante `PAUSE_DAUER`); Pausen zur Laufzeit einfügen. Skizzen in
>   `sketches.js`, Logik in `app.js`, Layout in `styles.css`, Einstieg `index.html`.
>
> **Dokumentation**
> - `README.md`: Programmbeschreibung, Übungsliste, Bedienung, Herkunft, Start-Anleitung.
> - `CLAUDE.md`: gesamte Technik (Dateistruktur, Datenmodell, Timing-Ansatz, Audio,
>   Animationssystem, Anpassen, lokaler Start, GitHub-Pages-Deploy).
> - `LEARN.md`: Erkenntnisse/Stolperfallen (ffmpeg-Analyse, Timer-Drift, warum
>   `setInterval` statt `rAF`, Audio-Autoplay-Policy, `transform-box: view-box`,
>   headless testen via `getComputedStyle`/`getBBox`).
> - `.gitignore`: Quell-`.mp4` und `.claude/` ausschließen.
>
> **Qualität & Abschluss**
> - Vor Abschluss headless im Browser prüfen: Countdown zählt, Übergänge/Pausen,
>   Zeitstrahl, Controls, Ton, alle Figuren rendern und animieren, keine Konsolenfehler.
> - Danach als **privates** GitHub-Repository `10-Minuten-fuer-mehr-Fitness` anlegen
>   und pushen. Optional GitHub Pages aktivieren (setzt öffentliches Repo voraus).
> - Vor umfangreicherer Arbeit einen kurzen Plan zur Freigabe vorlegen.

---

## Hinweise zu bewussten Design-Entscheidungen

Diese Punkte haben beim ersten Mal Iterationen gekostet und sind hier vorweggenommen:

- **Bildstil:** illustrierte Flat-Design-Comic-Figuren (keine Strichmännchen, keine
  Voxel/Minecraft-/Foto-Variante). Der Weg dahin führte über mehrere Muster — hier
  direkt festlegen.
- **Abschluss** als 9. Segment (60 s), damit die Gesamtdauer ~10 Minuten ergibt.
- **Ton** standardmäßig an, aber stummschaltbar; erst nach erstem Klick initialisieren.
- **`setInterval` statt `requestAnimationFrame`** ist bewusst gewählt (Hintergrund-Tabs
  + headless testbar).
- **Beschreibung** erscheint an ZWEI Stellen: Startliste (Vorschau) und während der Übung.
- Repo startet **privat**; GitHub Pages erfordert auf dem Free-Plan ein öffentliches Repo.
