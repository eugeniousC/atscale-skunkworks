import { Resvg } from "@resvg/resvg-js";

/* atScale — Scaling Journey Map generator.
 * Hand-authored SVG → PNG so labels stay pixel-crisp (generative models mangle text).
 * One PNG per Scale Readiness tier; the active node glows + carries the YOU ARE HERE marker.
 * Charcoal + bronze, matched to the site's Charcoal Placard v2 system.
 */

const TIERS = [
  { key: "grind",      name: "THE GRIND",      band: "10–19" },
  { key: "plateau",    name: "THE PLATEAU",    band: "20–27" },
  { key: "inflection", name: "THE INFLECTION", band: "28–34" },
  { key: "machine",    name: "THE MACHINE",    band: "35–40" },
];

// Palette (Charcoal Placard v2)
const C = {
  card:    "#12161C",
  border:  "#2A323D",
  bronze:  "#C8893B",
  bronzeD: "#8A5B22",
  ink:     "#F2F5F8",
  body:    "#AEB8C4",
  slate:   "#7E8A98",
  nodeOff: "#1E2530",
  nodeOffStroke: "#3A4452",
  rust:    "#E0674A",
};

const NODE_X = [86, 236, 386, 524];
const TRACK_Y = 128;
const WALL_X = (NODE_X[1] + NODE_X[2]) / 2; // between Plateau and Inflection

function seg(x1: number, x2: number, traveled: boolean, dashed: boolean) {
  const stroke = traveled ? C.bronze : C.border;
  const op = traveled ? "0.9" : "1";
  const dash = dashed ? ` stroke-dasharray="2 5"` : "";
  return `<line x1="${x1}" y1="${TRACK_Y}" x2="${x2}" y2="${TRACK_Y}" stroke="${stroke}" stroke-opacity="${op}" stroke-width="3" stroke-linecap="round"${dash}/>`;
}

function node(i: number, active: number) {
  const x = NODE_X[i];
  const t = TIERS[i];
  let circle: string;
  if (i === active) {
    circle = `<circle cx="${x}" cy="${TRACK_Y}" r="13" fill="${C.bronze}" filter="url(#glow)"/><circle cx="${x}" cy="${TRACK_Y}" r="6" fill="${C.card}"/>`;
  } else if (i < active) {
    circle = `<circle cx="${x}" cy="${TRACK_Y}" r="9" fill="${C.bronzeD}"/>`;
  } else {
    circle = `<circle cx="${x}" cy="${TRACK_Y}" r="9" fill="${C.nodeOff}" stroke="${C.nodeOffStroke}" stroke-width="1.5"/>`;
  }
  const nameColor = i === active ? C.ink : C.body;
  const nameWeight = i === active ? "700" : "500";
  const name = `<text x="${x}" y="162" text-anchor="middle" font-family="Lato" font-size="12.5" font-weight="${nameWeight}" fill="${nameColor}" letter-spacing="0.4">${t.name}</text>`;
  const band = `<text x="${x}" y="179" text-anchor="middle" font-family="DejaVu Sans Mono" font-size="9.5" fill="${i === active ? C.bronze : C.slate}">${t.band}</text>`;
  return circle + name + band;
}

function youAreHere(active: number) {
  const x = NODE_X[active];
  return `
    <text x="${x}" y="86" text-anchor="middle" font-family="DejaVu Sans Mono" font-size="10" fill="${C.bronze}" letter-spacing="2">YOU ARE HERE</text>
    <path d="M ${x - 6} 96 L ${x + 6} 96 L ${x} 105 Z" fill="${C.bronze}"/>`;
}

function wall() {
  return `
    <line x1="${WALL_X}" y1="106" x2="${WALL_X}" y2="150" stroke="${C.rust}" stroke-width="2" stroke-dasharray="3 4" stroke-opacity="0.85"/>
    <text x="${WALL_X}" y="206" text-anchor="middle" font-family="DejaVu Sans Mono" font-size="8.5" fill="${C.rust}" letter-spacing="1.5">THE REPLICATION WALL</text>`;
}

function buildSVG(active: number) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 260">
  <defs>
    <filter id="glow" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="6" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect x="4" y="4" width="592" height="252" rx="16" fill="${C.card}" stroke="${C.border}" stroke-width="1"/>
  <rect x="4" y="4" width="592" height="252" rx="16" fill="none" stroke="#FFFFFF" stroke-opacity="0.04" stroke-width="1"/>
  <text x="300" y="40" text-anchor="middle" font-family="DejaVu Sans Mono" font-size="12" fill="${C.bronze}" letter-spacing="4">YOUR SCALING JOURNEY</text>
  ${seg(NODE_X[0], NODE_X[1], active >= 1, false)}
  ${seg(NODE_X[1], NODE_X[2], active >= 2, true)}
  ${seg(NODE_X[2], NODE_X[3], active >= 3, false)}
  ${wall()}
  ${[0, 1, 2, 3].map((i) => node(i, active)).join("\n  ")}
  ${youAreHere(active)}
  <text x="300" y="234" text-anchor="middle" font-family="Lato" font-size="10.5" fill="${C.slate}">Most $3M–$30M owners stall at the Wall — it's also the most fixable thing in the business.</text>
</svg>`;
}

const OUT = process.argv[2] || "/tmp/journeygen/out";
for (let i = 0; i < TIERS.length; i++) {
  const svg = buildSVG(i);
  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: 1200 }, background: "transparent" });
  const png = resvg.render().asPng();
  const path = `${OUT}/journey-${TIERS[i].key}.png`;
  await Bun.write(path, png);
  console.log("wrote", path);
}
