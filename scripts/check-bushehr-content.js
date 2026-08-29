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
  const blocks = xml.match(/<item>([\s\S]*?)<\/item>/gi) || [];
  for (const block of blocks) {
    const get = (tag) => (block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i')) || [])[1] || '';
    const img = (block.match(/<enclosure[^>]+url="([^"]+)"/i) || [])[1] || 
                (block.match(/<media:content[^>]+url="([^"]+)"/i) || [])[1] || '';
    items.push({
      title: get('title').replace(/<!\[CDATA\[|\]\]>/g, '').trim(),
      description: get('description').replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]+>/g, '').trim().substring(0, 150),
      image: img,
      pubDate: get('pubDate'),
    });
  }
  return items;
}

async function main() {
  const feeds = [
    ['pgnews.ir', 'https://www.pgnews.ir/feed'],
    ['bushehrnews.ir', 'https://bushehrnews.ir/feed'],
    ['bushehrkhabar.com', 'https://bushehrkhabar.com/feed'],
    ['bushehrkhabar rss', 'https://bushehrkhabar.com/rss'],
    ['irna bushehr tp', 'https://www.irna.ir/rss/tp/bushehr'],
  ];

  for (const [name, url] of feeds) {
    const xml = await fetch(url);
    const arts = parseRss(xml);
    const withImg = arts.filter(a => a.image);
    console.log(`\n=== ${name} (${arts.length} articles, ${withImg.length} with images) ===`);
    arts.forEach(a => console.log(`  [${a.image ? 'IMG' : '---'}] ${a.title.substring(0, 65)}`));
    if (withImg.length > 0) {
      console.log(`  Sample image: ${withImg[0].image.substring(0, 100)}`);
    }
  }
}

main().catch(console.error);
