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

function parseRss(xml) {
  const items = [];
  const blocks = xml.match(/<item>([\s\S]*?)<\/item>/gi) || [];
  for (const block of blocks) {
    const get = (tag) => (block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i')) || [])[1] || '';
    items.push({
      title: get('title').replace(/<!\[CDATA\[|\]\]>/g, '').trim(),
      description: get('description').replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]+>/g, '').trim(),
      link: get('link').replace(/<!\[CDATA\[|\]\]>/g, '').trim(),
      image: (block.match(/<enclosure[^>]+url="([^"]+)"/i) || [])[1] || '',
      pubDate: get('pubDate'),
      category: get('category'),
    });
  }
  return items;
}

async function main() {
  const feeds = [
    'https://www.irna.ir/rss',
    'https://www.isna.ir/rss',
    'https://www.mehrnews.com/rss',
  ];
  
  const bushehrKeywords = /بوشهر|پارس جنوبی|عسلویه|کنگان|گناوه|دیر|جم|تنگستان|دیلم|خارگ|برازجان|دشتی|دشتستان|انارستان|ریز|چاه‌مبارک|حومه|لیراوی|ماهشهر|شادگان|بندر امام|هندیجان|amineh|پارسیان|عسلویه|نخل تقی|بستان|サウス|سیراف|اهرم/i;

  let all = [];
  for (const url of feeds) {
    const xml = await fetch(url);
    const arts = parseRss(xml);
    console.log(`${url.split('/')[2]}: ${arts.length} articles`);
    all.push(...arts);
  }
  
  // Filter Bushehr/south
  const bushehr = all.filter(a => bushehrKeywords.test(a.title) || bushehrKeywords.test(a.description));
  console.log(`\nBushehr/south mentions: ${bushehr.length} out of ${all.length}`);
  bushehr.forEach(a => console.log(`  [${a.image ? 'IMG' : '---'}] ${a.title.substring(0, 70)}`));
  
  // Also show all unique categories
  const cats = [...new Set(all.map(a => a.category).filter(Boolean))];
  console.log(`\nCategories: ${cats.join(', ')}`);
  
  // Show stats
  const withImg = all.filter(a => a.image);
  console.log(`With images: ${withImg.length}/${all.length}`);
}

main().catch(console.error);
