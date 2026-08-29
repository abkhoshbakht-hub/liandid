const https = require('https');
const http = require('http');

function fetchDetailed(url, timeout = 15000) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { timeout, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, res => {
      const redirects = [];
      function handleRedirect(r) {
        if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location) {
          const loc = r.headers.location.startsWith('http') ? r.headers.location : new URL(r.headers.location, url).href;
          redirects.push(`${r.statusCode} -> ${loc}`);
          const mod2 = loc.startsWith('https') ? https : http;
          mod2.get(loc, { timeout, headers: { 'User-Agent': 'Mozilla/5.0' } }, r2 => handleRedirect(r2)).on('error', reject);
        } else {
          let data = '';
          r.on('data', c => data += c);
          r.on('end', () => resolve({ status: r.statusCode, body: data, redirects, finalUrl: url }));
        }
      }
      handleRedirect(res);
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function main() {
  const feeds = [
    ['pgnews', 'https://www.pgnews.ir/feed'],
    ['pgnews-no-www', 'https://pgnews.ir/feed'],
    ['bushehrnews', 'https://bushehrnews.ir/feed'],
    ['bushehrkhabar', 'https://bushehrkhabar.com/feed'],
  ];

  for (const [name, url] of feeds) {
    try {
      const r = await fetchDetailed(url);
      const hasRss = r.body.includes('<rss') || r.body.includes('<channel');
      const hasAtom = r.body.includes('<feed');
      const items = (r.body.match(/<item/g) || []).length;
      console.log(`${name}: ${r.status} ${(r.body.length/1024).toFixed(0)}KB items:${items} rss:${hasRss} atom:${hasAtom}`);
      if (r.redirects.length) console.log(`  Redirects: ${r.redirects.join(' | ')}`);
      if (r.body.length < 200) console.log(`  Body: ${r.body.substring(0, 200)}`);
      else console.log(`  First 300: ${r.body.substring(0, 300)}`);
    } catch (e) {
      console.log(`${name}: FAIL - ${e.message.substring(0, 60)}`);
    }
  }
}

main().catch(console.error);
