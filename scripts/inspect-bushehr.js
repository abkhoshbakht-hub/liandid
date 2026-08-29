const https = require('https');

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 10000, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function main() {
  const html = await fetch('https://bushehr.ir');
  
  const imgs = [...html.matchAll(/<img[^>]+src="([^"]+)"/gi)]
    .map(m => m[1])
    .filter(s => !s.startsWith('data:') && s.length > 5)
    .slice(0, 25);
  console.log('Images found:', imgs.length);
  imgs.forEach(i => console.log('  ', i.substring(0, 120)));
  
  const links = [...html.matchAll(/<a[^>]+href="([^"]+)"[^>]*>\s*([^<]{10,100})\s*</gi)]
    .slice(0, 15);
  console.log('\nNews links:');
  links.forEach(l => console.log('  ', l[1].substring(0, 60), '->', l[2].trim().substring(0, 60)));
}

main().catch(console.error);
