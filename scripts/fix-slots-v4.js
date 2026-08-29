const { PrismaClient } = require('@prisma/client');
var p = new PrismaClient();

var slotDefs = [
  { slotKey: 'hero-main', label: 'خبر اصلی', order: 0, mustBushehr: true },
  { slotKey: 'hero-side-1', label: 'خبر فرعی ۱', order: 1, mustBushehr: true },
  { slotKey: 'hero-side-2', label: 'خبر فرعی ۲', order: 2, mustBushehr: true },
  { slotKey: 'breaking-1', label: 'فوری ۱', order: 3, mustBushehr: true },
  { slotKey: 'breaking-2', label: 'فوری ۲', order: 4, mustBushehr: true },
  { slotKey: 'breaking-3', label: 'فوری ۳', order: 5, mustBushehr: true },
  { slotKey: 'breaking-4', label: 'فوری ۴', order: 6, mustBushehr: true },
  { slotKey: 'breaking-5', label: 'فوری ۵', order: 7, mustBushehr: true },
  { slotKey: 'latest-1', label: 'آخرین ۱', order: 8, mustBushehr: true },
  { slotKey: 'latest-2', label: 'آخرین ۲', order: 9, mustBushehr: true },
  { slotKey: 'latest-3', label: 'آخرین ۳', order: 10, mustBushehr: true },
  { slotKey: 'latest-4', label: 'آخرین ۴', order: 11, mustBushehr: true },
  { slotKey: 'latest-5', label: 'آخرین ۵', order: 12, mustBushehr: true },
  { slotKey: 'latest-6', label: 'آخرین ۶', order: 13, mustBushehr: true },
  { slotKey: 'latest-7', label: 'آخرین ۷', order: 14, mustBushehr: false },
  { slotKey: 'latest-8', label: 'آخرین ۸', order: 15, mustBushehr: false },
  { slotKey: 'latest-9', label: 'آخرین ۹', order: 16, mustBushehr: false },
  { slotKey: 'latest-10', label: 'آخرین ۱۰', order: 17, mustBushehr: false },
  { slotKey: 'analysis-1', label: 'تحلیل ۱', order: 18, mustBushehr: true },
  { slotKey: 'analysis-2', label: 'تحلیل ۲', order: 19, mustBushehr: false },
  { slotKey: 'analysis-3', label: 'تحلیل ۳', order: 20, mustBushehr: false },
];

var BUSHEHR = /بوشهر(ی|ستان)?|عسلویه|کنگان(ی)?|گناوه(ای)?|(?<![مد])دیر(?!کل|یت|عامل|ان|انه)|تنگستان(ی)?|دیلم(ی)?|خارگ(ی)?|برازجان(ی)?|دشتی|دشتستان(ی)?|جم‌پیلن|کیمیای پارس|پارس جنوبی|نخل تقی|سیراف(ی)?|اهرم(ی)?|چاه‌مبارک|پارسیان(ی)?/i;

function isBushehr(n) {
  return BUSHEHR.test(n.title) || BUSHEHR.test(n.description || '');
}

function hasImg(n) {
  return n.image && n.image.length > 10 && n.image.startsWith('http');
}

async function main() {
  await p.homepageSlot.deleteMany();

  var all = await p.externalNews.findMany({
    where: { status: 'APPROVED' },
    orderBy: { publishedAt: 'desc' },
  });

  var cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  var recent = all.filter(function(n) { return n.publishedAt && n.publishedAt >= cutoff; });
  var withImg = recent.filter(hasImg);

  var bushehrImg = withImg.filter(isBushehr);
  var nationalImg = withImg.filter(function(n) { return !isBushehr(n); });

  console.log('Recent with image: ' + withImg.length);
  console.log('  Bushehr: ' + bushehrImg.length);
  console.log('  National: ' + nationalImg.length);

  var bushehrUsed = [];
  var nationalUsed = [];

  for (var i = 0; i < slotDefs.length; i++) {
    var s = slotDefs[i];
    var n;
    if (s.mustBushehr) {
      n = bushehrImg.shift();
      if (!n) n = nationalImg.shift();
      bushehrUsed.push(s.slotKey);
    } else {
      n = nationalImg.shift();
      if (!n) n = bushehrImg.shift();
      nationalUsed.push(s.slotKey);
    }
    if (!n) continue;
    await p.homepageSlot.create({
      data: {
        slotKey: s.slotKey, label: s.label, type: 'EXTERNAL',
        externalNewsId: n.id, isActive: true, order: s.order,
      },
    });
  }

  console.log('\nBushehr slots: ' + bushehrUsed.join(', '));
  console.log('National slots: ' + nationalUsed.join(', '));

  var slots = await p.homepageSlot.findMany({ include: { externalNews: true } });
  for (var j = 0; j < slots.length; j++) {
    var sl = slots[j];
    var nn = sl.externalNews;
    var img = nn && hasImg(nn) ? 'IMG' : '---';
    var dt = nn && nn.publishedAt ? new Date(nn.publishedAt).toLocaleDateString('fa-IR') : '?';
    var t = nn ? nn.title.substring(0, 55) : '?';
    var src = nn ? nn.sourceName : '?';
    console.log(sl.slotKey.padEnd(15) + img + ' ' + dt.padEnd(12) + '[' + src.substring(0, 10) + '] ' + t);
  }

  await p.$disconnect();
}

main().catch(function(e) { console.error(e); process.exit(1); });
