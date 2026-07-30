/*
 * sketches.js
 * Illustrierte Flat-Design-Figuren (Inline-SVG) je Segment.
 *
 * - viewBox 0 0 140 200 (Hochformat), damit alle Figuren gleich skalieren.
 * - Eigene Comic-Farbwelt (Haut, Haare, Shirt, Hose) statt currentColor.
 * - Bewegte Teile stecken in Gruppen (fl-fig / fl-upper / fl-lower /
 *   fl-armL/R / fl-legL/R). @keyframes und Drehpunkte liegen in styles.css,
 *   ausgewaehlt ueber die Wurzelklasse "anim-fl-<key>" am <svg>.
 *
 * Der Schluessel entspricht dem Feld "sketch" in exercises.js
 * (+ "pause" fuer die Pausen-Segmente).
 */

const C = {
  skin:  '#e8b48f',
  hair:  '#42301f',
  shirt: '#4a86c5',
  shorts:'#2f3a4a',
  shoe:  '#20232b',
  eye:   '#3a2a20',
};

// Kopf inkl. Haare und angedeuteter Augen.
const HEAD = `
  <circle cx="70" cy="34" r="16" fill="${C.skin}"/>
  <path d="M53 35 Q54 14 70 14 Q86 14 87 35 Q80 23 70 23 Q60 23 53 35 Z" fill="${C.hair}"/>
  <circle cx="64" cy="34" r="2" fill="${C.eye}"/>
  <circle cx="76" cy="34" r="2" fill="${C.eye}"/>`;

// Torso / Shirt.
const TORSO = `<path d="M53 58 Q70 50 87 58 L84 104 Q70 110 56 104 Z" fill="${C.shirt}"/>`;

// Shorts ueber der Huefte.
const SHORTS = `<path d="M53 100 h34 v13 l-5 13 h-8 l-4 -12 -4 12 h-8 l-5 -13 z" fill="${C.shorts}"/>`;

// --- Beine ---
function legsNormal() {
  return `
    <path d="M64 118 L60 176" fill="none" stroke="${C.skin}" stroke-width="13" stroke-linecap="round"/>
    <path d="M76 118 L80 176" fill="none" stroke="${C.skin}" stroke-width="13" stroke-linecap="round"/>
    <ellipse cx="59" cy="178" rx="8" ry="4" fill="${C.shoe}"/>
    <ellipse cx="81" cy="178" rx="8" ry="4" fill="${C.shoe}"/>`;
}
function legsWide() {
  return `
    <path d="M64 116 L48 172" fill="none" stroke="${C.skin}" stroke-width="13" stroke-linecap="round"/>
    <path d="M76 116 L92 172" fill="none" stroke="${C.skin}" stroke-width="13" stroke-linecap="round"/>
    <ellipse cx="47" cy="174" rx="8" ry="4" fill="${C.shoe}"/>
    <ellipse cx="93" cy="174" rx="8" ry="4" fill="${C.shoe}"/>`;
}
function legsMarch() {
  return `
    <g class="fl-legL"><path d="M67 118 L64 176" fill="none" stroke="${C.skin}" stroke-width="13" stroke-linecap="round"/><ellipse cx="63" cy="178" rx="8" ry="4" fill="${C.shoe}"/></g>
    <g class="fl-legR"><path d="M73 118 L76 176" fill="none" stroke="${C.skin}" stroke-width="13" stroke-linecap="round"/><ellipse cx="77" cy="178" rx="8" ry="4" fill="${C.shoe}"/></g>`;
}

// --- Arme (Hand als Kreis am Ende) ---
function hand(x, y) { return `<circle cx="${x}" cy="${y}" r="5.5" fill="${C.skin}"/>`; }
function armStraight(side, cls) {
  const sx = side === 'L' ? 55 : 85;
  return `<g class="fl-arm${side}${cls ? ' ' + cls : ''}">
    <path d="M${sx} 62 L${sx} 100" fill="none" stroke="${C.skin}" stroke-width="11" stroke-linecap="round"/>
    <path d="M${sx} 62 L${sx} 78" fill="none" stroke="${C.shirt}" stroke-width="13" stroke-linecap="round"/>
    ${hand(sx, 101)}</g>`;
}
function armOut(side) {
  const L = side === 'L';
  const sx = L ? 55 : 85, ex = L ? 44 : 96, hx = L ? 51 : 89;
  return `<g class="fl-arm${side}">
    <path d="M${sx} 62 L${ex} 92" fill="none" stroke="${C.skin}" stroke-width="11" stroke-linecap="round"/>
    <path d="M${sx} 62 L${hx} 78" fill="none" stroke="${C.shirt}" stroke-width="13" stroke-linecap="round"/>
    ${hand(ex, 93)}</g>`;
}
function armUp(side) {
  const L = side === 'L';
  const sx = L ? 55 : 85, ex = L ? 40 : 100;
  return `<path d="M${sx} 62 Q${L ? 44 : 96} 46 ${ex} 36" fill="none" stroke="${C.skin}" stroke-width="11" stroke-linecap="round"/>${hand(ex, 35)}`;
}
function armHip(side) {
  const L = side === 'L';
  const sx = L ? 55 : 85;
  return `<path d="M${sx} 62 Q${L ? 46 : 94} 82 ${L ? 60 : 80} 100" fill="none" stroke="${C.skin}" stroke-width="10" stroke-linecap="round"/>`;
}
function armHold(side) {
  const L = side === 'L';
  const sx = L ? 55 : 85;
  return `<path d="M${sx} 62 Q${L ? 52 : 88} 80 ${L ? 66 : 74} 90" fill="none" stroke="${C.skin}" stroke-width="10" stroke-linecap="round"/>`;
}
function armGolf(side) {
  const L = side === 'L';
  const sx = L ? 55 : 85;
  return `<path d="M${sx} 62 Q${L ? 74 : 90} 48 96 38" fill="none" stroke="${C.skin}" stroke-width="10" stroke-linecap="round"/>`;
}
function armHang(side) {
  const L = side === 'L';
  const sx = L ? 55 : 85;
  return `<g class="fl-arm${side}"><path d="M${sx} 62 Q${L ? 58 : 82} 82 ${L ? 55 : 85} 100" fill="none" stroke="${C.skin}" stroke-width="11" stroke-linecap="round"/>${hand(L ? 55 : 85, 101)}</g>`;
}

// Zusammenbau einer Figur.
function fig(key, lower, upperArms, opts) {
  opts = opts || {};
  const legs = opts.legs || legsNormal();
  return `
    <svg viewBox="0 0 140 200" class="sketch-svg anim-fl-${key}" aria-hidden="true">
      <g class="fl-fig">
        <g class="fl-lower">${legs}${SHORTS}</g>
        <g class="fl-upper">${TORSO}${upperArms}${HEAD}</g>
      </g>
    </svg>`;
}

const SKETCHES = {
  // 1 Lymphatische Spruenge: ganze Figur federt (Beine zusammen, Arme leicht aussen)
  spruenge: fig('spruenge', null, armOut('L') + armOut('R')),

  // 2 Bodywaves: Oberkoerper wogt, Arme erhoben
  bodywaves: fig('bodywaves', null, armUp('L') + armUp('R')),

  // 3 Hueftdrehungen: Haende in die Huefte, Huefte kreist
  hueftdrehungen: fig('hueftdrehungen', null, armHip('L') + armHip('R')),

  // 4 Armschwuenge: Arme schwingen gegengleich
  armschwuenge: fig('armschwuenge', null, armStraight('L') + armStraight('R')),

  // 5 Tote Arme: Oberkoerper dreht, lose Arme schwingen mit
  'tote-arme': fig('tote-arme', null, armHang('L') + armHang('R')),

  // 6 Golfschwuenge: Rumpf rotiert, Arme diagonal nach oben
  golfschwuenge: fig('golfschwuenge', null, armGolf('L') + armGolf('R')),

  // 7 Marschieren: Beine abwechselnd, Arme gegengleich
  marschieren: fig('marschieren', null, armStraight('L') + armStraight('R'), { legs: legsMarch() }),

  // 8 Ballett-Squats: breiter Stand, tief und hoch, Arme geoeffnet
  'ballett-squats': fig('ballett-squats', null, armOut('L') + armOut('R'), { legs: legsWide() }),

  // 9 Tiefe Halteposition: breiter Stand, Haende vor der Brust, ruhiges Atmen
  halteposition: fig('halteposition', null, armHold('L') + armHold('R'), { legs: legsWide() }),

  // Pause: entspanntes Stehen, ruhiges Atmen
  pause: fig('pause', null, armStraight('L') + armStraight('R')),
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SKETCHES };
}
