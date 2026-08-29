const https = require('https');
const http = require('http');

function fetch(url, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { timeout, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetch(res.headers.location, timeout).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function testSites() {
  const sites = [
    { name: 'bushehr.ir', url: 'https://bushehr.ir' },
    { name: 'bushehr.ir news', url: 'https://bushehr.ir/news' },
    { name: 'asrebushehr.ir', url: 'https://asrebushehr.ir' },
    { name: 'khalijfars.ir', url: 'https://khalijfars.ir' },
    { name: 'bushehr24.ir', url: 'https://bushehr24.ir' },
    { name: 'bushehrnews.com', url: 'https://bushehrnews.com' },
    { name: 'booshehr.net', url: 'https://booshehr.net' },
    { name: 'khbabar.ir', url: 'https://khbabar.ir' },
    { name: 'persianpersia.com', url: 'https://www.persianpersia.com' },
  ];

  for (const site of sites) {
    try {
      const r = await fetch(site.url);
      const imgCount = (r.body.match(/<img/g) || []).length;
      const linkCount = (r.body.match(/<a\s/g) || []).length;
      console.log(`${site.name}: ${r.status} | size:${(r.body.length/1024).toFixed(0)}KB | imgs:${imgCount} | links:${linkCount}`);
    } catch (e) {
      console.log(`${site.name}: FAIL - ${e.message.substring(0, 60)}`);
    }
  }
}

testSites().catch(e => console.error(e));
