/*
 * exercises.js
 * Programm-Datenmodell fuer "10 Minuten fuer mehr Fitness".
 *
 * Die Uebungen stammen aus einem Tai-Chi/Qigong-inspirierten Instagram-Reel.
 * Jedes Uebungs-Segment hat eine feste Dauer (Sekunden). Pausen werden NICHT
 * hier eingetragen, sondern zur Laufzeit aus PAUSE_DAUER zwischen den Uebungen
 * erzeugt (siehe app.js -> buildTimeline).
 *
 * Zum Anpassen: Dauer aendern, Uebung ergaenzen/entfernen oder Beschreibung
 * umformulieren. Der Wert bei "sketch" muss einem Schluessel in SKETCHES
 * (sketches.js) entsprechen.
 */

// Pause zwischen zwei Segmenten (in Sekunden).
const PAUSE_DAUER = 10;

// Reihenfolge = Ablauf im Workout.
const PROGRAM = [
  {
    id: 1,
    name: 'Lymphatische Sprünge',
    beschreibung: 'Locker aus den Fußballen auf der Stelle federn, Arme hängen entspannt. Bringt den Kreislauf und das Lymphsystem sanft in Schwung.',
    hinweis: 'Locker federn · hoch–runter',
    dauer: 60,
    sketch: 'spruenge',
  },
  {
    id: 2,
    name: 'Bodywaves',
    beschreibung: 'Eine weiche Welle durch den ganzen Körper laufen lassen – von den Knien über die Hüfte bis in die Wirbelsäule. Mobilisiert den Rumpf.',
    hinweis: 'Welle von unten nach oben',
    dauer: 60,
    sketch: 'bodywaves',
  },
  {
    id: 3,
    name: 'Hüftdrehungen',
    beschreibung: 'Im leichten Stand die Hüfte kreisen lassen, Oberkörper bleibt ruhig. Löst den unteren Rücken und mobilisiert die Hüftgelenke.',
    hinweis: 'Hüfte kreisen · rundherum',
    dauer: 60,
    sketch: 'hueftdrehungen',
  },
  {
    id: 4,
    name: 'Armschwünge',
    beschreibung: 'Die Arme locker vor und zurück schwingen und den Oberkörper leicht mitdrehen. Öffnet Schultern und Brustkorb.',
    hinweis: 'Arme schwingen · vor–zurück',
    dauer: 60,
    sketch: 'armschwuenge',
  },
  {
    id: 5,
    name: 'Tote Arme',
    beschreibung: 'Arme völlig entspannt hängen lassen und durch Drehen des Rumpfes um den Körper schlackern lassen. Löst Verspannungen in Schultern und Nacken.',
    hinweis: 'Rumpf drehen · Arme locker',
    dauer: 60,
    sketch: 'tote-arme',
  },
  {
    id: 6,
    name: 'Golfschwünge',
    beschreibung: 'Wie beim Golf-Abschlag den Oberkörper rotieren und die Arme diagonal nach oben führen. Trainiert Rumpfrotation und Gleichgewicht.',
    hinweis: 'Rumpf rotieren · diagonal hoch',
    dauer: 60,
    sketch: 'golfschwuenge',
  },
  {
    id: 7,
    name: 'Marschieren',
    beschreibung: 'Auf der Stelle marschieren, Knie bewusst anheben, Arme gegengleich mitschwingen. Aktiviert Beine und Koordination.',
    hinweis: 'Auf der Stelle · Knie hoch',
    dauer: 60,
    sketch: 'marschieren',
  },
  {
    id: 8,
    name: 'Ballett-Squats',
    beschreibung: 'Breiter Stand, Fußspitzen nach außen, tief in die Knie gehen und die Arme weit öffnen. Kräftigt Beine und Körpermitte.',
    hinweis: 'Tief in die Knie · tief–hoch',
    dauer: 60,
    sketch: 'ballett-squats',
  },
  {
    id: 9,
    name: 'Tiefe Halteposition',
    beschreibung: 'Zum Abschluss ruhig im tiefen Stand verweilen, Hände vor der Brust, ruhig atmen. Verankert Kraft, Ruhe und Lebensenergie.',
    hinweis: 'Ruhig halten · gleichmäßig atmen',
    dauer: 60,
    sketch: 'halteposition',
  },
];

// Fuer Node/Tests exportierbar, im Browser als globale Konstanten verfuegbar.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PROGRAM, PAUSE_DAUER };
}
