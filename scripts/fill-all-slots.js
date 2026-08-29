const { PrismaClient } = require('@prisma/client');
var p = new PrismaClient();

var slotDefs = [
  { slotKey: 'hero-main', label: 'خبر اصلی', order: 0 },
  { slotKey: 'hero-side-1', label: 'خبر فرعی ۱', order: 1 },
  { slotKey: 'hero-side-2', label: 'خبر فرعی ۲', order: 2 },
  { slotKey: 'breaking-1', label: 'فوری ۱', order: 3 },
  { slotKey: 'breaking-2', label: 'فوری ۲', order: 4 },
  { slotKey: 'breaking-3', label: 'فوری ۳', order: 5 },
  { slotKey: 'breaking-4', label: 'فوری ۴', order: 6 },
  { slotKey: 'breaking-5', label: 'فوری ۵', order: 7 },
  { slotKey: 'latest-1', label: 'آخرین ۱', order: 8 },
  { slotKey: 'latest-2', label: 'آخرین ۲', order: 9 },
  { slotKey: 'latest-3', label: 'آخرین ۳', order: 10 },
  { slotKey: 'latest-4', label: 'آخرین ۴', order: 11 },
  { slotKey: 'latest-5', label: 'آخرین ۵', order: 12 },
  { slotKey: 'latest-6', label: 'آخرین ۶', order: 13 },
  { slotKey: 'latest-7', label: 'آخرین ۷', order: 14 },
  { slotKey: 'latest-8', label: 'آخرین ۸', order: 15 },
  { slotKey: 'latest-9', label: 'آخرین ۹', order: 16 },
  { slotKey: 'latest-10', label: 'آخرین ۱۰', order: 17 },
  { slotKey: 'analysis-1', label: 'تحلیل ۱', order: 18 },
  { slotKey: 'analysis-2', label: 'تحلیل ۲', order: 19 },
  { slotKey: 'analysis-3', label: 'تحلیل ۳', order: 20 },
];

function hasImg(n) {
  return n.image && n.image.length > 10 && n.image.startsWith('http');
}

async function main() {
  await p.homepageSlot.deleteMany();

  var all = await p.externalNews.findMany({
    where: { status: 'APPROVED' },
    orderBy: { publishedAt: 'desc' },
  });

  var withImg = all.filter(hasImg);
  var usedIds = {};

  console.log('Total with image: ' + withImg.length);

  for (var i = 0; i < slotDefs.length; i++) {
    var s = slotDefs[i];
    var n = null;
    for (var a = 0; a < withImg.length; a++) {
      if (!usedIds[withImg[a].id]) {
        n = withImg[a];
        usedIds[n.id] = true;
        break;
      }
    }
    if (!n) continue;
    await p.homepageSlot.create({
      data: { slotKey: s.slotKey, label: s.label, type: 'EXTERNAL', externalNewsId: n.id, isActive: true, order: s.order },
    });
  }

  var slots = await p.homepageSlot.findMany({ include: { externalNews: true } });
  console.log('Slots filled: ' + slots.length);
  for (var j = 0; j < slots.length; j++) {
    var sl = slots[j];
    var nn = sl.externalNews;
    var dt = nn && nn.publishedAt ? new Date(nn.publishedAt).toLocaleDateString('fa-IR') : '?';
    var t = nn ? nn.title.substring(0, 55) : '?';
    var src = nn ? nn.sourceName : '?';
    console.log(sl.slotKey.padEnd(15) + 'IMG ' + dt.padEnd(12) + '[' + src.substring(0, 10) + '] ' + t);
  }

  await p.$disconnect();
}

main().catch(function(e) { console.error(e); process.exit(1); });
