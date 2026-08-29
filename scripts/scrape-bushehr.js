const https = require('https');

function fetch(url, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }, res => {
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

function extractArticles(html, baseUrl) {
  const articles = [];
  
  // Extract articles with images - look for common news patterns
  // Pattern 1: article tags
  const articleRegex = /<article[^>]*>([\s\S]*?)<\/article>/gi;
  let match;
  while ((match = articleRegex.exec(html)) !== null) {
    const block = match[1];
    const titleMatch = block.match(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/i);
    const imgMatch = block.match(/<img[^>]+src="([^"]+)"/i);
    const linkMatch = block.match(/<a[^>]+href="([^"]+)"/i);
    const descMatch = block.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    
    if (titleMatch && imgMatch) {
      let imgSrc = imgMatch[1];
      if (imgSrc.startsWith('//')) imgSrc = 'https:' + imgSrc;
      else if (imgSrc.startsWith('/')) imgSrc = baseUrl + imgSrc;
      
      const title = titleMatch[1].replace(/<[^>]+>/g, '').trim();
      if (title.length > 10) {
        articles.push({
          title: title.substring(0, 200),
          image: imgSrc,
          description: descMatch ? descMatch[1].replace(/<[^>]+>/g, '').trim().substring(0, 500) : '',
          link: linkMatch ? (linkMatch[1].startsWith('http') ? linkMatch[1] : baseUrl + linkMatch[1]) : '',
        });
      }
    }
  }
  
  // Pattern 2: div with class containing post/article/news
  if (articles.length < 3) {
    const divRegex = /<div[^>]+class="[^"]*(?:post|article|news|entry)[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?:<\/div>|<div[^>])/gi;
    while ((match = divRegex.exec(html)) !== null) {
      const block = match[1];
      const titleMatch = block.match(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/i);
      const imgMatch = block.match(/<img[^>]+src="([^"]+)"/i);
      
      if (titleMatch && imgMatch) {
        let imgSrc = imgMatch[1];
        if (imgSrc.startsWith('//')) imgSrc = 'https:' + imgSrc;
        else if (imgSrc.startsWith('/')) imgSrc = baseUrl + imgSrc;
        
        const title = titleMatch[1].replace(/<[^>]+>/g, '').trim();
        if (title.length > 10) {
          articles.push({
            title: title.substring(0, 200),
            image: imgSrc,
            description: '',
            link: '',
          });
        }
      }
    }
  }
  
  return articles;
}

async function main() {
  // Scrape bushehr.ir
  console.log('=== bushehr.ir ===');
  try {
    const r1 = await fetch('https://bushehr.ir');
    const arts1 = extractArticles(r1.body, 'https://bushehr.ir');
    console.log(`Found ${arts1.length} articles`);
    arts1.forEach(a => console.log(`  img: ${a.image.substring(0, 80)}`));
    arts1.forEach(a => console.log(`  title: ${a.title.substring(0, 60)}`));
  } catch (e) { console.log('Error:', e.message); }

  // Scrape bushehrnews.com
  console.log('\n=== bushehrnews.com ===');
  try {
    const r2 = await fetch('https://bushehrnews.com');
    const arts2 = extractArticles(r2.body, 'https://bushehrnews.com');
    console.log(`Found ${arts2.length} articles`);
    arts2.forEach(a => console.log(`  img: ${a.image.substring(0, 80)}`));
    arts2.forEach(a => console.log(`  title: ${a.title.substring(0, 60)}`));
  } catch (e) { console.log('Error:', e.message); }
}

main().catch(console.error);
