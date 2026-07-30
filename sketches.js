/*
 * sketches.js
 * Handgezeichnet wirkende Strichmaennchen-Skizzen (Inline-SVG) je Segment.
 *
 * - viewBox 0 0 100 130, damit alle Figuren gleich skalieren.
 * - Alle Linien nutzen "currentColor" -> Farbe kommt aus dem CSS (theme-faehig).
 * - stroke-linecap/linejoin "round" + leicht unregelmaessige Pfade = Sketch-Look.
 *
 * Der Schluessel entspricht dem Feld "sketch" in exercises.js.
 * Zusaetzlich gibt es einen "pause"-Key fuer die Pausen-Segmente.
 */

const SKETCHES = {
  // Lymphatische Spruenge: Figur federt hoch, Fuesse ueber dem Boden.
  spruenge: `
    <svg viewBox="0 0 100 130" class="sketch-svg" aria-hidden="true">
      <g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="50" cy="24" r="10"/>
        <path d="M50 34 Q49 55 50 72"/>
        <path d="M50 42 Q38 40 32 30"/>
        <path d="M50 42 Q62 40 68 30"/>
        <path d="M50 72 Q41 88 40 100"/>
        <path d="M50 72 Q59 88 60 100"/>
        <path d="M28 24 q4 -6 8 0" stroke-width="2.5"/>
        <path d="M64 24 q4 -6 8 0" stroke-width="2.5"/>
        <path d="M50 112 q-10 4 -20 3" stroke-width="2" opacity="0.55"/>
        <path d="M50 112 q10 4 20 3" stroke-width="2" opacity="0.55"/>
      </g>
    </svg>`,

  // Bodywaves: wellenfoermige Wirbelsaeule.
  bodywaves: `
    <svg viewBox="0 0 100 130" class="sketch-svg" aria-hidden="true">
      <g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="46" cy="22" r="10"/>
        <path d="M48 32 Q60 44 44 56 Q30 68 48 80 Q62 90 50 104"/>
        <path d="M50 46 Q64 46 72 38"/>
        <path d="M46 58 Q32 60 26 52"/>
        <path d="M50 104 Q42 116 40 124"/>
        <path d="M50 104 Q58 116 60 124"/>
        <path d="M74 30 q6 8 0 16" stroke-width="2" opacity="0.5"/>
      </g>
    </svg>`,

  // Hueftdrehungen: Haende in die Huefte, Kreispfeil um die Huefte.
  hueftdrehungen: `
    <svg viewBox="0 0 100 130" class="sketch-svg" aria-hidden="true">
      <g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="50" cy="20" r="9"/>
        <path d="M50 29 L50 66"/>
        <path d="M50 40 Q40 50 36 62"/>
        <path d="M50 40 Q60 50 64 62"/>
        <path d="M50 66 L42 96"/>
        <path d="M50 66 L58 96"/>
        <path d="M24 74 a26 12 0 1 0 52 0 a26 12 0 1 0 -52 0" stroke-width="2" opacity="0.6" stroke-dasharray="4 5"/>
        <path d="M72 70 l6 6 -8 2" stroke-width="2" opacity="0.6"/>
      </g>
    </svg>`,

  // Armschwuenge: ein Arm vorn, einer hinten, Schwungboegen.
  armschwuenge: `
    <svg viewBox="0 0 100 130" class="sketch-svg" aria-hidden="true">
      <g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="50" cy="22" r="9"/>
        <path d="M50 31 L50 72"/>
        <path d="M50 40 Q64 46 74 40"/>
        <path d="M50 40 Q36 46 28 54"/>
        <path d="M50 72 L42 104"/>
        <path d="M50 72 L58 104"/>
        <path d="M26 60 q-6 -12 4 -22" stroke-width="2" opacity="0.55"/>
        <path d="M78 34 q8 10 2 22" stroke-width="2" opacity="0.55"/>
      </g>
    </svg>`,

  // Tote Arme: Arme haengen lose, Rotationspfeil um den Rumpf.
  'tote-arme': `
    <svg viewBox="0 0 100 130" class="sketch-svg" aria-hidden="true">
      <g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="50" cy="20" r="9"/>
        <path d="M50 29 L50 70"/>
        <path d="M50 38 Q60 54 58 66"/>
        <path d="M50 38 Q40 54 42 66"/>
        <path d="M50 70 L43 100"/>
        <path d="M50 70 L57 100"/>
        <path d="M30 44 q40 -10 40 6" stroke-width="2" opacity="0.5" stroke-dasharray="4 5"/>
        <path d="M70 46 l2 8 -8 -3" stroke-width="2" opacity="0.5"/>
      </g>
    </svg>`,

  // Golfschwuenge: Rumpf rotiert, Arme diagonal nach oben.
  golfschwuenge: `
    <svg viewBox="0 0 100 130" class="sketch-svg" aria-hidden="true">
      <g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="46" cy="24" r="9"/>
        <path d="M47 33 Q52 52 50 70"/>
        <path d="M49 44 Q66 40 76 26"/>
        <path d="M49 44 Q60 40 76 26"/>
        <path d="M50 70 L42 100"/>
        <path d="M50 70 L60 98"/>
        <path d="M30 92 q22 -14 44 -2" stroke-width="2" opacity="0.5" stroke-dasharray="4 5"/>
      </g>
    </svg>`,

  // Marschieren: ein Knie hoch, Arme gegengleich gebeugt.
  marschieren: `
    <svg viewBox="0 0 100 130" class="sketch-svg" aria-hidden="true">
      <g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="50" cy="20" r="9"/>
        <path d="M50 29 L50 68"/>
        <path d="M50 40 Q60 48 58 60"/>
        <path d="M50 40 Q40 48 44 60"/>
        <path d="M50 68 Q40 76 42 86 L46 100"/>
        <path d="M50 68 L56 100"/>
      </g>
    </svg>`,

  // Ballett-Squats: breiter Plie-Stand, Arme weit geoeffnet.
  'ballett-squats': `
    <svg viewBox="0 0 100 130" class="sketch-svg" aria-hidden="true">
      <g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="50" cy="22" r="9"/>
        <path d="M50 31 L50 66"/>
        <path d="M50 40 Q34 42 22 34"/>
        <path d="M50 40 Q66 42 78 34"/>
        <path d="M50 66 Q34 74 30 92 L24 104"/>
        <path d="M50 66 Q66 74 70 92 L76 104"/>
      </g>
    </svg>`,

  // Tiefe Halteposition: ruhiger tiefer Stand, Haende vor der Brust.
  halteposition: `
    <svg viewBox="0 0 100 130" class="sketch-svg" aria-hidden="true">
      <g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="50" cy="22" r="9"/>
        <path d="M50 31 L50 68"/>
        <path d="M50 42 Q42 48 48 56"/>
        <path d="M50 42 Q58 48 52 56"/>
        <path d="M50 68 Q36 76 34 94 L30 106"/>
        <path d="M50 68 Q64 76 66 94 L70 106"/>
        <path d="M40 14 q10 -8 20 0" stroke-width="2" opacity="0.5"/>
      </g>
    </svg>`,

  // Pause: entspanntes Stehen, Atem-Wellen.
  pause: `
    <svg viewBox="0 0 100 130" class="sketch-svg" aria-hidden="true">
      <g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="50" cy="26" r="9"/>
        <path d="M50 35 L50 74"/>
        <path d="M50 46 Q40 56 40 68"/>
        <path d="M50 46 Q60 56 60 68"/>
        <path d="M50 74 L44 104"/>
        <path d="M50 74 L56 104"/>
        <path d="M64 14 q8 -2 8 6 t-8 6" stroke-width="2" opacity="0.55"/>
        <path d="M70 26 q10 -2 10 7 t-10 7" stroke-width="2" opacity="0.4"/>
      </g>
    </svg>`,
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SKETCHES };
}
