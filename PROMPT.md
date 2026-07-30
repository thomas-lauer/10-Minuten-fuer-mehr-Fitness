# PROMPT.md — Der ideale Prompt für dieses Projekt

## Copy-&-Paste-Prompt

> **Rolle & Ziel**
> Baue eine eigenständige, Web-App „10 Minuten für mehr Fitness".
>
> **Quelle analysieren**
> Analysiere das Video `./ScreenRecorderProject1.mp4` 
>
> **Ablauf-Logik**
> - Ein **Startbutton** startet die Session; danach laufen die Segmente automatisch ab.
> - Jede Übung dauert **1 Minute**, dazwischen jeweils **10 Sekunden Pause**. 
> - **Großer Timer** mit Fortschrittsring pro Segment (Übung UND Pause).
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
> **Dokumentation**
> - `README.md`: Programmbeschreibung, Übungsliste, Bedienung, Herkunft, Start-Anleitung.
> - `CLAUDE.md`: gesamte Technik (Dateistruktur, Datenmodell, Timing-Ansatz, Audio,
>   Animationssystem, Anpassen, lokaler Start, GitHub-Pages-Deploy).
> - `LEARN.md`: Erkenntnisse/Stolperfallen 
> - `.gitignore`: Quell-`.mp4` und `.claude/` ausschließen.
>
> **Qualität & Abschluss**
> - Vor Abschluss headless im Browser prüfen: Countdown zählt, Übergänge/Pausen,
>   Zeitstrahl, Controls, Ton, alle Figuren rendern und animieren, keine Konsolenfehler.
> - Danach als **öffentliches** GitHub-Repository `10-Minuten-fuer-mehr-Fitness` anlegen
>   und pushen. GitHub Pages aktivieren.
> - Vor umfangreicherer Arbeit einen kurzen Plan zur Freigabe vorlegen.

