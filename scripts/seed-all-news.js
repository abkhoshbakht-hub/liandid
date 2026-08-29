const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const IMAGES = {
  oil: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=800',
  refinery: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800',
  petrochemical: 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800',
  port: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5eb19?w=800',
  ship: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800',
  cargo: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800',
  container: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5eb19?w=800',
  sea: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800',
  beach: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
  sunset_sea: 'https://images.unsplash.com/photo-1414609245224-afa02bfb3fda?w=800',
  persian_gulf: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800',
  city: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800',
  bushehr: 'https://images.unsplash.com/photo-1569023060615-d744b44e2b87?w=800',
  urban: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800',
  highway: 'https://images.unsplash.com/photo-1545579133-99bb5ab189bd?w=800',
  nature: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
  desert: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800',
  palm: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
  solar: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800',
  sports: 'https://images.unsplash.com/photo-1461896836934-bd45ba8a0bca?w=800',
  football: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800',
  wrestling: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800',
  sailing: 'https://images.unsplash.com/photo-1534224039826-c7a0eda0e6b3?w=800',
  technology: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
  network: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
  coding: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800',
  app: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
  culture: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800',
  museum: 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=800',
  music: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800',
  book: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800',
  market_old: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
  politics: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800',
  meeting: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
  parliament: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800',
  handshake: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800',
  social: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800',
  festival: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800',
  food_festival: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
  walking: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
  volunteer: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800',
  health: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800',
  hospital: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800',
  doctor: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800',
  science: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800',
  marine: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
  lab: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800',
  fish: 'https://images.unsplash.com/photo-1544551763-7793216df788?w=800',
  construction: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800',
  building: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
  crane: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=800',
  stadium: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800',
  energy_solar: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800',
  water: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800',
};

function cuid() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = 'clx';
  id += chars[Math.floor(Math.random() * 10)];
  id += chars[Math.floor(Math.random() * 36)];
  for (let i = 0; i < 22; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

const newsArticles = [
  // اقتصادی (Economic) - 5 articles
  {
    id: cuid(),
    title: 'افزایش ۴۰ درصدی صادرات نفت خام از پارس جنوبی',
    description: 'صادرات نفت خام از منطقه ویژه اقتصادی پارس جنوبی در بوشهر با افزایش ۴۰ درصدی نسبت به مدت مشابه سال گذشته به بیش از ۲ میلیون بشکه در روز رسید.',
    category: 'اقتصادی',
    imageUrl: IMAGES.refinery,
  },
  {
    id: cuid(),
    title: 'آغاز عملیات اجرایی بزرگترین پتروشیمی جنوب کشور در عسلویه',
    description: 'عملیات اجرایی بزرگترین پتروشیمی جنوب کشور با سرمایه‌گذاری ۵ میلیارد دلاری در منطقه ویژه اقتصادی عسلویه آغاز شد.',
    category: 'اقتصادی',
    imageUrl: IMAGES.petrochemical,
  },
  {
    id: cuid(),
    title: 'رشد ۲۵ درصدی تجارت دریایی بندر بوشهر',
    description: 'حجم تجارت دریایی بندر بوشهر در شش ماه اول سال جاری با رشد ۲۵ درصدی به بیش از ۱۵ میلیون تن رسید.',
    category: 'اقتصادی',
    imageUrl: IMAGES.cargo,
  },
  {
    id: cuid(),
    title: 'ساخت مسکن ملی در شهرستان جم با پیشرفت ۷۰ درصدی',
    description: 'پروژه مسکن ملی شهرستان جم با پیشرفت فیزیکی ۷۰ درصدی در حال اجراست و تا پایان سال به بهره‌برداری می‌رسد.',
    category: 'اقتصادی',
    imageUrl: IMAGES.building,
  },
  {
    id: cuid(),
    title: 'راه‌اندازی منطقه ویژه اقتصادی جدید در بندر دیر',
    description: 'منطقه ویژه اقتصادی جدید در بندر دیر با هدف جذب سرمایه‌گذاری خارجی و ایجاد اشتغال راه‌اندازی شد.',
    category: 'اقتصادی',
    imageUrl: IMAGES.ship,
  },
  // سیاسی (Political) - 5 articles
  {
    id: cuid(),
    title: 'بازدید استاندار بوشهر از طرح‌های عمرانی گناوه',
    description: 'استاندار بوشهر از طرح‌های عمرانی در حال اجرای شهرستان گناوه بازدید و بر تسریع در اجرای آنها تاکید کرد.',
    category: 'سیاسی',
    imageUrl: IMAGES.meeting,
  },
  {
    id: cuid(),
    title: 'نشست مشترک مسئولان استان با سفیر عمان در بوشهر',
    description: 'نشست مشترک مسئولان استان بوشهر با سفیر عمان در خصوص گسترش روابط تجاری و اقتصادی برگزار شد.',
    category: 'سیاسی',
    imageUrl: IMAGES.handshake,
  },
  {
    id: cuid(),
    title: 'تصویب طرح توسعه بندر رقابتی کنگان در شورای عالی',
    description: 'طرح توسعه بندر رقابتی کنگان در جلسه شورای عالی مناطق آزاد تصویب شد.',
    category: 'سیاسی',
    imageUrl: IMAGES.parliament,
  },
  {
    id: cuid(),
    title: 'انتخاب بوشهر به عنوان استان نمونه در مدیریت بحران',
    description: 'استان بوشهر به دلیل عملکرد موفق در مدیریت بحران سیلاب اخیر به عنوان استان نمونه کشوری انتخاب شد.',
    category: 'سیاسی',
    imageUrl: IMAGES.handshake,
  },
  {
    id: cuid(),
    title: 'بازدید نمایندگان مجلس از پالایشگاه فاز ۱۹ پارس جنوبی',
    description: 'هیئتی از نمایندگان مجلس شورای اسلامی از پالایشگاه فاز ۱۹ پارس جنوبی در عسلویه بازدید کردند.',
    category: 'سیاسی',
    imageUrl: IMAGES.meeting,
  },
  // اجتماعی (Social) - 5 articles
  {
    id: cuid(),
    title: 'برگزاری جشنواره غذای محلی در ساحل گناوه',
    description: 'جشنواره غذای محلی با حضور بیش از ۱۰۰ غذای سنتی بوشهری در ساحل گناوه برگزار شد.',
    category: 'اجتماعی',
    imageUrl: IMAGES.food_festival,
  },
  {
    id: cuid(),
    title: 'افتتاح بیمارستان جدید ۲۰۰ تختخوابی در بوشهر',
    description: 'بیمارستان جدید ۲۰۰ تختخوابی بوشهر با حضور مسئولان بهداشتی کشور افتتاح شد.',
    category: 'اجتماعی',
    imageUrl: IMAGES.hospital,
  },
  {
    id: cuid(),
    title: 'کمک به سیل‌زدگان شهرستان دشتی با ارسال محموله‌های امدادی',
    description: 'محموله‌های امدادی شامل مواد غذایی، پتو و لوازم بهداشتی به سیل‌زدگان شهرستان دشتی ارسال شد.',
    category: 'اجتماعی',
    imageUrl: IMAGES.volunteer,
  },
  {
    id: cuid(),
    title: 'آغاز ثبت‌نام طرح ملی توانمندسازی جوانان در بوشهر',
    description: 'ثبت‌نام طرح ملی توانمندسازی جوانان در استان بوشهر با هدف ایجاد اشتغال و کارآفرینی آغاز شد.',
    category: 'اجتماعی',
    imageUrl: IMAGES.social,
  },
  {
    id: cuid(),
    title: 'برگزاری همایش پیاده‌روی خانوادگی در بندر دیلم',
    description: 'همایش پیاده‌روی خانوادگی با شرکت بیش از ۲ هزار نفر در ساحل بندر دیلم برگزار شد.',
    category: 'اجتماعی',
    imageUrl: IMAGES.walking,
  },
  // فناوری (Technology) - 4 articles
  {
    id: cuid(),
    title: 'راه‌اندازی مرکز نوآوری فناوری اطلاعات در بوشهر',
    description: 'مرکز نوآوری فناوری اطلاعات با هدف حمایت از استارتاپ‌ها و کسب‌وکارهای دیجیتال در بوشهر راه‌اندازی شد.',
    category: 'فناوری',
    imageUrl: IMAGES.coding,
  },
  {
    id: cuid(),
    title: 'استقرار سیستم هوشمند مدیریت بنادر بوشهر',
    description: 'سیستم هوشمند مدیریت بنادر استان بوشهر با هدف افزایش بهره‌وری و کاهش زمان ترخیص کالا مستقر شد.',
    category: 'فناوری',
    imageUrl: IMAGES.network,
  },
  {
    id: cuid(),
    title: 'تولید اپلیکیشن موبایل برای رصد لحظه‌ای آب و هوا در خلیج فارس',
    description: 'اپلیکیشن موبایل برای رصد لحظه‌ای شرایط آب و هوایی خلیج فارس توسط متخصصان بوشهری توسعه یافت.',
    category: 'فناوری',
    imageUrl: IMAGES.app,
  },
  {
    id: cuid(),
    title: 'توسعه شبکه ۵G در مناطق صنعتی جنوب بوشهر',
    description: 'عملیات توسعه شبکه ۵G در مناطق صنعتی جنوب استان بوشهر شامل عسلویه و کنگان آغاز شد.',
    category: 'فناوری',
    imageUrl: IMAGES.network,
  },
  // ورزشی (Sports) - 4 articles
  {
    id: cuid(),
    title: 'قهرمانی تیم فوتبال شاهین بوشهر در لیگ دسته دوم',
    description: 'تیم فوتبال شاهین بوشهر با پیروزی مقابل حریفان به مقام قهرمانی لیگ دسته دوم کشور دست یافت.',
    category: 'ورزشی',
    imageUrl: IMAGES.football,
  },
  {
    id: cuid(),
    title: 'برگزاری مسابقات قایقرانی ساحلی در ساحل بندر ریگ',
    description: 'مسابقات قایقرانی ساحلی با شرکت ۱۵ تیم از استان‌های جنوبی کشور در ساحل بندر ریگ برگزار شد.',
    category: 'ورزشی',
    imageUrl: IMAGES.sailing,
  },
  {
    id: cuid(),
    title: 'انتخاب ۳ ورزشکار بوشهری به تیم ملی کشتی',
    description: 'سه ورزشکار بوشهری به تیم ملی کشتی آزاد ایران دعوت شدند.',
    category: 'ورزشی',
    imageUrl: IMAGES.wrestling,
  },
  {
    id: cuid(),
    title: 'آغاز لیگ فوتبال ساحلی در بوشهر با حضور ۸ تیم',
    description: 'لیگ فوتبال ساحلی استان بوشهر با حضور ۸ تیم از شهرستان‌های مختلف آغاز شد.',
    category: 'ورزشی',
    imageUrl: IMAGES.stadium,
  },
  // فرهنگی (Cultural) - 4 articles
  {
    id: cuid(),
    title: 'بازسازی بافت تاریخی بازار قدیم بوشهر',
    description: 'عملیات بازسازی و مرمت بافت تاریخی بازار قدیم بوشهر با هدف حفظ میراث فرهنگی آغاز شد.',
    category: 'فرهنگی',
    imageUrl: IMAGES.market_old,
  },
  {
    id: cuid(),
    title: 'برگزاری جشنواره موسیقی محلی بوشهر',
    description: 'جشنواره موسیقی محلی بوشهر با حضور هنرمندان برجسته استان در تالار لیان برگزار شد.',
    category: 'فرهنگی',
    imageUrl: IMAGES.music,
  },
  {
    id: cuid(),
    title: 'افتتاح موزه صنعت نفت در عسلویه',
    description: 'موزه صنعت نفت با هدف معرفی تاریخچه صنعت نفت در منطقه پارس جنوبی در عسلویه افتتاح شد.',
    category: 'فرهنگی',
    imageUrl: IMAGES.museum,
  },
  {
    id: cuid(),
    title: 'چاپ کتاب دایرةالمعارف بوشهرشناسی',
    description: 'کتاب دایرةالمعارف بوشهرشناسی با بیش از ۱۰۰۰ صفحه توسط انتشارات دانشگاه خلیج فارس چاپ شد.',
    category: 'فرهنگی',
    imageUrl: IMAGES.book,
  },
  // علمی (Scientific) - 4 articles
  {
    id: cuid(),
    title: 'کشف گونه جدید جانوری در آب‌های خلیج فارس',
    description: 'محققان دانشگاه خلیج فارس موفق به کشف گونه جدیدی از جانوران دریایی در آب‌های خلیج فارس شدند.',
    category: 'علمی',
    imageUrl: IMAGES.marine,
  },
  {
    id: cuid(),
    title: 'راه‌اندازی آزمایشگاه تحقیقاتی انرژی‌های نو در بوشهر',
    description: 'آزمایشگاه تحقیقاتی انرژی‌های نو با هدف بررسی پتانسیل انرژی خورشیدی و بادی در بوشهر راه‌اندازی شد.',
    category: 'علمی',
    imageUrl: IMAGES.lab,
  },
  {
    id: cuid(),
    title: 'همکاری مشترک دانشگاه بوشهر و دانشگاه کمبریج',
    description: 'تفاهم‌نامه همکاری مشترک بین دانشگاه خلیج فارس و دانشگاه کمبریج انگلستان در حوزه علوم دریایی امضا شد.',
    category: 'علمی',
    imageUrl: IMAGES.lab,
  },
  {
    id: cuid(),
    title: 'ثبت رکورد جدید در تولید میگوی پرورشی در بوشهر',
    description: 'تولید میگوی پرورشی در مزارع استان بوشهر با ثبت رکورد جدید ۵۰ هزار تن در سال به بالاترین حد خود رسید.',
    category: 'علمی',
    imageUrl: IMAGES.fish,
  },
  // استانی (Provincial) - 4 articles
  {
    id: cuid(),
    title: 'آغاز عملیات اجرایی بزرگراه بوشهر - برازجان',
    description: 'عملیات اجرایی بزرگراه بوشهر - برازجان با اعتبار ۲ هزار میلیارد ریال آغاز شد.',
    category: 'استانی',
    imageUrl: IMAGES.highway,
  },
  {
    id: cuid(),
    title: 'تأمین آب شرب شهرستان‌های ساحلی با انتقال آب از خلیج فارس',
    description: 'طرح انتقال آب شرب از خلیج فارس با استفاده از فناوری اسمز معکوس برای تأمین آب شهرستان‌های ساحلی اجرا شد.',
    category: 'استانی',
    imageUrl: IMAGES.water,
  },
  {
    id: cuid(),
    title: 'بهره‌برداری از نیروگاه خورشیدی ۱۰ مگاواتی در تنگستان',
    description: 'نیروگاه خورشیدی ۱۰ مگاواتی در شهرستان تنگستان با حضور مسئولان بهره‌برداری شد.',
    category: 'استانی',
    imageUrl: IMAGES.energy_solar,
  },
  {
    id: cuid(),
    title: 'ارتقای سطح شهر خارگ به شهرستان',
    description: 'با تصویب هیئت دولت، سطح شهر خارگ از بخش به شهرستان ارتقا یافت.',
    category: 'استانی',
    imageUrl: IMAGES.urban,
  },
];

const slotDefinitions = [
  { slotKey: 'breaking-1', label: 'خبر فوری ۱', order: 1 },
  { slotKey: 'breaking-2', label: 'خبر فوری ۲', order: 2 },
  { slotKey: 'breaking-3', label: 'خبر فوری ۳', order: 3 },
  { slotKey: 'breaking-4', label: 'خبر فوری ۴', order: 4 },
  { slotKey: 'breaking-5', label: 'خبر فوری ۵', order: 5 },
  { slotKey: 'latest-1', label: 'آخرین اخبار ۱', order: 6 },
  { slotKey: 'latest-2', label: 'آخرین اخبار ۲', order: 7 },
  { slotKey: 'latest-3', label: 'آخرین اخبار ۳', order: 8 },
  { slotKey: 'latest-4', label: 'آخرین اخبار ۴', order: 9 },
  { slotKey: 'latest-5', label: 'آخرین اخبار ۵', order: 10 },
  { slotKey: 'latest-6', label: 'آخرین اخبار ۶', order: 11 },
  { slotKey: 'latest-7', label: 'آخرین اخبار ۷', order: 12 },
  { slotKey: 'latest-8', label: 'آخرین اخبار ۸', order: 13 },
  { slotKey: 'latest-9', label: 'آخرین اخبار ۹', order: 14 },
  { slotKey: 'latest-10', label: 'آخرین اخبار ۱۰', order: 15 },
  { slotKey: 'analysis-1', label: 'تحلیل و بررسی ۱', order: 16 },
  { slotKey: 'analysis-2', label: 'تحلیل و بررسی ۲', order: 17 },
  { slotKey: 'analysis-3', label: 'تحلیل و بررسی ۳', order: 18 },
];

async function main() {
  console.log('=== شروع ریز داده‌های اخبار استان بوشهر ===\n');

  console.log('🗑️  حذف اسلات‌های موجود صفحه اصلی...');
  await prisma.homepageSlot.deleteMany();
  console.log('✅ اسلات‌های موجود حذف شدند.\n');

  console.log('🗑️  حذف اخبار قبلی...');
  await prisma.externalNews.deleteMany();
  console.log('✅ اخبار قبلی حذف شدند.\n');

  console.log(`📰 ایجاد ${newsArticles.length} خبر...`);
  const createdNews = [];

  for (const article of newsArticles) {
    const publishedAt = new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000));
    const news = await prisma.externalNews.create({
      data: {
        id: article.id,
        title: article.title,
        description: article.description,
        category: article.category,
        image: article.imageUrl,
        link: article.link || `https://liandid.ir/news/${article.id}`,
        source: 'liandid',
        sourceName: 'لیان دید',
        status: 'APPROVED',
        publishedAt,
        fetchedAt: publishedAt,
      },
    });
    createdNews.push(news);
    console.log(`  ✅ [${article.category}] ${article.title}`);
  }
  console.log(`\n✅ ${createdNews.length} خبر با موفقیت ایجاد شد.\n`);

  console.log('📌 تخصیص اخبار به اسلات‌های صفحه اصلی...');
  for (const slot of slotDefinitions) {
    const randomNews = createdNews[Math.floor(Math.random() * createdNews.length)];
    await prisma.homepageSlot.upsert({
      where: { slotKey: slot.slotKey },
      update: {
        type: 'EXTERNAL',
        externalNewsId: randomNews.id,
        isActive: true,
        order: slot.order,
      },
      create: {
        slotKey: slot.slotKey,
        label: slot.label,
        type: 'EXTERNAL',
        externalNewsId: randomNews.id,
        isActive: true,
        order: slot.order,
      },
    });
    console.log(`  ✅ [${slot.slotKey}] ← ${randomNews.title.substring(0, 40)}...`);
  }

  console.log('\n✅ تمام اسلات‌ها با موفقیت تخصیص یافتند.');
  console.log('\n=== ریز داده‌ها با موفقیت انجام شد ===');
}

main()
  .catch((e) => {
    console.error('❌ خطا در ریز داده‌ها:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
