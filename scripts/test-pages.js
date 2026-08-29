const http = require('http');
const pages = ['/category/siyasi', '/category/eghtesadi', '/category/ejtemaei', '/category/varzeshi', '/category/bushahr', '/category/bushahr/booshehr', '/category/bushahr/ganaveh'];
let done = 0;
pages.forEach(page => {
  http.get('http://localhost:3000' + page, res => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
      const hasContent = d.length > 1000;
      const hasNews = d.includes('خبر') || d.includes('اخبار');
      console.log(`${res.statusCode === 200 ? '✅' : '❌'} ${page} (${res.statusCode}) - ${hasContent ? 'محتوا دارد' : 'خالی'}`);
      if (++done === pages.length) process.exit();
    });
  }).on('error', e => { console.log(`❌ ${page}: ${e.message}`); if (++done === pages.length) process.exit(); });
});
