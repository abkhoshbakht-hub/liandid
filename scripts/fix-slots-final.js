const { PrismaClient } = require('@prisma/client');
var p = new PrismaClient();

var BUSHEHR_TITLE = /بوشهر(ی|ستان)?|عسلویه|کنگان(ی)?|گناوه(ای)?|(?<![مد])دیر(?!کل|یت|عامل|ان|انه)|تنگستان(ی)?|دیلم(ی)?|خارگ(ی)?|برازجان(ی)?|دشتستان(ی)?|جم‌پیلن|کیمیای پارس|پارس جنوبی|نخل تقی|سیراف(ی)?|اهرم(ی)?|چاه‌مبارک|پارسیان(ی)?/i;

  var slotDefs = [
    { slotKey: 'hero-main', label: 'خبر اصلی', order: 0, priority: 'bushehr-img' },
    { slotKey: 'hero-side-1', label: 'خبر فرعی ۱', order: 1, priority: 'bushehr-img' },
    { slotKey: 'hero-side-2', label: 'خبر فرعی ۲', order: 2, priority: 'bushehr-img' },
    { slotKey: 'breaking-1', label: 'فوری ۱', order: 3, priority: 'bushehr-img' },
    { slotKey: 'breaking-2', label: 'فوری ۲', order: 4, priority: 'bushehr-img' },
    { slotKey: 'breaking-3', label: 'فوری ۳', order: 5, priority: 'bushehr-img' },
    { slotKey: 'breaking-4', label: 'فوری ۴', order: 6, priority: 'bushehr' },
    { slotKey: 'breaking-5', label: 'فوری ۵', order: 7, priority: 'bushehr' },
    { slotKey: 'analysis-1', label: 'تحلیل ۱', order: 8, priority: 'bushehr-img' },
    { slotKey: 'analysis-2', label: 'تحلیل ۲', order: 9, priority: 'bushehr-img' },
    { slotKey: 'analysis-3', label: 'تحلیل ۳', order: 10, priority: 'bushehr' },
    { slotKey: 'latest-1', label: 'آخرین ۱', order: 11, priority: 'bushehr' },
    { slotKey: 'latest-2', label: 'آخرین ۲', order: 12, priority: 'bushehr' },
    { slotKey: 'latest-3', label: 'آخرین ۳', order: 13, priority: 'bushehr' },
    { slotKey: 'latest-4', label: 'آخرین ۴', order: 14, priority: 'bushehr' },
    { slotKey: 'latest-5', label: 'آخرین ۵', order: 15, priority: 'bushehr' },
    { slotKey: 'latest-6', label: 'آخرین ۶', order: 16, priority: 'bushehr' },
    { slotKey: 'latest-7', label: 'آخرین ۷', order: 17, priority: 'national' },
    { slotKey: 'latest-8', label: 'آخرین ۸', order: 18, priority: 'national' },
    { slotKey: 'latest-9', label: 'آخرین ۹', order: 19, priority: 'national' },
    { slotKey: 'latest-10', label: 'آخرین ۱۰', order: 20, priority: 'national' },
  ];

var NATIONAL_SOURCES = ['ایرنا', 'ایسنا', 'مهر', 'فارس', 'تسنیم'];

function isBushehr(n) {
  // Check title only - not description (description has "بوشهرنیوز" attribution)
  if (BUSHEHR_TITLE.test(n.title)) return true;
  // Also check Bushehr source names that ONLY publish Bushehr news
  if (n.sourceName === 'بوشهر نیوز' || n.sourceName === 'بوشهر خبر') {
    // But only if title actually relates to Bushehr (not national reposts)
    var national = /پلیس تهران|تهران بزرگ|رگ خونی|لبنیات|بیماران کلیوی|هشدار پلیس|بانک دی|ایران خودرو|قرعه کشی|مدیران خودرو|مستمری|مددجویان|پرستاران|کالابرگ/i;
    if (national.test(n.title)) return false;
    return true;
  }
  return false;
}

function hasImg(n) {
  return n.image && n.image.length > 10 && n.image.startsWith('http');
}

function isNationalSource(n) {
  return NATIONAL_SOURCES.indexOf(n.sourceName) >= 0;
}

async function main() {
  await p.homepageSlot.deleteMany();
  var all = await p.externalNews.findMany({ where: { status: 'APPROVED' }, orderBy: { publishedAt: 'desc' } });
  var cutoff = new Date(Date.now() - 180 * 24 * 3600000);
  var recent = all.filter(function(n) { return n.publishedAt && n.publishedAt >= cutoff; });

  // Bushehr pool: with images first, then without
  var bushehrImg = recent.filter(function(n) { return isBushehr(n) && hasImg(n); });
  var bushehrNoImg = recent.filter(function(n) { return isBushehr(n) && !hasImg(n); });
  var bushehrPool = bushehrImg.concat(bushehrNoImg);

  // National pool: only from 5 agencies, with images only
  var nationalPool = recent.filter(function(n) { return isNationalSource(n) && hasImg(n) && !isBushehr(n); });

  console.log('Bushehr: ' + bushehrPool.length + ' (' + bushehrImg.length + ' img, ' + bushehrNoImg.length + ' no img)');
  console.log('National (5 agencies): ' + nationalPool.length);

  // 70% Bushehr: hero(3) + breaking(5) + latest1-6(6) + analysis1-3(3) = 17
  // 30% National: latest7-10(4) = 4
  var usedIds = {};
  var bImgIdx = 0, bIdx = 0, nIdx = 0;

  for (var i = 0; i < slotDefs.length; i++) {
    var s = slotDefs[i];
    var n = null;
    var pool, pIdx;
    
    if (s.priority === 'bushehr-img') {
      pool = bushehrImg; pIdx = bImgIdx;
    } else if (s.priority === 'bushehr') {
      pool = bushehrPool; pIdx = bIdx;
    } else {
      pool = nationalPool; pIdx = nIdx;
    }
    
    for (var a = 0; a < pool.length; a++) {
      var idx = (pIdx + a) % pool.length;
      if (!usedIds[pool[idx].id]) {
        n = pool[idx];
        if (s.priority === 'bushehr-img') bImgIdx = (idx + 1) % pool.length;
        else if (s.priority === 'bushehr') bIdx = (idx + 1) % pool.length;
        else nIdx = (idx + 1) % pool.length;
        break;
      }
    }
    
    if (!n) continue;
    usedIds[n.id] = true;
    await p.homepageSlot.create({
      data: { slotKey: s.slotKey, label: s.label, type: 'EXTERNAL', externalNewsId: n.id, isActive: true, order: s.order },
    });
  }

  console.log('Bushehr used: ' + bIdx + ', National used: ' + nIdx);

  var slots = await p.homepageSlot.findMany({ include: { externalNews: true } });
  for (var j = 0; j < slots.length; j++) {
    var sl = slots[j];
    var nn = sl.externalNews;
    var img = nn && hasImg(nn) ? 'IMG' : '---';
    var dt = nn && nn.publishedAt ? new Date(nn.publishedAt).toLocaleDateString('fa-IR') : '?';
    var t = nn ? nn.title.substring(0, 55) : '?';
    var src = nn ? nn.sourceName : '?';
    var b = isBushehr(nn) ? 'B' : 'N';
    console.log(b + ' ' + sl.slotKey.padEnd(15) + img + ' ' + dt.padEnd(12) + t);
  }
  await p.$disconnect();
}

main().catch(function(e) { console.error(e); process.exit(1); });
