const https = require('https');

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 15000, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function main() {
  const html = await fetch('https://bushehrnews.com');
  
  // Find image URLs
  const imgs = [...html.matchAll(/src="([^"]*(?:jpg|jpeg|png|webp|gif)[^"]*)"/gi)]
    .map(m => m[1])
    .filter(s => !s.startsWith('data:') && s.length > 10);
  console.log('Images:', imgs.length);
  imgs.forEach(i => console.log('  ', i.substring(0, 120)));
  
  // Find news links with text
  const links = [...html.matchAll(/href="([^"]+)"[^>]*>\s*([^<]{10,100})/gi)]
    .filter(m => m[2].trim().length > 10 && !m[2].includes('menu') && !m[2].includes('منو'));
  console.log('\nLinks:', links.length);
  links.forEach(l => console.log('  ', l[1].substring(0, 60), '->', l[2].trim().substring(0, 60)));
  
  // Check for JSON/script data
  const jsonData = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi) || [];
  console.log('\nJSON-LD:', jsonData.length);
  if (jsonData.length > 0) console.log('  First:', jsonData[0].substring(0, 200));
  
  // WordPress REST API
  const wpApi = html.match(/wp-json|wpapi|rest_url/gi) || [];
  console.log('WP API refs:', wpApi.length);
}

main().catch(console.error);
