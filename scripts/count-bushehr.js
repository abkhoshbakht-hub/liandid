const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  var all = await p.externalNews.findMany({
    where: { status: 'APPROVED' },
    orderBy: { publishedAt: 'desc' },
  });

  var kw = /بوشهر|عسلویه|کنگان|گناوه|دیر[^و]|تنگستان|دیلم|خارگ|برازجان|دشتی|دشتستان|جم‌پیلن|کیمیای پارس|پارس جنوبی|نخل تقی|سیراف|اهرم|چاه‌مبارک|پارسیان| بوشهر|بوشهر |بوشهری/i;

  var bushehr = all.filter(n => kw.test(n.title) || kw.test(n.description || ''));
  var bushehrImg = bushehr.filter(n => n.image && n.image.length > 10 && n.image.startsWith('http'));

  console.log('Total:', all.length);
  console.log('Bushehr (keyword):', bushehr.length);
  console.log('Bushehr + image:', bushehrImg.length);

  console.log('\n=== Bushehr with images ===');
  bushehrImg.forEach(function(n) {
    var dt = n.publishedAt ? new Date(n.publishedAt).toLocaleDateString('fa-IR') : '?';
    console.log('  [' + n.sourceName + '] ' + dt + ' ' + n.title.substring(0, 60));
  });

  console.log('\n=== Bushehr WITHOUT images ===');
  var bushehrNoImg = bushehr.filter(n => !n.image || n.image.length <= 10);
  bushehrNoImg.forEach(function(n) {
    var dt = n.publishedAt ? new Date(n.publishedAt).toLocaleDateString('fa-IR') : '?';
    console.log('  [' + n.sourceName + '] ' + dt + ' ' + n.title.substring(0, 60));
  });

  await p.$disconnect();
}

main().catch(function(e) { console.error(e); process.exit(1); });
