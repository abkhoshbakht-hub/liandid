const https = require('https');

function fetch(url) {
  return new Promise(function(resolve, reject) {
    var mod = url.startsWith('https') ? https : require('http');
    mod.get(url, { timeout: 10000, headers: { 'User-Agent': 'Mozilla/5.0' } }, function(res) {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        var loc = res.headers.location.startsWith('http') ? res.headers.location : new URL(res.headers.location, url).href;
        return fetch(loc).then(resolve).catch(reject);
      }
      var data = '';
      res.on('data', function(c) { data += c; });
      res.on('end', function() { resolve(data); });
    }).on('error', reject);
  });
}

function parse(xml) {
  var items = [];
  var blocks = xml.match(/<item>([\s\S]*?)<\/item>/gi) || [];
  for (var i = 0; i < blocks.length; i++) {
    var block = blocks[i];
    var get = function(tag) {
      var m = block.match(new RegExp('<' + tag + '[^>]*>([\\\\s\\\\S]*?)<\\\\/' + tag + '>', 'i'));
      return m ? m[1].replace(/<!\\[CDATA\\[|\\]\\]>/g, '').trim() : '';
    };
    var enc = (block.match(/<enclosure[^>]+url="([^"]+)"/i) || [])[1] || '';
    var content = get('content:encoded') || get('content') || get('description') || '';
    var imgM = content.match(/<img[^>]+src="([^"]+)"/i);
    var img = enc || (imgM && !imgM[1].startsWith('data:') ? imgM[1] : '');
    items.push({
      title: get('title'),
      desc: get('description').replace(/<[^>]+>/g, '').trim().substring(0, 150),
      image: img,
      date: get('pubDate'),
    });
  }
  return items;
}

async function main() {
  var feeds = [
    ['karanehbushehr', 'https://karanehbushehr.ir/?feed=rss2'],
    ['nedayostan', 'https://nedayostan.ir/?feed=rss2'],
    ['sooknews', 'https://sooknews.ir/?feed=rss2'],
  ];

  for (var i = 0; i < feeds.length; i++) {
    var f = feeds[i];
    var xml = await fetch(f[1]);
    var arts = parse(xml);
    var withImg = arts.filter(function(a) { return a.image; });
    console.log('\n=== ' + f[0] + ' (' + arts.length + ' articles, ' + withImg.length + ' with images) ===');
    for (var j = 0; j < arts.length; j++) {
      var a = arts[j];
      console.log('  [' + (a.image ? 'IMG' : '---') + '] ' + a.title.substring(0, 65));
    }
    if (withImg.length > 0) {
      console.log('  Sample: ' + withImg[0].image.substring(0, 100));
    }
  }
}

main().catch(console.error);
