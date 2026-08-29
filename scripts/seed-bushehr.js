const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

function cuid() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = 'clx';
  id += chars[Math.floor(Math.random() * 10)];
  id += chars[Math.floor(Math.random() * 36)];
  for (let i = 0; i < 22; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

const news = [
  // اقتصادی بوشهر
  { title: 'افزایش صادرات نفت خام از پارس جنوبی به بیش از ۲ میلیون بشکه', description: 'صادرات نفت خام از منطقه ویژه اقتصادی پارس جنوبی در بوشهر با افزایش قابل توجهی نسبت به مدت مشابه سال گذشته روبرو شد.', category: 'اقتصادی', image: 'https://img9.irna.ir/d/r2/2026/08/11/4/173032248.jpg', source: 'irna', sourceName: 'ایرنا بوشهر' },
  { title: 'بهره‌برداری از فاز توسعه پتروشیمی بوشهر با سرمایه‌گذاری ۲ میلیارد دلاری', description: 'فاز توسعه مجتمع پتروشیمی بوشهر با اشتغال‌زایی مستقیم برای ۳۰۰۰ نفر به بهره‌برداری رسید.', category: 'اقتصادی', image: 'https://cdn.isna.ir/d/2026/08/11/4/63931585.jpg', source: 'isna', sourceName: 'ایسنا' },
  { title: 'رشد ۲۵ درصدی تجارت دریایی بندر بوشهر', description: 'حجم تجارت دریایی بندر بوشهر در شش ماه اول سال جاری با رشد چشمگیری به بیش از ۱۵ میلیون تن رسید.', category: 'اقتصادی', image: 'https://media.mehrnews.com/d/2026/08/11/4/6128870.jpg', source: 'mehr', sourceName: 'مهر' },
  { title: 'ساخت مسکن ملی در شهرستان جم با پیشرفت ۷۰ درصدی', description: 'پروژه مسکن ملی شهرستان جم با پیشرفت فیزیکی ۷۰ درصدی در حال اجراست و تا پایان سال به بهره‌برداری می‌رسد.', category: 'اقتصادی', image: 'https://cdn.isna.ir/d/2026/08/11/4/63931588.jpg', source: 'isna', sourceName: 'ایسنا' },
  { title: 'راه‌اندازی منطقه ویژه اقتصادی جدید در بندر دیر', description: 'منطقه ویژه اقتصادی جدید در بندر دیر با هدف جذب سرمایه‌گذاری خارجی و ایجاد اشتغال راه‌اندازی شد.', category: 'اقتصادی', image: 'https://media.mehrnews.com/d/2026/08/07/4/6124589.jpg', source: 'mehr', sourceName: 'مهر' },

  // سیاسی بوشهر
  { title: 'بازدید استاندار بوشهر از طرح‌های عمرانی گناوه', description: 'استاندار بوشهر از طرح‌های عمرانی در حال اجرای شهرستان گناوه بازدید و بر تسریع در اجرای آنها تاکید کرد.', category: 'سیاسی', image: 'https://img9.irna.ir/d/r2/2026/08/10/4/173031201.jpg', source: 'irna', sourceName: 'ایرنا بوشهر' },
  { title: 'نشست مشترک مسئولان استان با سفیر عمان در بوشهر', description: 'نشست مشترک مسئولان استان بوشهر با سفیر عمان در خصوص گسترش روابط تجاری و اقتصادی برگزار شد.', category: 'سیاسی', image: 'https://img9.irna.ir/d/r2/2026/08/11/4/173032165.jpg', source: 'irna', sourceName: 'ایرنا بوشهر' },
  { title: 'انتخاب بوشهر به عنوان استان نمونه در مدیریت بحران', description: 'استان بوشهر به دلیل عملکرد موفق در مدیریت بحران سیلاب اخیر به عنوان استان نمونه کشوری انتخاب شد.', category: 'سیاسی', image: 'https://cdn.isna.ir/d/2026/08/11/4/63931535.jpg', source: 'isna', sourceName: 'ایسنا' },
  { title: 'بازدید نمایندگان مجلس از پالایشگاه فاز ۱۹ پارس جنوبی', description: 'هیئتی از نمایندگان مجلس شورای اسلامی از پالایشگاه فاز ۱۹ پارس جنوبی در عسلویه بازدید کردند.', category: 'سیاسی', image: 'https://media.mehrnews.com/d/2026/08/11/4/6128870.jpg', source: 'mehr', sourceName: 'مهر' },
  { title: 'تصویب طرح توسعه بندر رقابتی کنگان در شورای عالی', description: 'طرح توسعه بندر رقابتی کنگان در جلسه شورای عالی مناطق آزاد تصویب شد.', category: 'سیاسی', image: 'https://img9.irna.ir/d/r2/2026/08/11/4/173032255.jpg', source: 'irna', sourceName: 'ایرنا بوشهر' },

  // اجتماعی بوشهر
  { title: 'برگزاری جشنواره غذای محلی در ساحل گناوه', description: 'جشنواره غذای محلی با حضور بیش از ۱۰۰ غذای سنتی بوشهری در ساحل گناوه برگزار شد.', category: 'اجتماعی', image: 'https://cdn.isna.ir/d/2026/08/11/4/63931585.jpg', source: 'isna', sourceName: 'ایسنا' },
  { title: 'افتتاح بیمارستان جدید ۲۰۰ تختخوابی در بوشهر', description: 'بیمارستان جدید ۲۰۰ تختخوابی بوشهر با حضور مسئولان بهداشتی کشور افتتاح شد.', category: 'اجتماعی', image: 'https://media.mehrnews.com/d/2026/08/11/4/6128870.jpg', source: 'mehr', sourceName: 'مهر' },
  { title: 'کمک به سیل‌زدگان شهرستان دشتی با ارسال محموله‌های امدادی', description: 'محموله‌های امدادی شامل مواد غذایی، پتو و لوازم بهداشتی به سیل‌زدگان شهرستان دشتی ارسال شد.', category: 'اجتماعی', image: 'https://img9.irna.ir/d/r2/2026/08/11/4/173032248.jpg', source: 'irna', sourceName: 'ایرنا بوشهر' },
  { title: 'آغاز ثبت‌نام طرح ملی توانمندسازی جوانان در بوشهر', description: 'ثبت‌نام طرح ملی توانمندسازی جوانان در استان بوشهر با هدف ایجاد اشتغال و کارآفرینی آغاز شد.', category: 'اجتماعی', image: 'https://cdn.isna.ir/d/2026/08/11/4/63931588.jpg', source: 'isna', sourceName: 'ایسنا' },
  { title: 'برگزاری همایش پیاده‌روی خانوادگی در بندر دیلم', description: 'همایش پیاده‌روی خانوادگی با شرکت بیش از ۲ هزار نفر در ساحل بندر دیلم برگزار شد.', category: 'اجتماعی', image: 'https://media.mehrnews.com/d/2026/08/07/4/6124589.jpg', source: 'mehr', sourceName: 'مهر' },

  // فناوری بوشهر
  { title: 'راه‌اندازی مرکز نوآوری فناوری اطلاعات در بوشهر', description: 'مرکز نوآوری فناوری اطلاعات با هدف حمایت از استارتاپ‌ها و کسب‌وکارهای دیجیتال در بوشهر راه‌اندازی شد.', category: 'فناوری', image: 'https://img9.irna.ir/d/r2/2026/08/10/4/173031201.jpg', source: 'irna', sourceName: 'ایرنا بوشهر' },
  { title: 'استقرار سیستم هوشمند مدیریت بنادر بوشهر', description: 'سیستم هوشمند مدیریت بنادر استان بوشهر با هدف افزایش بهره‌وری و کاهش زمان ترخیص کالا مستقر شد.', category: 'فناوری', image: 'https://cdn.isna.ir/d/2026/08/11/4/63931535.jpg', source: 'isna', sourceName: 'ایسنا' },
  { title: 'تولید اپلیکیشن موبایل برای رصد لحظه‌ای آب و هوا در خلیج فارس', description: 'اپلیکیشن موبایل برای رصد لحظه‌ای شرایط آب و هوایی خلیج فارس توسط متخصصان بوشهری توسعه یافت.', category: 'فناوری', image: 'https://media.mehrnews.com/d/2026/08/11/4/6128870.jpg', source: 'mehr', sourceName: 'مهر' },
  { title: 'توسعه شبکه ۵G در مناطق صنعتی جنوب بوشهر', description: 'عملیات توسعه شبکه ۵G در مناطق صنعتی جنوب استان بوشهر شامل عسلویه و کنگان آغاز شد.', category: 'فناوری', image: 'https://img9.irna.ir/d/r2/2026/08/11/4/173032165.jpg', source: 'irna', sourceName: 'ایرنا بوشهر' },

  // ورزشی بوشهر
  { title: 'قهرمانی تیم فوتبال شاهین بوشهر در لیگ دسته دوم', description: 'تیم فوتبال شاهین بوشهر با پیروزی مقابل حریفان به مقام قهرمانی لیگ دسته دوم کشور دست یافت.', category: 'ورزشی', image: 'https://cdn.isna.ir/d/2026/08/11/4/63931585.jpg', source: 'isna', sourceName: 'ایسنا' },
  { title: 'برگزاری مسابقات قایقرانی ساحلی در ساحل بندر ریگ', description: 'مسابقات قایقرانی ساحلی با شرکت ۱۵ تیم از استان‌های جنوبی کشور در ساحل بندر ریگ برگزار شد.', category: 'ورزشی', image: 'https://media.mehrnews.com/d/2026/08/11/4/6128870.jpg', source: 'mehr', sourceName: 'مهر' },
  { title: 'انتخاب ۳ ورزشکار بوشهری به تیم ملی کشتی', description: 'سه ورزشکار بوشهری به تیم ملی کشتی آزاد ایران دعوت شدند.', category: 'ورزشی', image: 'https://img9.irna.ir/d/r2/2026/08/11/4/173032255.jpg', source: 'irna', sourceName: 'ایرنا بوشهر' },
  { title: 'آغاز لیگ فوتبال ساحلی در بوشهر با حضور ۸ تیم', description: 'لیگ فوتبال ساحلی استان بوشهر با حضور ۸ تیم از شهرستان‌های مختلف آغاز شد.', category: 'ورزشی', image: 'https://cdn.isna.ir/d/2026/08/11/4/63931588.jpg', source: 'isna', sourceName: 'ایسنا' },

  // فرهنگی بوشهر
  { title: 'بازسازی بافت تاریخی بازار قدیم بوشهر', description: 'عملیات بازسازی و مرمت بافت تاریخی بازار قدیم بوشهر با هدف حفظ میراث فرهنگی آغاز شد.', category: 'فرهنگی', image: 'https://img9.irna.ir/d/r2/2026/08/10/4/173031201.jpg', source: 'irna', sourceName: 'ایرنا بوشهر' },
  { title: 'برگزاری جشنواره موسیقی محلی بوشهر', description: 'جشنواره موسیقی محلی بوشهر با حضور هنرمندان برجسته استان در تالار لیان برگزار شد.', category: 'فرهنگی', image: 'https://media.mehrnews.com/d/2026/08/07/4/6124589.jpg', source: 'mehr', sourceName: 'مهر' },
  { title: 'افتتاح موزه صنعت نفت در عسلویه', description: 'موزه صنعت نفت با هدف معرفی تاریخچه صنعت نفت در منطقه پارس جنوبی در عسلویه افتتاح شد.', category: 'فرهنگی', image: 'https://cdn.isna.ir/d/2026/08/11/4/63931535.jpg', source: 'isna', sourceName: 'ایسنا' },
  { title: 'چاپ کتاب دایرةالمعارف بوشهرشناسی', description: 'کتاب دایرةالمعارف بوشهرشناسی با بیش از ۱۰۰۰ صفحه توسط انتشارات دانشگاه خلیج فارس چاپ شد.', category: 'فرهنگی', image: 'https://img9.irna.ir/d/r2/2026/08/11/4/173032165.jpg', source: 'irna', sourceName: 'ایرنا بوشهر' },

  // علمی بوشهر
  { title: 'کشف گونه جدید جانوری در آب‌های خلیج فارس', description: 'محققان دانشگاه خلیج فارس موفق به کشف گونه جدیدی از جانوران دریایی در آب‌های خلیج فارس شدند.', category: 'علمی', image: 'https://media.mehrnews.com/d/2026/08/11/4/6128870.jpg', source: 'mehr', sourceName: 'مهر' },
  { title: 'راه‌اندازی آزمایشگاه تحقیقاتی انرژی‌های نو در بوشهر', description: 'آزمایشگاه تحقیقاتی انرژی‌های نو با هدف بررسی پتانسیل انرژی خورشیدی و بادی در بوشهر راه‌اندازی شد.', category: 'علمی', image: 'https://cdn.isna.ir/d/2026/08/11/4/63931585.jpg', source: 'isna', sourceName: 'ایسنا' },
  { title: 'همکاری مشترک دانشگاه بوشهر و دانشگاه کمبریج', description: 'تفاهم‌نامه همکاری مشترک بین دانشگاه خلیج فارس و دانشگاه کمبریج انگلستان امضا شد.', category: 'علمی', image: 'https://img9.irna.ir/d/r2/2026/08/11/4/173032248.jpg', source: 'irna', sourceName: 'ایرنا بوشهر' },
  { title: 'ثبت رکورد جدید در تولید میگوی پرورشی در بوشهر', description: 'تولید میگوی پرورشی در مزارع استان بوشهر با ثبت رکورد جدید به بالاترین حد خود رسید.', category: 'علمی', image: 'https://media.mehrnews.com/d/2026/08/07/4/6124589.jpg', source: 'mehr', sourceName: 'مهر' },

  // استانی بوشهر
  { title: 'آغاز عملیات اجرایی بزرگراه بوشهر - برازجان', description: 'عملیات اجرایی بزرگراه بوشهر - برازجان با اعتبار ۲ هزار میلیارد ریال آغاز شد.', category: 'استانی', image: 'https://img9.irna.ir/d/r2/2026/08/11/4/173032255.jpg', source: 'irna', sourceName: 'ایرنا بوشهر' },
  { title: 'تأمین آب شرب شهرستان‌های ساحلی با انتقال آب از خلیج فارس', description: 'طرح انتقال آب شرب از خلیج فارس با استفاده از فناوری اسمز معکوس اجرا شد.', category: 'استانی', image: 'https://cdn.isna.ir/d/2026/08/11/4/63931588.jpg', source: 'isna', sourceName: 'ایسنا' },
  { title: 'بهره‌برداری از نیروگاه خورشیدی ۱۰ مگاواتی در تنگستان', description: 'نیروگاه خورشیدی ۱۰ مگاواتی در شهرستان تنگستان با حضور مسئولان بهره‌برداری شد.', category: 'استانی', image: 'https://media.mehrnews.com/d/2026/08/11/4/6128870.jpg', source: 'mehr', sourceName: 'مهر' },
  { title: 'ارتقای سطح شهر خارگ به شهرستان', description: 'با تصویب هیئت دولت، سطح شهر خارگ از بخش به شهرستان ارتقا یافت.', category: 'استانی', image: 'https://img9.irna.ir/d/r2/2026/08/10/4/173031201.jpg', source: 'irna', sourceName: 'ایرنا بوشهر' },
];

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

async function main() {
  // Delete old national news
  const d1 = await p.homepageSlot.deleteMany();
  const d2 = await p.externalNews.deleteMany();
  console.log(`Deleted ${d1.count} slots, ${d2.count} news`);

  // Create Bushehr news
  const created = [];
  for (const n of news) {
    const publishedAt = new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000));
    const item = await p.externalNews.create({
      data: {
        id: cuid(), title: n.title, description: n.description, category: n.category,
        image: n.image, link: `https://liandid.ir/news/${cuid()}`,
        source: n.source, sourceName: n.sourceName, status: 'APPROVED',
        publishedAt, fetchedAt: publishedAt,
      },
    });
    created.push(item);
  }
  console.log(`Created ${created.length} Bushehr news`);

  // Assign to slots
  for (let i = 0; i < slotDefs.length; i++) {
    const s = slotDefs[i];
    const n = created[i % created.length];
    await p.homepageSlot.upsert({
      where: { slotKey: s.slotKey },
      update: { type: 'EXTERNAL', externalNewsId: n.id, isActive: true, order: s.order },
      create: { slotKey: s.slotKey, label: s.label, type: 'EXTERNAL', externalNewsId: n.id, isActive: true, order: s.order },
    });
  }
  console.log(`Assigned ${slotDefs.length} slots`);
  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
