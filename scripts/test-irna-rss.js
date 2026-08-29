const https = require('https');
const http = require('http');

function fetch(url, timeout = 15000) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { timeout, headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const loc = res.headers.location.startsWith('http') ? res.headers.location : new URL(res.headers.location, url).href;
        return fetch(loc, timeout).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function main() {
  // Try specific IRNA Bushehr RSS feeds
  const feeds = [
    { name: 'IRNA Bushehr', url: 'https://www.irna.ir/rss/tp/bushehr' },
    { name: 'IRNA Bushehr 2', url: 'https://irna.ir/rss/tp/bushehr' },
    { name: 'IRNA Province', url: 'https://www.irna.ir/rss/tp/province' },
    { name: 'ISNA Bushehr', url: 'https://www.isna.ir/rss/tp/bushehr' },
    { name: 'Mehr Bushehr', url: 'https://www.mehrnews.com/rss/tp/bushehr' },
    { name: 'ISNA South', url: 'https://www.isna.ir/rss/tp/south' },
    { name: 'IRNA hot', url: 'https://www.irna.ir/rss/tp/hot' },
    { name: 'IRNA latest', url: 'https://www.irna.ir/rss/tp/latest' },
    { name: 'ISNA latest', url: 'https://www.isna.ir/rss/tp/latest' },
  ];

  for (const feed of feeds) {
    try {
      const r = await fetch(feed.url);
      const hasRss = r.body.includes('<rss') || r.body.includes('<feed') || r.body.includes('<channel');
      const items = (r.body.match(/<item/g) || []).length;
      const imgMatches = (r.body.match(/<media:content[^>]+url="([^"]+)"/g) || []).length;
      const encMatches = (r.body.match(/<enclosure[^>]+url="([^"]+)"/g) || []).length;
      console.log(`${feed.name}: ${r.status} ${r.body.length > 0 ? (r.body.length/1024).toFixed(0)+'KB' : 'empty'} rss:${hasRss} items:${items} media:${imgMatches} enc:${encMatches}`);
    } catch (e) {
      console.log(`${feed.name}: FAIL - ${e.message.substring(0, 60)}`);
    }
  }
}

main().catch(console.error);
