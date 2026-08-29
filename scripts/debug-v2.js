const { PrismaClient } = require('@prisma/client');
var p = new PrismaClient();

async function main() {
  var all = await p.externalNews.findMany({
    where: { status: 'APPROVED' },
    orderBy: { publishedAt: 'desc' },
  });

  var kw = /بوشهر(ی|ستان)?|عسلویه|کنگان(ی)?|گناوه(ای)?|(?<![مد])دیر(?!کل|یت|عامل|ان|انه)|تنگستان(ی)?|دیلم(ی)?|خارگ(ی)?|برازجان(ی)?|دشتی|دشتستان(ی)?|جم‌پیلن|کیمیای پارس|پارس جنوبی|نخل تقی|سیراف(ی)?|اهرم(ی)?|چاه‌مبارک|پارسیان(ی)?/i;

  // Check bushehr news with images
  var bushehrImg = all.filter(function(n) {
    if (n.image && n.image.length > 10 && n.image.startsWith('http')) {
      var text = (n.title || '') + ' ' + (n.description || '');
      return kw.test(text);
    }
    return false;
  });

  console.log('Bushehr with image: ' + bushehrImg.length);
  bushehrImg.forEach(function(n) {
    var dt = n.publishedAt ? new Date(n.publishedAt).toLocaleDateString('fa-IR') : '?';
    console.log('  [' + n.sourceName + '] ' + dt + ' ' + n.title.substring(0, 60));
  });

  // Also check what keywords match for "بوشهر نیوز" items
  var bushehrSource = all.filter(function(n) {
    return n.sourceName === 'بوشهر نیوز' || n.sourceName === 'بوشهر خبر';
  });
  console.log('\nBooshehr source items: ' + bushehrSource.length);
  bushehrSource.forEach(function(n) {
    var text = (n.title || '') + ' ' + (n.description || '');
    var m = text.match(kw);
    var hasImg = n.image && n.image.length > 10 && n.image.startsWith('http');
    console.log('  [' + (hasImg ? 'IMG' : '---') + '] match=' + (m ? m[0] : 'NONE') + ' ' + n.title.substring(0, 60));
  });

  await p.$disconnect();
}

main().catch(function(e) { console.error(e); process.exit(1); });
