const https = require('https');

function fetchFollowingRedirects(url, timeout = 15000) {
  return new Promise((resolve, reject) => {
    function doFetch(u) {
      const mod = u.startsWith('https') ? https : require('http');
      mod.get(u, { timeout, headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const loc = res.headers.location.startsWith('http') ? res.headers.location : new URL(res.headers.location, u).href;
          return doFetch(loc);
        }
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => resolve(data));
      }).on('error', reject);
    }
    doFetch(url);
  });
}

function parseRss(xml) {
  const items = [];
  const blocks = xml.match(/<item>([\s\S]*?)<\/item>/gi) || [];
  for (const block of blocks) {
    const get = (tag) => {
      const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
      return m ? m[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : '';
    };
    const img = (block.match(/<enclosure[^>]+url="([^"]+)"/i) || [])[1] || '';
    items.push({
      title: get('title'),
      description: get('description').replace(/<[^>]+>/g, '').trim().substring(0, 200),
      link: get('link'),
      image: img,
      pubDate: get('pubDate'),
    });
  }
  return items;
}

async function main() {
  const feeds = [
    ['pgnews.ir', 'https://www.pgnews.ir/feed/'],
    ['bushehrnews.ir', 'https://bushehrnews.ir/feed/'],
    ['bushehrkhabar.com', 'https://bushehrkhabar.com/feed/'],
  ];

  for (const [name, url] of feeds) {
    const xml = await fetchFollowingRedirects(url);
    const arts = parseRss(xml);
    const withImg = arts.filter(a => a.image);
    console.log(`\n=== ${name} (${arts.length} articles, ${withImg.length} with images) ===`);
    arts.forEach(a => console.log(`  [${a.image ? 'IMG' : '---'}] ${a.title.substring(0, 70)}`));
    if (withImg.length > 0) {
      console.log(`  Sample image URL: ${withImg[0].image.substring(0, 120)}`);
    }
  }
}

main().catch(console.error);
