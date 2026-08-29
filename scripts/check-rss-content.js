const https = require('https');

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 15000, headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseRss(xml) {
  const items = [];
  const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/gi) || [];
  for (const block of itemMatches) {
    const title = (block.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '';
    const desc = (block.match(/<description[^>]*>([\s\S]*?)<\/description>/i) || [])[1] || '';
    const link = (block.match(/<link[^>]*>([\s\S]*?)<\/link>/i) || [])[1] || '';
    const pubDate = (block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i) || [])[1] || '';
    const encImg = (block.match(/<enclosure[^>]+url="([^"]+)"/i) || [])[1] || '';
    items.push({
      title: title.replace(/<!\[CDATA\[|\]\]>/g, '').trim(),
      description: desc.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]+>/g, '').trim().substring(0, 200),
      link: link.replace(/<!\[CDATA\[|\]\]>/g, '').trim(),
      image: encImg,
      pubDate,
    });
  }
  return items;
}

async function main() {
  // Check IRNA Bushehr feed
  const xml1 = await fetch('https://www.irna.ir/rss/tp/bushehr');
  const arts1 = parseRss(xml1);
  console.log('=== IRNA Bushehr ===');
  console.log(`Total: ${arts1.length}`);
  const withImg1 = arts1.filter(a => a.image);
  console.log(`With images: ${withImg1.length}`);
  arts1.slice(0, 5).forEach(a => console.log(`  [${a.image ? 'IMG' : '---'}] ${a.title.substring(0, 60)} | ${a.pubDate.substring(0, 30)}`));

  // Check if ISNA Bushehr is different
  const xml2 = await fetch('https://www.isna.ir/rss/tp/bushehr');
  const arts2 = parseRss(xml2);
  console.log('\n=== ISNA Bushehr ===');
  console.log(`Total: ${arts2.length}`);
  const withImg2 = arts2.filter(a => a.image);
  console.log(`With images: ${withImg2.length}`);
  arts2.slice(0, 5).forEach(a => console.log(`  [${a.image ? 'IMG' : '---'}] ${a.title.substring(0, 60)} | ${a.pubDate.substring(0, 30)}`));

  // Check overlap
  const t1 = new Set(arts1.map(a => a.title));
  const overlap = arts2.filter(a => t1.has(a.title)).length;
  console.log(`\nOverlap between IRNA & ISNA: ${overlap} articles`);
}

main().catch(console.error);
