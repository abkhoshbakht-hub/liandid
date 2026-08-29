const https = require('https');
const { PrismaClient } = require('@prisma/client');
var p = new PrismaClient();

function fetch(url) {
  return new Promise(function(resolve, reject) {
    https.get(url, { timeout: 15000, headers: { 'User-Agent': 'Mozilla/5.0' } }, function(res) {
      var data = '';
      res.on('data', function(c) { data += c; });
      res.on('end', function() { resolve(data); });
    }).on('error', reject);
  });
}

function extractImg(html) {
  var m = html.match(/<img[^>]+src="([^"]+)"/i);
  if (m && !m[1].startsWith('data:')) return m[1];
  return '';
}

function cuid() {
  var chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  var id = 'clx' + chars[Math.floor(Math.random()*10)] + chars[Math.floor(Math.random()*36)];
  for (var i = 0; i < 22; i++) id += chars[Math.floor(Math.random()*chars.length)];
  return id;
}

async function main() {
  var apis = [
    { name: 'بوشهر نیوز', url: 'https://bushehrnews.ir/wp-json/wp/v2/posts?per_page=20&_fields=title,link,content,date' },
    { name: 'پی جی نیوز', url: 'https://www.pgnews.ir/wp-json/wp/v2/posts?per_page=20&_fields=title,link,content,date' },
  ];

  var saved = 0;
  for (var i = 0; i < apis.length; i++) {
    var api = apis[i];
    try {
      var raw = await fetch(api.url);
      var items = JSON.parse(raw);
      if (!Array.isArray(items)) continue;
      console.log(api.name + ': ' + items.length + ' items');
      
      for (var j = 0; j < items.length; j++) {
        var item = items[j];
        var title = item.title.rendered.replace(/<[^>]+>/g, '').trim();
        var content = item.content.rendered || '';
        var img = extractImg(content);
        var desc = content.replace(/<[^>]+>/g, '').trim().substring(0, 300);
        
        if (!img) continue;
        
        // Check if exists
        var exists = await p.externalNews.findUnique({ where: { link: item.link }, select: { id: true } });
        if (exists) continue;
        
        var pubDate = item.date ? new Date(item.date) : new Date();
        
        await p.externalNews.create({
          data: {
            id: cuid(),
            title: title,
            link: item.link,
            description: desc,
            image: img,
            source: 'bushehr-wp-api',
            sourceName: api.name,
            status: 'APPROVED',
            publishedAt: pubDate,
            fetchedAt: new Date(),
          },
        });
        saved++;
        console.log('  + [IMG] ' + title.substring(0, 50));
      }
    } catch (e) {
      console.log(api.name + ' FAIL: ' + e.message.substring(0, 50));
    }
  }

  console.log('\nSaved: ' + saved);
  
  // Count total bushehr with images now
  var total = await p.externalNews.count({
    where: {
      status: 'APPROVED',
      image: { not: null },
      NOT: { image: '' },
    },
  });
  console.log('Total with images: ' + total);
  
  await p.$disconnect();
}

main().catch(function(e) { console.error(e); process.exit(1); });
