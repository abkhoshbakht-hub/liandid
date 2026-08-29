const fs = require('fs');
const html = fs.readFileSync('D:/MyProgect/liandid/public/maps/bushehr-fa.svg', 'utf8');

function bboxAndCentroid(nums) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (let i = 0; i < nums.length - 1; i += 2) {
    const x = nums[i], y = nums[i+1];
    if (isNaN(x) || isNaN(y)) continue;
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
  }
  return { minX, minY, maxX, maxY, cx: (minX+maxX)/2, cy: (minY+maxY)/2 };
}

// POLYGONS
console.log('=== POLYGONS ===');
const polyRegex = /<polygon([^>]*)>/g;
let m, i = 0;
while ((m = polyRegex.exec(html)) !== null) {
  const attrs = m[1];
  const fill = (attrs.match(/fill="([^"]+)"/) || [])[1] || '?';
  const ptsStr = (attrs.match(/points="([^"]+)"/) || [])[1] || '';
  const nums = ptsStr.trim().split(/[\s,]+/).map(Number);
  let sx=0, sy=0, n=0;
  for (let j = 0; j < nums.length-1; j += 2) { if(!isNaN(nums[j])) { sx+=nums[j]; sy+=nums[j+1]; n++; } }
  const b = bboxAndCentroid(nums);
  console.log(`P#${String(i).padStart(2)} fill=${fill} vcount=${n} centroid=(${(sx/n).toFixed(0)},${(sy/n).toFixed(0)}) bbox=(${b.minX.toFixed(0)},${b.minY.toFixed(0)})..(${b.maxX.toFixed(0)},${b.maxY.toFixed(0)}) size=${(b.maxX-b.minX).toFixed(0)}x${(b.maxY-b.minY).toFixed(0)}`);
  i++;
}

// PATHS with fill (excluding labels #6B2E00)
console.log('\n=== PATHS (filled shapes, not labels) ===');
const pathRegex = /<path([^>]*?)\/?>(?:<\/path>)?/g;
let p, j = 0;
while ((p = pathRegex.exec(html)) !== null) {
  const attrs = p[1];
  if (!attrs.includes('d=')) continue;
  const fill = (attrs.match(/fill="([^"]+)"/) || [])[1] || 'none';
  if (fill === 'none' || fill === '#6B2E00' || fill === 'url(#' ) continue;
  const d = (attrs.match(/ d="([^"]+)"/) || [])[1] || '';
  const coords = [];
  const tokens = d.match(/[A-Za-z]|-?\d+(?:\.\d+)?/g) || [];
  let cmd = '', k = 0;
  while (k < tokens.length) {
    const t = tokens[k];
    if (/^[A-Za-z]$/.test(t)) { cmd = t; k++; continue; }
    if (cmd === 'M' || cmd === 'L') {
      const x = parseFloat(tokens[k]), y = parseFloat(tokens[k+1]);
      if (!isNaN(x) && !isNaN(y)) coords.push(x, y);
      k += 2;
      if (cmd === 'M') cmd = 'L';
    } else if (cmd === 'C') { k += 6; }
    else if (cmd === 'Z' || cmd === 'z') { k++; }
    else { k++; }
  }
  if (coords.length < 4) continue;
  const b = bboxAndCentroid(coords);
  const w = b.maxX-b.minX, h = b.maxY-b.minY;
  // only show substantial area shapes (not letters)
  if (w < 8 && h < 8) continue;
  console.log(`T#${String(j).padStart(2)} fill=${fill} bbox=(${b.minX.toFixed(0)},${b.minY.toFixed(0)})..(${b.maxX.toFixed(0)},${b.maxY.toFixed(0)}) center=(${b.cx.toFixed(0)},${b.cy.toFixed(0)}) size=${w.toFixed(0)}x${h.toFixed(0)} segs=${coords.length/2}`);
  j++;
}
