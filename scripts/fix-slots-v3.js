const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

const slotDefs = [
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

function isBushehr(n) {
  var text = (n.title || '') + ' ' + (n.description || '');
  // Only match EXACT Bushehr city/county names, NOT "مدیر" etc
  var kw = /بوشهر(ی|ستان)?|عسلویه|کنگان(ی)?|گناوه(ای)?|(?<![مد])دیر(?!کل|یت|عامل|ان|انه)|تنگستان(ی)?|دیلم(ی)?|خارگ(ی)?|برازجان(ی)?|دشتی|دشتستان(ی)?|جم‌پیلن|کیمیای پارس|پارس جنوبی|نخل تقی|سیراف(ی)?|اهرم(ی)?|چاه‌مبارک|پارسیان(ی)?/i;
  return kw.test(text);
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

  var cutoff = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
  var pool = [];

  // Priority 1: Bushehr source + has image + recent
  var seen = new Set();
  for (var n of all) {
    if (!isBushehr(n)) continue;
    if (!hasImg(n)) continue;
    if (!n.publishedAt || n.publishedAt < cutoff) continue;
    if (seen.has(n.id)) continue;
    seen.add(n.id);
    pool.push(n);
  }

  console.log('Bushehr + image + recent:', pool.length);

  // If not enough, fill with Bushehr no image + recent
  if (pool.length < slotDefs.length) {
    for (var n of all) {
      if (pool.length >= slotDefs.length + 5) break;
      if (!isBushehr(n)) continue;
      if (!n.publishedAt || n.publishedAt < cutoff) continue;
      if (seen.has(n.id)) continue;
      seen.add(n.id);
      pool.push(n);
    }
  }

  console.log('Pool total:', pool.length);

  for (var i = 0; i < slotDefs.length; i++) {
    var s = slotDefs[i];
    var n = pool[i % pool.length];
    if (!n) continue;
    await p.homepageSlot.create({
      data: {
        slotKey: s.slotKey, label: s.label, type: 'EXTERNAL',
        externalNewsId: n.id, isActive: true, order: s.order,
      },
    });
  }

  console.log('Assigned', slotDefs.length, 'slots');

  var slots = await p.homepageSlot.findMany({ include: { externalNews: true } });
  for (var s of slots) {
    var n = s.externalNews;
    var img = n && n.image && n.image.length > 10 ? 'IMG' : '---';
    var dt = n && n.publishedAt ? new Date(n.publishedAt).toLocaleDateString('fa-IR') : '?';
    var t = n ? n.title.substring(0, 50) : '?';
    console.log(s.slotKey.padEnd(15), img, dt.padEnd(12), t);
  }

  await p.$disconnect();
}

main().catch(function(e) { console.error(e); process.exit(1); });
