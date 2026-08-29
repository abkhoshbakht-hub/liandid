const https = require('https');

function fetch(url, timeout) {
  return new Promise(function(resolve, reject) {
    var mod = url.startsWith('https') ? https : require('http');
    var req = mod.get(url, { timeout: timeout || 10000, headers: { 'User-Agent': 'Mozilla/5.0' } }, function(res) {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        var loc = res.headers.location.startsWith('http') ? res.headers.location : new URL(res.headers.location, url).href;
        return fetch(loc, timeout).then(resolve).catch(reject);
      }
      var data = '';
      res.on('data', function(c) { data += c; });
      res.on('end', function() { resolve(data); });
    });
    req.on('error', reject);
    req.on('timeout', function() { req.destroy(); reject(new Error('timeout')); });
  });
}

async function main() {
  var sites = [
    // Try various RSS/feed/atom endpoints
    ['karanehbushehr /feed', 'https://karanehbushehr.ir/feed'],
    ['karanehbushehr /rss', 'https://karanehbushehr.ir/rss'],
    ['karanehbushehr /xml', 'https://karanehbushehr.ir/xml'],
    ['karanehbushehr /?feed=rss2', 'https://karanehbushehr.ir/?feed=rss2'],
    
    ['nedayostan /feed', 'https://nedayostan.ir/feed'],
    ['nedayostan /rss', 'https://nedayostan.ir/rss'],
    ['nedayostan /?feed=rss2', 'https://nedayostan.ir/?feed=rss2'],
    ['nedayostan /wp-json', 'https://nedayostan.ir/wp-json/wp/v2/posts?per_page=5'],
    
    ['sooknews /feed', 'https://sooknews.ir/feed'],
    ['sooknews /rss', 'https://sooknews.ir/rss'],
    ['sooknews /?feed=rss2', 'https://sooknews.ir/?feed=rss2'],
    ['sooknews /wp-json', 'https://sooknews.ir/wp-json/wp/v2/posts?per_page=5'],
    
    // Try more Bushehr sites from search
    ['bushehr.riran.ir', 'https://bushehr.riran.ir/feed'],
    ['booshehr.com', 'https://booshehr.com/feed'],
    ['bushehrpress.ir', 'https://bushehrpress.ir/feed'],
    ['bushehrline.ir', 'https://bushehrline.ir/feed'],
    ['bushehrda.ir', 'https://bushehrda.ir/feed'],
    ['bushehrnews24.ir', 'https://bushehrnews24.ir/feed'],
    ['khznews.ir', 'https://khznews.ir/feed'],
    ['parsna.ir', 'https://parsna.ir/feed'],
  ];

  for (var i = 0; i < sites.length; i++) {
    var s = sites[i];
    try {
      var html = await fetch(s[1]);
      var hasRss = html.includes('<rss') || html.includes('<channel') || html.includes('<feed');
      var items = (html.match(/<item/g) || []).length;
      var wpJson = html.includes('wp-json') || html.includes('rest_url');
      if (items > 0 || hasRss) {
        console.log(s[0].padEnd(30) + ' OK ' + (html.length/1024).toFixed(0) + 'KB items:' + items);
      }
    } catch (e) {
      // silent
    }
  }
}

main().catch(console.error);
