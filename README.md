# 10 Minuten für mehr Fitness

Eine kleine Web-App, die ein von **Tai Chi und Qigong** inspiriertes Kurz-Workout
als geführte Trainingssession mit Timer abspielt. Ein Klick auf *Start*, und die
Übungen laufen automatisch nacheinander ab – jede Übung eine Minute, dazwischen
jeweils 10 Sekunden Pause.

Die Übungen stammen aus einem Instagram-Reel („Nur 8 Minuten diese uralten
chinesischen Übungen"). Die App ergänzt sie um eine Abschluss-Halteposition, sodass
sich rund **10 Minuten** Gesamtdauer ergeben.

## Funktionen

- ▶ **Startknopf** – startet die komplette Session.
- ⏱ **Großer Timer** pro Segment (Übung und Pause), inkl. Fortschrittsring.
- ⏸ **Pause/Weiter**, ⏭ **Überspringen**, ↺ **Neustart**.
- 🔊 **Akustische Signale** (an-/ausschaltbar): Ton bei jedem Übergang und ein
  Countdown-Piepser in den letzten 3 Sekunden.
- 📊 **Live-Zeitstrahl** der gesamten Session – jedes Segment proportional zur
  Dauer, das aktuelle wird hervorgehoben, erledigte werden gefüllt.
- ✏️ **Animierte Skizze** je Übung (SVG-Figur, die die Bewegung vorführt) plus
  kurzer Bewegungshinweis.
- 📱 **Responsiv** und **offline lauffähig** – keine externen Abhängigkeiten.

## Das Programm

| # | Übung | Dauer |
|---|-------|-------|
| 1 | Lymphatische Sprünge | 1 min |
| 2 | Bodywaves | 1 min |
| 3 | Hüftdrehungen | 1 min |
| 4 | Armschwünge | 1 min |
| 5 | Tote Arme | 1 min |
| 6 | Golfschwünge | 1 min |
| 7 | Marschieren | 1 min |
| 8 | Ballett-Squats | 1 min |
| 9 | Tiefe Halteposition (Abschluss) | 1 min |

Zwischen allen Segmenten liegen 10 Sekunden Pause → Gesamtdauer **10:20 min**.

## Bedienung

1. `index.html` im Browser öffnen.
2. Auf **▶ Training starten** klicken.
3. Den Anweisungen folgen – die App wechselt automatisch zwischen Übung und Pause.

**Tastatur:** Leertaste = Pause/Weiter.

> Ton wird aus technischen Gründen (Autoplay-Regeln der Browser) erst nach dem
> ersten Klick aktiv – der Start-Klick genügt.

## Lokal starten

Ein Doppelklick auf `index.html` reicht in der Regel. Falls der Browser lokale
Skripte blockiert, einen einfachen Server starten:

```bash
python -m http.server 8000
```

Dann `http://localhost:8000` öffnen.

## Übungen anpassen

Alle Übungen, Beschreibungen und Dauern stehen in [`exercises.js`](exercises.js).
Die zugehörigen Skizzen liegen in [`sketches.js`](sketches.js). Details siehe
[`CLAUDE.md`](CLAUDE.md).

## Hinweis

Diese App dient der allgemeinen Bewegung und ist **kein medizinischer Rat**. Bei
gesundheitlichen Einschränkungen vor dem Training ärztlichen Rat einholen.
