// کلاس‌بندی خودکار خبرهای موجود RSS به زیرموضوع‌ها و ذخیره در فیلد topic
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

// کلیدواژه‌های زیرموضوع‌ها (هماهنگ با src/lib/topics.ts)
const TOPICS = [
  { slug: 'rahbari', category: 'siyasi', keywords: ['مقام معظم رهبری', 'رهبر انقلاب', 'آیت‌الله خامنه‌ای', 'امام خامنه‌ای', 'بیت رهبری', 'نماینده ولی فقیه'] },
  { slug: 'dolat', category: 'siyasi', keywords: ['دولت', 'کابینه', 'وزیر', 'وزارت', 'هیئت وزیران', 'رئیس جمهور', 'معاون اول', 'نشست هیئت دولت', 'سخنگوی دولت', 'دولت چهاردهم', 'پاستور'] },
  { slug: 'majles', category: 'siyasi', keywords: ['مجلس', 'نماینده', 'نمایندگان', 'نطق', 'طرح دوفوریتی', 'کمیسیون مجلس', 'بهارستان', 'رییس مجلس', 'رئیس مجلس'] },
  { slug: 'siyasat-khareji', category: 'siyasi', keywords: ['سیاست خارجی', 'وزارت خارجه', 'سفیر', 'سفارت', 'دیپلماسی', 'مذاکرات', 'هیئت مذاکره', 'برجام', 'تحریم', 'سازمان ملل', 'آژانس'] },
  { slug: 'ahzab', category: 'siyasi', keywords: ['حزب', 'احزاب', 'جبهه', 'اصولگرایان', 'اصلاح‌طلبان', 'تشکل سیاسی', 'انتخابات'] },
  { slug: 'amniyat-defa', category: 'siyasi', keywords: ['سپاه', 'ارتش', 'وزارت دفاع', 'دفاع مقدس', 'امنیت', 'فرمانده کل', 'موشک', 'پدافند', 'نیروی دریایی', 'نیروی هوایی', 'نیروی زمینی'] },
  { slug: 'eghtesad-iran', category: 'eghtesadi', keywords: ['اقتصاد ایران', 'تورم', 'بودجه', 'یارانه', 'قیمت', 'بازار', 'تجارت', 'بانک مرکزی', 'سود', 'تسهیلات', 'کالابرگ', 'قیمت طلا', 'قیمت دلار', 'ارز'] },
  { slug: 'eghtesad-jahan', category: 'eghtesadi', keywords: ['اقتصاد جهانی', 'صندوق بین‌المللی پول', 'بانک جهانی', 'بازار جهانی', 'وال‌استریت', 'اقتصاد آمریکا', 'اقتصاد چین', 'اوپک', 'نرخ بهره آمریکا'] },
  { slug: 'bours', category: 'eghtesadi', keywords: ['بورس', 'شاخص کل', 'فرابورس', 'سهام', 'سرمایه‌گذاری', 'سرمایه‌گذار', 'عرضه اولیه', 'نقدشوندگی', 'حقیقی', 'حقوقی'] },
  { slug: 'maskan', category: 'eghtesadi', keywords: ['مسکن', 'ملک', 'اجاره', 'رهن', 'نهضت ملی مسکن', 'ساخت و ساز', 'املاک', 'سقف اجاره', 'قیمت مسکن'] },
  { slug: 'energy', category: 'eghtesadi', keywords: ['انرژی', 'نفت', 'گاز', 'بنزین', 'برق', 'نیروگاه', 'پتروشیمی', 'پالایشگاه', 'گازوئیل', 'پارس جنوبی', 'صادرات نفت'] },
  { slug: 'keshavarzi-sanat', category: 'eghtesadi', keywords: ['کشاورزی', 'زراعت', 'گندم', 'محصولات کشاورزی', 'صنعت', 'کارخانه', 'معدن', 'فولاد', 'خودروسازی', 'تولید داخلی', 'واحد تولیدی'] },
  { slug: 'havades', category: 'ejtemaei', keywords: ['حادثه', 'تصادف', 'آتش سوزی', 'زلزله', 'قتل', 'مصدوم', 'کشته', 'مجروح', 'آسیب‌دیده', 'سقوط', 'غرق', 'نزاع', 'درگیری', 'کشف جسد', 'تیراندازی', 'سرقت'] },
  { slug: 'behdasht', category: 'ejtemaei', keywords: ['بهداشت', 'درمان', 'بیمارستان', 'بیمار', 'پزشک', 'دارو', 'واکسن', 'سلامت', 'اورژانس', 'وزارت بهداشت', 'علوم پزشکی', 'پرستار', 'بیمارستان'] },
  { slug: 'amoozesh', category: 'ejtemaei', keywords: ['آموزش و پرورش', 'مدرسه', 'دانش آموز', 'معلم', 'کنکور', 'کلاس درس', 'سازمان سنجش', 'امتحانات', 'مربی', 'طرح تربیت'] },
  { slug: 'gardeshgari', category: 'ejtemaei', keywords: ['گردشگری', 'مسافر', 'هتل', 'تور', 'سفر', 'موزه', 'بازدید', 'جاذبه', 'صنعت گردشگری', 'مسافرت'] },
  { slug: 'mahiat-zist', category: 'ejtemaei', keywords: ['محیط زیست', 'آلودگی', 'هوا', 'طبیعت', 'تالاب', 'درختکاری', 'پسماند', 'بازیافت', 'گونه', 'حیات وحش', 'ریزگرد'] },
  { slug: 'ghazayi', category: 'ejtemaei', keywords: ['قوه قضائیه', 'دادگاه', 'دادگستری', 'قاضی', 'دیوان', 'پرونده قضایی', 'بازداشت', 'حبس', 'رای', 'مجازات', 'قانون', 'لایحه'] },
  { slug: 'khavarmianeh', category: 'beynolmelal', keywords: ['خاورمیانه', 'غزه', 'فلسطین', 'اسرائیل', 'لبنان', 'سوریه', 'عراق', 'یمن', 'حماس', 'حزب‌الله', 'قدس', 'صهیونیست'] },
  { slug: 'asia', category: 'beynolmelal', keywords: ['چین', 'روسیه', 'هند', 'پاکستان', 'افغانستان', 'تاجیکستان', 'قرقیزستان', 'قزاقستان', 'ترکیه', 'ژاپن', 'کره', 'آسیای مرکزی'] },
  { slug: 'oropa', category: 'beynolmelal', keywords: ['اروپا', 'فرانسه', 'آلمان', 'انگلیس', 'بریتانیا', 'ایتالیا', 'اسپانیا', 'اتحادیه اروپا', 'ناتو', 'اوکراین'] },
  { slug: 'amrika', category: 'beynolmelal', keywords: ['آمریکا', 'امریکا', 'کاخ سفید', 'کنگره', 'ترامپ', 'بایدن', 'پنتاگون', 'آمریکای لاتین', 'کانادا'] },
  { slug: 'beynolmelal-omoomi', category: 'beynolmelal', keywords: ['بین‌الملل', 'سازمان ملل', 'شورای امنیت', 'حقوق بشر', 'جهان', 'دنیا', 'کشورهای جهان', 'دیپلمات'] },
  { slug: 'ai', category: 'fanavari', keywords: ['هوش مصنوعی', 'چت‌جی‌پی‌تی', 'چت بات', 'یادگیری ماشین', 'ربات', 'جی‌پی‌تی', 'اوپن‌ای‌آی', 'مهمات هوشمند', 'الگوریتم'] },
  { slug: 'mobile', category: 'fanavari', keywords: ['موبایل', 'گوشی', 'تبلت', 'آیفون', 'سامسونگ', 'شیائومی', 'اپل', 'اندروید', 'آی او اس'] },
  { slug: 'social', category: 'fanavari', keywords: ['اینستاگرام', 'تلگرام', 'واتساپ', 'فیسبوک', 'توئیتر', 'ایکس', 'شبکه اجتماعی', 'فیلترینگ', 'اینترنت', 'فضای مجازی'] },
  { slug: 'gadget', category: 'fanavari', keywords: ['گجت', 'تکنولوژی', 'فناوری', 'سخت‌افزار', 'کامپیوتر', 'لپ تاپ', 'تبلت', 'امنیت سایبری', 'سایبری', 'هک'] },
  { slug: 'software', category: 'fanavari', keywords: ['نرم‌افزار', 'اپلیکیشن', 'اپ', 'برنامه', 'وب‌سایت', 'سایت', 'پلتفرم', 'استارتاپ', 'خدمات دیجیتال', 'فین‌تک'] },
  { slug: 'footbal-iran', category: 'varzeshi', keywords: ['لیگ برتر', 'پرسپولیس', 'استقلال', 'تراکتور', 'سپاهان', 'فوتبال ایران', 'تیم ملی', 'مربی ایرانی', 'جام حذفی', 'دیدار'] },
  { slug: 'footbal-jahan', category: 'varzeshi', keywords: ['لیگ قهرمانان', 'بارسلونا', 'رئال مادرید', 'منچستریونایتد', 'لیگ برتر انگلیس', 'لژیونر', 'فوتبال جهان', 'جام جهانی'] },
  { slug: 'koshti', category: 'varzeshi', keywords: ['کشتی', 'کشتی آزاد', 'کشتی فرنگی', 'وزنه‌برداری', 'ملی پوش', 'باشگاه کشتی'] },
  { slug: 'varzesh-ha-razmi', category: 'varzeshi', keywords: ['بوکس', 'کاراته', 'تکواندو', 'جودو', 'ووشو', 'رزمی'] },
  { slug: 'natayej-zende', category: 'varzeshi', keywords: ['نتایج زنده', 'برنامه بازی', 'جدول', 'گل', 'پیروزی', 'شکست', 'قهرمان', 'مدال'] },
  { slug: 'sinama', category: 'farhangi', keywords: ['سینما', 'فیلم', 'کارگردان', 'بازیگر', 'جشنواره فیلم', 'اکران', 'سریال', 'تلویزیون', 'پخش', 'نمایش خانگی'] },
  { slug: 'moosighi', category: 'farhangi', keywords: ['موسیقی', 'کنسرت', 'آهنگ', 'خواننده', 'آلبوم', 'ارکستر', 'موسیقی‌دان'] },
  { slug: 'adabiat', category: 'farhangi', keywords: ['کتاب', 'ادبیات', 'نویسنده', 'شاعر', 'رمان', 'انتشارات', 'نمایشگاه کتاب', 'داستان'] },
  { slug: 'honar', category: 'farhangi', keywords: ['نقاشی', 'مجسمه', 'گالری', 'هنر', 'عکاسی', 'طراحی', 'خوشنویسی', 'تجسمی'] },
  { slug: 'teatr', category: 'farhangi', keywords: ['تئاتر', 'نمایش', 'صحنه', 'بازیگری', 'تماشاخانه'] },
  { slug: 'pezeshki', category: 'elmi', keywords: ['پزشکی', 'سلامت', 'درمان', 'بیماری', 'پژوهش پزشکی', 'دانشگاه علوم پزشکی', 'طب', 'تغذیه', 'روانشناسی'] },
  { slug: 'nojoom', category: 'elmi', keywords: ['نجوم', 'فضا', 'سیاره', 'ستاره', 'ماهواره', 'ایستگاه فضایی', 'کیهان', 'رصد', 'تلسکوپ', 'پرواز فضایی'] },
  { slug: 'mahiat', category: 'elmi', keywords: ['محیط زیست', 'اقلیم', 'زیست', 'تنوع زیستی', 'گونه', 'اکوسیستم', 'آب', 'تغییر اقلیم'] },
  { slug: 'ekhtera', category: 'elmi', keywords: ['اختراع', 'نوآوری', 'دانشمند', 'پژوهشگر', 'کشف', 'فناوری نوین', 'اختراع'] },
  { slug: 'daneshgah', category: 'elmi', keywords: ['دانشگاه', 'پژوهش', 'تحقیق', 'استاد', 'دانشجو', 'پایان نامه', 'نشریه علمی', 'همایش', 'مقالات'] },
];

function classify(title, description) {
  const text = `${title} ${description || ''}`;
  let bestSlug = null;
  let bestScore = 0;
  for (const t of TOPICS) {
    let score = 0;
    for (const kw of t.keywords) {
      if (text.includes(kw)) score += 1;
      if (title.includes(kw)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      bestSlug = t.slug;
    }
  }
  return bestSlug;
}

async function main() {
  const news = await p.externalNews.findMany({ where: { status: 'APPROVED' } });
  console.log('تعداد خبرهای تایید شده:', news.length);

  let updated = 0;
  const perTopic = {};
  for (const n of news) {
    const topic = classify(n.title, n.description);
    if (topic !== n.topic) {
      await p.externalNews.update({ where: { id: n.id }, data: { topic } });
      updated++;
    }
    perTopic[topic] = (perTopic[topic] || 0) + 1;
  }

  console.log('به‌روزرسانی:', updated);
  console.log('توزیع زیرموضوع‌ها:');
  Object.entries(perTopic).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(String(k || '(بدون موضوع)').padEnd(24), v));

  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
