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

async function testSite(name, url) {
  try {
    const r = await fetch(url);
    const hasRss = r.body.includes('<rss') || r.body.includes('<feed') || r.body.includes('<channel');
    const items = (r.body.match(/<item/g) || []).length;
    const imgs = (r.body.match(/<img/g) || []).length;
    console.log(`${name}: ${r.status} ${(r.body.length/1024).toFixed(0)}KB rss:${hasRss} items:${items} imgs:${imgs}`);
    return { name, url, status: r.status, size: r.body.length, hasRss, items, imgs, body: r.body };
  } catch (e) {
    console.log(`${name}: FAIL - ${e.message.substring(0, 60)}`);
    return null;
  }
}

async function main() {
  const sites = [
    { name: 'karanehbushehr.ir', url: 'https://karanehbushehr.ir/' },
    { name: 'karanehbushehr RSS', url: 'https://karanehbushehr.ir/feed/' },
    { name: 'nedayostan.ir', url: 'https://nedayostan.ir/' },
    { name: 'nedayostan RSS', url: 'https://nedayostan.ir/feed/' },
    { name: 'sooknews.ir', url: 'https://sooknews.ir/' },
    { name: 'sooknews RSS', url: 'https://sooknews.ir/feed/' },
    { name: 'pgnews.ir', url: 'https://www.pgnews.ir/' },
    { name: 'pgnews RSS', url: 'https://www.pgnews.ir/feed/' },
    { name: 'pgnews RSS2', url: 'https://pgnews.ir/feed/' },
  ];

  for (const s of sites) {
    await testSite(s.name, s.url);
  }
}

main().catch(console.error);
