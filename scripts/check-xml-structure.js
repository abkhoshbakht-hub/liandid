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

async function main() {
  const feeds = [
    ['pgnews', 'https://www.pgnews.ir/feed'],
    ['bushehrnews', 'https://bushehrnews.ir/feed'],
    ['bushehrkhabar', 'https://bushehrkhabar.com/feed'],
  ];

  for (const [name, url] of feeds) {
    const xml = await fetch(url);
    console.log(`\n=== ${name} ===`);
    console.log(`First 500 chars: ${xml.substring(0, 500)}`);
    
    // Check for different item patterns
    const patterns = [
      ['<item>', '<item '],
      ['<entry>', '<entry '],
      ['<article>', '<article '],
    ];
    for (const [p, pAlt] of patterns) {
      const count = (xml.match(new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')) || []).length;
      const countAlt = pAlt !== p ? (xml.match(new RegExp(pAlt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')) || []).length : 0;
      if (count > 0 || countAlt > 0) console.log(`  ${p}: ${count + countAlt}`);
    }
  }
}

main().catch(console.error);
