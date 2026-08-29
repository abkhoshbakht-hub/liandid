const fs = require('fs');
const html = fs.readFileSync('D:/MyProgect/liandid/public/maps/bushehr-fa.svg', 'utf8');

const COUNTIES = [
  { id: 'asaluyeh', cx: 556.185, cy: 730.83 },
  { id: 'kangan', cx: 497.051, cy: 647.412 },
  { id: 'jam', cx: 435.13, cy: 639.144 },
  { id: 'dayer', cx: 406.173, cy: 638.021 },
  { id: 'tangestan', cx: 289.014, cy: 434.102 },
  { id: 'dashtestan', cx: 267.108, cy: 374.442 },
  { id: 'booshehr', cx: 180.714, cy: 360.5 },
  { id: 'kharg', cx: 256.834, cy: 279.253 },
  { id: 'genaveh', cx: 108.551, cy: 196.771 },
  { id: 'deylam', cx: 34.133, cy: 76.286 },
  { id: 'dashti', cx: 340, cy: 510 },
];

function dist(x1, y1, x2, y2) {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

function nearestCounty(x, y) {
  let best = null, bestD = Infinity;
  for (const c of COUNTIES) {
    const d = dist(x, y, c.cx, c.cy);
    if (d < bestD) { bestD = d; best = c.id; }
  }
  return best;
}

const polyRegex = /<polygon[^>]*points="([^"]+)"[^>]*>/g;
let match;
let i = 0;

while ((match = polyRegex.exec(html)) !== null) {
  const pts = match[1].trim().split(/[\s,]+/).map(Number);
  let sx = 0, sy = 0, n = 0;
  for (let j = 0; j < pts.length - 1; j += 2) {
    if (!isNaN(pts[j]) && !isNaN(pts[j+1])) { sx += pts[j]; sy += pts[j+1]; n++; }
  }
  const mx = n > 0 ? sx / n : 0;
  const my = n > 0 ? sy / n : 0;
  const county = nearestCounty(mx, my);

  // Show ALL polygons
  const distances = COUNTIES.map(c => ({ id: c.id, d: dist(mx, my, c.cx, c.cy).toFixed(0) })).sort((a,b) => a.d - b.d);
  const fill = (match[0].match(/fill="([^"]+)"/) || [])[1] || '?';
  
  console.log(`#${i.toString().padStart(2)} [${fill}] center(${mx.toFixed(0)}, ${my.toFixed(0)}) → ${county.padEnd(12)} | top3: ${distances.slice(0,3).map(d => `${d.id}=${d.d}`).join(', ')}`);
  i++;
}
