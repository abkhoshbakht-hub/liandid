const https = require('https');
const http = require('http');

function fetch(url, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { timeout, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }, res => {
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
  const feeds = [
    // کاربر
    ['karanehbushehr.ir', 'https://karanehbushehr.ir/feed'],
    ['karanehbushehr atom', 'https://karanehbushehr.ir/feed/atom'],
    ['nedayostan.ir', 'https://nedayostan.ir/feed'],
    ['nedayostan atom', 'https://nedayostan.ir/feed/atom'],
    ['nedayostan rss', 'https://nedayostan.ir/rss'],
    ['sooknews.ir', 'https://sooknews.ir/feed'],
    ['sooknews atom', 'https://sooknews.ir/feed/atom'],
    ['sooknews rss', 'https://sooknews.ir/rss'],
    ['pgnews.ir', 'https://www.pgnews.ir/feed'],
    ['pgnews atom', 'https://www.pgnews.ir/feed/atom'],

    // از جستجو
    ['bushehrnews.ir', 'https://bushehrnews.ir/feed'],
    ['bushehrnews atom', 'https://bushehrnews.ir/feed/atom'],
    ['bushehrkhabar.com', 'https://bushehrkhabar.com/feed'],
    ['bushehrkhabar atom', 'https://bushehrkhabar.com/feed/atom'],
    ['bushehrkhabar rss', 'https://bushehrkhabar.com/rss'],
    
    // تسنیم بوشهر
    ['tasnim bushehr', 'https://www.tasnimnews.ir/fa/service/53/بوشهر/rss'],
    ['tasnim bushehr2', 'https://www.tasnimnews.ir/rss/service/53'],
    
    // ایرنا بوشهر
    ['irna bushehr service', 'https://www.irna.ir/service/province/bushehr/rss'],
    ['irna bushehr tp', 'https://www.irna.ir/rss/tp/bushehr'],
  ];

  for (const [name, url] of feeds) {
    try {
      const r = await fetch(url);
      const hasRss = r.body.includes('<rss') || r.body.includes('<feed') || r.body.includes('<channel');
      const items = (r.body.match(/<item/g) || []).length;
      const encImgs = (r.body.match(/<enclosure[^>]+url="/g) || []).length;
      const status = `${r.status}`;
      const size = `${(r.body.length/1024).toFixed(0)}KB`;
      console.log(`${name.padEnd(25)} ${status} ${size.padStart(5)} items:${String(items).padStart(3)} enc:${encImgs} rss:${hasRss}`);
    } catch (e) {
      console.log(`${name.padEnd(25)} FAIL ${e.message.substring(0, 50)}`);
    }
  }
}

main().catch(console.error);
