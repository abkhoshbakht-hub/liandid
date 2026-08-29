const https = require('https');

function fetch(url) {
  return new Promise(function(resolve, reject) {
    https.get(url, { timeout: 15000, headers: { 'User-Agent': 'Mozilla/5.0' } }, function(res) {
      var data = '';
      res.on('data', function(c) { data += c; });
      res.on('end', function() { resolve(data); });
    }).on('error', reject);
  });
}

async function main() {
  var apis = [
    ['bushehrkhabar', 'https://bushehrkhabar.com/wp-json/wp/v2/posts?per_page=10&_fields=title,link,content,featured_media,_embedded'],
    ['bushehrnews', 'https://bushehrnews.ir/wp-json/wp/v2/posts?per_page=10&_fields=title,link,content,featured_media,_embedded'],
    ['pgnews', 'https://www.pgnews.ir/wp-json/wp/v2/posts?per_page=10&_fields=title,link,content,featured_media,_embedded'],
    ['karaneh', 'https://karanehbushehr.ir/wp-json/wp/v2/posts?per_page=10&_fields=title,link,content,featured_media,_embedded'],
    ['nedayostan', 'https://nedayostan.ir/wp-json/wp/v2/posts?per_page=10&_fields=title,link,content,featured_media,_embedded'],
    ['sooknews', 'https://sooknews.ir/wp-json/wp/v2/posts?per_page=10&_fields=title,link,content,featured_media,_embedded'],
  ];

  for (var i = 0; i < apis.length; i++) {
    var a = apis[i];
    try {
      var raw = await fetch(a[1]);
      var items = JSON.parse(raw);
      if (!Array.isArray(items)) { console.log(a[0] + ': not array'); continue; }
      var withImg = items.filter(function(item) {
        var content = item.content && item.content.rendered ? item.content.rendered : '';
        return content.match(/<img[^>]+src="[^"]+"/i);
      });
      console.log(a[0] + ': ' + items.length + ' items, ' + withImg.length + ' with images');
      for (var j = 0; j < Math.min(3, withImg.length); j++) {
        var img = withImg[j].content.rendered.match(/<img[^>]+src="([^"]+)"/i);
        console.log('  ' + withImg[j].title.rendered.substring(0, 50));
        if (img) console.log('  img: ' + img[1].substring(0, 80));
      }
    } catch (e) {
      console.log(a[0] + ': FAIL - ' + e.message.substring(0, 50));
    }
  }
}

main().catch(console.error);
