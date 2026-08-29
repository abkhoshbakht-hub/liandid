const http = require('http');
http.get('http://localhost:3000/api/homepage', res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    const j = JSON.parse(d);
    const data = j.data;
    console.log('=== صفحه اصلی ===');
    console.log('Hero Main:', data.heroMain?.title?.substring(0, 60) || 'خالی');
    console.log('Hero Side1:', data.heroSide1?.title?.substring(0, 60) || 'خالی');
    console.log('Hero Side2:', data.heroSide2?.title?.substring(0, 60) || 'خالی');
    console.log('Breaking:', data.breaking?.length || 0);
    console.log('Latest:', data.latest?.length || 0);
    console.log('Analysis:', data.analysis?.length || 0);
    console.log('Categories:', Object.keys(data.categoryNews || {}).join(', '));
    for (const [cat, items] of Object.entries(data.categoryNews || {})) {
      console.log(`  ${cat}: ${items.length} خبر`);
    }
  });
}).on('error', e => console.error(e.message));
