const Parser = require('rss-parser');
const parser = new Parser({ timeout: 8000, headers: { 'User-Agent': 'LianDid/1.0' } });

const bushehrFeeds = [
  { name: 'بوشِهر', urls: ['https://bushehr.ir/rss', 'https://bushehr.ir/feed'] },
  { name: 'عصر بوشهر', urls: ['https://asrebushehr.ir/rss', 'https://asrebushehr.ir/feed'] },
  { name: 'خلیج فارس', urls: ['https://khalijfars.ir/rss', 'https://khalijfars.ir/feed'] },
  { name: 'بوشهر ۲۴', urls: ['https://bushehr24.ir/rss', 'https://bushehr24.ir/feed'] },
];

async function test() {
  for (const feed of bushehrFeeds) {
    for (const url of feed.urls) {
      try {
        const r = await parser.parseURL(url);
        const items = r.items.slice(0, 3);
        const imgs = items.map(i => {
          const c = i['media:content'] || {};
          const e = i.enclosure || {};
          const t = i['media:thumbnail'] || {};
          return c?.$attrs?.url || e?.url || t?.$attrs?.url || 'NONE';
        });
        console.log(`✅ ${feed.name} (${url}): ${items.length} items, images: ${imgs.join(', ')}`);
        if (items[0]) console.log(`   First: ${items[0].title?.substring(0,50)}`);
        break;
      } catch (e) {
        console.log(`❌ ${feed.name} (${url}): ${e.message.substring(0,60)}`);
      }
    }
  }
}
test();
