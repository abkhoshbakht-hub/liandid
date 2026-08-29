const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  var all = await p.externalNews.findMany({
    where: { status: 'APPROVED' },
    orderBy: { publishedAt: 'desc' },
  });

  var kw = /بوشهر|عسلویه|کنگان|گناوه|دیر[^و]|تنگستان|دیلم|خارگ|برازجان|دشتی|دشتستان|جم‌پیلن|کیمیای پارس|پارس جنوبی|نخل تقی|سیراف|اهرم|چاه‌مبارک|پارسیان| بوشهر|بوشهر |بوشهری/i;

  // Check false matches
  var falseMatches = [];
  for (var n of all) {
    if (!kw.test(n.title) && !kw.test(n.description || '')) continue;
    var m = (n.title + ' ' + (n.description || '')).match(kw);
    falseMatches.push({ title: n.title.substring(0, 60), match: m ? m[0] : '?', source: n.sourceName, desc: (n.description || '').substring(0, 100) });
  }

  console.log('False matches check:');
  falseMatches.forEach(function(f) {
    console.log('  match="' + f.match + '" src=' + f.source + ' title=' + f.title);
    // Show context around match
    var text = f.title + ' ' + f.desc;
    var idx = text.indexOf(f.match);
    if (idx >= 0) {
      var start = Math.max(0, idx - 20);
      var end = Math.min(text.length, idx + f.match.length + 20);
      console.log('    context: ...' + text.substring(start, end) + '...');
    }
  });

  await p.$disconnect();
}

main().catch(function(e) { console.error(e); process.exit(1); });
