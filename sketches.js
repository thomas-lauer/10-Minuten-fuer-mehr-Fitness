/*
 * sketches.js
 * Animierte, handgezeichnet wirkende Strichfiguren (Inline-SVG) je Segment.
 *
 * - viewBox 0 0 100 130, damit alle Figuren gleich skalieren.
 * - Alle Linien nutzen "currentColor" -> Farbe kommt aus dem CSS (theme-faehig).
 * - Bewegte Teile stecken in Gruppen mit Klassen "sk-*"; die eigentliche
 *   Animation (@keyframes) und der Drehpunkt (transform-origin) liegen in
 *   styles.css und werden ueber die Wurzelklasse "anim-<key>" ausgewaehlt.
 *   So bleibt das SVG-Markup schlank und die Bewegung zentral steuerbar.
 *
 * Der Schluessel entspricht dem Feld "sketch" in exercises.js.
 * Zusaetzlich gibt es einen "pause"-Key fuer die Pausen-Segmente.
 */

const SK_ATTRS = 'fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"';

const SKETCHES = {
  // 1 Lymphatische Spruenge: ganze Figur federt hoch/runter ueber dem Boden.
  spruenge: `
    <svg viewBox="0 0 100 130" class="sketch-svg anim-spruenge" aria-hidden="true">
      <line x1="26" y1="114" x2="74" y2="114" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.3"/>
      <g class="sk-fig" ${SK_ATTRS}>
        <circle cx="50" cy="20" r="9"/>
        <path d="M50 29 L50 66"/>
        <path d="M50 40 Q42 50 41 60"/>
        <path d="M50 40 Q58 50 59 60"/>
        <path d="M50 66 L45 98"/>
        <path d="M50 66 L55 98"/>
      </g>
    </svg>`,

  // 2 Bodywaves: Oberkoerper wogt (Rotation + sanftes Heben) -> Wellenbewegung.
  bodywaves: `
    <svg viewBox="0 0 100 130" class="sketch-svg anim-bodywaves" aria-hidden="true">
      <g class="sk-fig" ${SK_ATTRS}>
        <path d="M50 66 L45 98"/>
        <path d="M50 66 L55 98"/>
        <g class="sk-upper">
          <circle cx="50" cy="20" r="9"/>
          <path d="M50 29 L50 66"/>
          <path d="M50 40 Q40 34 34 26"/>
          <path d="M50 40 Q60 34 66 26"/>
        </g>
      </g>
    </svg>`,

  // 3 Hueftdrehungen: Huefte/Beine kreisen, Oberkoerper bleibt ruhig.
  hueftdrehungen: `
    <svg viewBox="0 0 100 130" class="sketch-svg anim-hueftdrehungen" aria-hidden="true">
      <ellipse cx="50" cy="70" rx="22" ry="9" fill="none" stroke="currentColor" stroke-width="2" opacity="0.35" stroke-dasharray="4 5"/>
      <g ${SK_ATTRS}>
        <circle cx="50" cy="20" r="9"/>
        <path d="M50 29 L50 60"/>
        <path d="M50 38 Q42 46 40 56"/>
        <path d="M50 38 Q58 46 60 56"/>
        <g class="sk-hip">
          <path d="M50 60 L45 92"/>
          <path d="M50 60 L55 92"/>
        </g>
      </g>
    </svg>`,

  // 4 Armschwuenge: beide Arme schwingen gegengleich um die Schulter.
  armschwuenge: `
    <svg viewBox="0 0 100 130" class="sketch-svg anim-armschwuenge" aria-hidden="true">
      <g ${SK_ATTRS}>
        <circle cx="50" cy="20" r="9"/>
        <path d="M50 29 L50 66"/>
        <path d="M50 66 L45 98"/>
        <path d="M50 66 L55 98"/>
        <g class="sk-arm-r"><path d="M50 40 L50 66"/></g>
        <g class="sk-arm-l"><path d="M50 40 L50 66"/></g>
      </g>
    </svg>`,

  // 5 Tote Arme: Oberkoerper dreht hin und her, die losen Arme schlackern mit.
  'tote-arme': `
    <svg viewBox="0 0 100 130" class="sketch-svg anim-tote-arme" aria-hidden="true">
      <g ${SK_ATTRS}>
        <path d="M50 66 L45 98"/>
        <path d="M50 66 L55 98"/>
        <g class="sk-twist">
          <circle cx="50" cy="20" r="9"/>
          <path d="M50 29 L50 66"/>
          <path d="M50 40 Q47 54 48 64"/>
          <path d="M50 40 Q53 54 52 64"/>
        </g>
      </g>
    </svg>`,

  // 6 Golfschwuenge: Rumpf rotiert, Arme diagonal nach oben mitgefuehrt.
  golfschwuenge: `
    <svg viewBox="0 0 100 130" class="sketch-svg anim-golfschwuenge" aria-hidden="true">
      <g ${SK_ATTRS}>
        <path d="M50 66 L43 98"/>
        <path d="M50 66 L57 98"/>
        <g class="sk-golf">
          <circle cx="50" cy="22" r="9"/>
          <path d="M50 31 L50 66"/>
          <path d="M50 44 Q64 40 74 28"/>
          <path d="M50 44 Q60 40 74 28"/>
        </g>
      </g>
    </svg>`,

  // 7 Marschieren: Beine heben abwechselnd, Arme schwingen gegengleich.
  marschieren: `
    <svg viewBox="0 0 100 130" class="sketch-svg anim-marschieren" aria-hidden="true">
      <g ${SK_ATTRS}>
        <circle cx="50" cy="20" r="9"/>
        <path d="M50 29 L50 66"/>
        <g class="sk-arm-r"><path d="M50 40 L50 64"/></g>
        <g class="sk-arm-l"><path d="M50 40 L50 64"/></g>
        <g class="sk-leg-r"><path d="M50 66 L50 98"/></g>
        <g class="sk-leg-l"><path d="M50 66 L50 98"/></g>
      </g>
    </svg>`,

  // 8 Ballett-Squats: breiter Stand, Figur geht tief und wieder hoch.
  'ballett-squats': `
    <svg viewBox="0 0 100 130" class="sketch-svg anim-ballett-squats" aria-hidden="true">
      <g class="sk-fig" ${SK_ATTRS}>
        <circle cx="50" cy="22" r="9"/>
        <path d="M50 31 L50 64"/>
        <path d="M50 40 Q34 42 22 34"/>
        <path d="M50 40 Q66 42 78 34"/>
        <path d="M50 64 Q34 72 30 92 L24 104"/>
        <path d="M50 64 Q66 72 70 92 L76 104"/>
      </g>
    </svg>`,

  // 9 Tiefe Halteposition: ruhiger tiefer Stand, Haende vor der Brust, Atmen.
  halteposition: `
    <svg viewBox="0 0 100 130" class="sketch-svg anim-halteposition" aria-hidden="true">
      <g class="sk-fig" ${SK_ATTRS}>
        <circle cx="50" cy="22" r="9"/>
        <path d="M50 31 L50 66"/>
        <path d="M50 42 Q42 48 48 55"/>
        <path d="M50 42 Q58 48 52 55"/>
        <path d="M50 66 Q36 74 34 92 L30 104"/>
        <path d="M50 66 Q64 74 66 92 L70 104"/>
      </g>
    </svg>`,

  // Pause: entspanntes Stehen mit ruhiger Atembewegung.
  pause: `
    <svg viewBox="0 0 100 130" class="sketch-svg anim-pause" aria-hidden="true">
      <g class="sk-fig" ${SK_ATTRS}>
        <circle cx="50" cy="24" r="9"/>
        <path d="M50 33 L50 72"/>
        <path d="M50 44 Q41 54 41 66"/>
        <path d="M50 44 Q59 54 59 66"/>
        <path d="M50 72 L45 102"/>
        <path d="M50 72 L55 102"/>
      </g>
      <g stroke="currentColor" fill="none" stroke-linecap="round">
        <path class="sk-breath" d="M66 18 q9 -2 9 6 t-9 6" stroke-width="2" opacity="0.5"/>
      </g>
    </svg>`,
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SKETCHES };
}
