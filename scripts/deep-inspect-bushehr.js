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
  const html = await fetch('https://bushehr.ir');
  
  // Look for API endpoints, JSON data, script with data
  const apiMatches = html.match(/api[^"'\s]*|fetch\([^)]+\)|axios\.[a-z]+\([^)]+\)/gi) || [];
  console.log('API references:', apiMatches.length);
  apiMatches.slice(0, 10).forEach(m => console.log('  ', m.substring(0, 80)));
  
  // Look for image URLs
  const allImgs = html.match(/src="([^"]*(?:jpg|jpeg|png|webp)[^"]*)"/gi) || [];
  console.log('\nImage URLs:', allImgs.length);
  allImgs.slice(0, 15).forEach(m => console.log('  ', m.substring(0, 120)));
  
  // Look for news links with text
  const newsLinks = html.match(/href="([^"]*)"[^>]*>\s*([^<]{15,100})/g) || [];
  console.log('\nNews links:', newsLinks.length);
  newsLinks.slice(0, 15).forEach(m => console.log('  ', m.substring(0, 120)));
  
  // Check for Next.js data
  const nextData = html.match(/__NEXT_DATA__/);
  console.log('\nNext.js data:', !!nextData);
  
  // Check for script data
  const scriptData = html.match(/window\.__[A-Z_]+\s*=/g) || [];
  console.log('Window data:', scriptData);
}

main().catch(console.error);
