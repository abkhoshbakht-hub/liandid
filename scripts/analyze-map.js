const fs = require('fs');
const svg = fs.readFileSync('D:/MyProgect/liandid/public/maps/bushehr-fa.svg', 'utf8');

// Find the first 20 direct children of <svg>
const svgOpen = svg.indexOf('<svg');
const svgContent = svg.substring(svgOpen);
const tagRe = /<(\w+)[\s>]/g;
let m;
let pos = 0;
let count = 0;
const children = [];
while ((m = tagRe.exec(svgContent)) !== null && count < 30) {
  const tag = m[1];
  if (tag === 'svg') continue;
  const idx = svgContent.indexOf(m[0], pos);
  children.push({ tag, position: idx });
  pos = idx + m[0].length;
  count++;
}
console.log('First direct children of <svg>:');
children.forEach((c, i) => console.log(`  ${i}: <${c.tag}> at pos ${c.position}`));

// Check if polygons are inside <g> groups
const firstPolyIdx = svgContent.indexOf('<polygon');
const beforeFirstPoly = svgContent.substring(0, firstPolyIdx);
const lastGBeforePoly = beforeFirstPoly.lastIndexOf('<g');
const lastGClose = beforeFirstPoly.lastIndexOf('</g>');
console.log('\nFirst polygon at:', firstPolyIdx);
console.log('Last <g before first polygon at:', lastGLastGClose = lastGClose);
console.log('Is polygon inside a group?', lastGClose > lastGBeforePoly ? 'YES - polygon is inside a group' : 'NO');
