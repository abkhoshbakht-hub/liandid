// سید ۱۴ روزنامه — سایت‌ها فقط مواردی که دسترسی (HTTP 200) تأیید شده.
// هیچ URL حدسی برای سورس جلد وجود ندارد؛ سورس خودکار فقط کیهان (تأییدشده) است.
export interface NewspaperSeed {
  name: string;
  slug: string;
  category: 'national' | 'bushehr' | 'sports';
  displayOrder: number;
  website?: string;
}

export const NEWSPAPER_SEEDS: NewspaperSeed[] = [
  // سراسری
  { name: 'ایران', slug: 'iran', category: 'national', displayOrder: 1, website: 'https://irannewspaper.ir' },
  { name: 'همشهری', slug: 'hamshahri', category: 'national', displayOrder: 2, website: 'https://www.hamshahrionline.ir' },
  { name: 'شرق', slug: 'shargh', category: 'national', displayOrder: 3, website: 'https://www.sharghdaily.com' },
  { name: 'اعتماد', slug: 'etemad', category: 'national', displayOrder: 4, website: 'https://etemadnewspaper.ir' },
  { name: 'دنیای اقتصاد', slug: 'donya-e-eqtesad', category: 'national', displayOrder: 5, website: 'https://donya-e-eqtesad.com' },
  { name: 'کیهان', slug: 'kayhan', category: 'national', displayOrder: 6, website: 'https://kayhan.ir' },
  { name: 'جوان', slug: 'javan', category: 'national', displayOrder: 7, website: 'https://www.javanonline.ir' },
  { name: 'وطن امروز', slug: 'vatan-emrooz', category: 'national', displayOrder: 8, website: 'https://www.vatanemrooz.ir' },
  { name: 'فرهیختگان', slug: 'farhikhtegan', category: 'national', displayOrder: 9 },
  { name: 'خراسان', slug: 'khorasan', category: 'national', displayOrder: 10 },
  // بوشهر
  { name: 'بامداد جنوب', slug: 'bamdad-jonoob', category: 'bushehr', displayOrder: 11 },
  { name: 'پیام عسلویه', slug: 'payam-asaluyeh', category: 'bushehr', displayOrder: 12 },
  // ورزشی
  { name: 'ابرار ورزشی', slug: 'abrar-varzeshi', category: 'sports', displayOrder: 13, website: 'https://abrarvarzeshi.ir' },
  { name: 'گل', slug: 'goal', category: 'sports', displayOrder: 14, website: 'https://goaldaily.ir' },
  // افزوده‌شده (پرامپت پیشخوان)
  { name: 'اطلاعات', slug: 'ettelaat', category: 'national', displayOrder: 15, website: 'https://www.ettelaat.com' },
  { name: 'جام جم', slug: 'jamjam', category: 'national', displayOrder: 16, website: 'https://jamejamdaily.ir' },
  { name: 'هم‌میهن', slug: 'hammihan', category: 'national', displayOrder: 17, website: 'https://hammihanonline.ir' },
  { name: 'ایران ورزشی', slug: 'iran-varzeshi', category: 'sports', displayOrder: 18, website: 'https://newspaper.inn.ir' },
];

// کانال‌های تلگرام اعلام‌شده توسط مدیر سایت (نه حدسی)
// patterns: الگوی اختصاصی کپشن جلد (نرمالایزشده تطبیق داده می‌شود)؛ اگر باشد حتماً باید بخورد
export interface TelegramSeed {
  slug: string;
  name: string;
  channel: string;
  patterns?: string[];
}

export const TELEGRAM_SOURCES: TelegramSeed[] = [
  { slug: 'iran', name: 'کانال تلگرام ایران', channel: 'irannewspaper' },
  { slug: 'shargh', name: 'کانال تلگرام شرق', channel: 'roznamehsharghsvb' },
  { slug: 'donya-e-eqtesad', name: 'کانال تلگرام دنیای اقتصاد', channel: 'den_ir' },
  { slug: 'javan', name: 'کانال تلگرام جوان', channel: 'newsjavan' },
  { slug: 'vatan-emrooz', name: 'کانال تلگرام وطن امروز', channel: 'vatanemrooz' },
  { slug: 'farhikhtegan', name: 'کانال تلگرام فرهیختگان', channel: 'farhikhteganonline', patterns: ['صفحه اول روزنامه فرهیختگان', 'صفحه نخست', 'جلد روزنامه', '#جلد'] },
  { slug: 'bamdad-jonoob', name: 'کانال تلگرام بامداد جنوب', channel: 'bamdadjonub' },
  { slug: 'payam-asaluyeh', name: 'کانال تلگرام پیام عسلویه', channel: 'payameasalooye', patterns: ['روزنامه پیام عسلویه', 'صفحه اول', 'جلد'] },
  { slug: 'goal', name: 'کانال تلگرام گل', channel: 'TVGoalnewspaper' },
  // تأییدشده توسط مدیر (ممیزی دوم)
  { slug: 'hamshahri', name: 'کانال رسمی همشهری', channel: 'hamshahrinews', patterns: ['صفحه اول روزنامه همشهری', 'صفحه یک روزنامه همشهری', 'جلد روزنامه همشهری'] },
  { slug: 'hammihan', name: 'کانال رسمی هم‌میهن', channel: 'hammihanonline', patterns: ['صفحه اول روزنامه هم‌میهن', 'صفحه نخست', 'جلد روزنامه'] },
  { slug: 'abrar-varzeshi', name: 'کانال رسمی ابرار ورزشی', channel: 'AbrarVarzeshiNews', patterns: ['#جلد_روزنامه', 'جلد روزنامه', 'ابرار ورزشی'] },
  { slug: 'khorasan', name: 'کانال رسمی خراسان', channel: 'khorasanonlinenews', patterns: ['روزنامه خراسان', 'صفحه اول', 'جلد'] },
];

// تنها سورس خودکار تأییدشده: جلد روزانه کیهان از سایت رسمی
export const KAYHAN_SOURCE = {
  slug: 'kayhan',
  name: 'سایت رسمی کیهان',
  type: 'official',
  url: 'https://kayhan.ir/',
  priority: 0,
  configuration: JSON.stringify({
    pageUrl: 'https://kayhan.ir/',
    imgPattern: 'files/fa/publication/pages/[^"\'\\s]+\\.jpe?g',
    keywords: ['کیهان', 'صفحه اول'],
  }),
};

// سورس‌های رسمی تأییدشده با مشاهده مستقیم HTML (ممیزی ۱۴۰۵/۰۶/۱۹) — هیچ URL حدسی نیست
export interface OfficialSeed {
  slug: string;
  name: string;
  type: string;
  url: string;
  priority: number;
  configuration: string;
}

const SHARGH_SOURCE: OfficialSeed = {
  slug: 'shargh',
  name: 'آرشیو رسمی شرق',
  type: 'official',
  url: 'https://www.sharghdaily.com/بخش-پی-دی-اف-روزنامه-245',
  priority: -1,
  configuration: JSON.stringify({
    archiveUrl: 'https://www.sharghdaily.com/بخش-پی-دی-اف-روزنامه-245',
    itemPattern: '245\\/\\d+-',
    ogImage: true,
  }),
};

const IRAN_SOURCE: OfficialSeed = {
  slug: 'iran',
  name: 'آرشیو رسمی ایران',
  type: 'official',
  url: 'https://irannewspaper.ir/archive/main',
  priority: -1,
  configuration: JSON.stringify({
    archiveUrl: 'https://irannewspaper.ir/archive/main',
    itemPattern: '^/\\d+$',
    imgPatternList: ['((?:https?:)?//media\\.irannewspaper\\.ir/[^"\'\\s)]+?-l\\.jpg)', '((?:https?:)?//media\\.irannewspaper\\.ir/[^"\'\\s)]+?\\.(?:jpg|jpeg|png))'],
    imgSwap: ['-[sm](\\.jpg)$', '-l$1'],
  }),
};

const IRANVARZESHI_SOURCE: OfficialSeed = {
  slug: 'iran-varzeshi',
  name: 'آرشیو رسمی ایران ورزشی',
  type: 'official',
  url: 'https://newspaper.inn.ir/archive/main',
  priority: -1,
  configuration: JSON.stringify({
    archiveUrl: 'https://newspaper.inn.ir/archive/main',
    itemPattern: '^/\\d+$',
    imgPatternList: ['((?:https?:)?//cdn-newspaper\\.inn\\.ir/[^"\'\\s)]+?-l\\.jpg)', '((?:https?:)?//cdn-newspaper\\.inn\\.ir/[^"\'\\s)]+?\\.(?:jpg|jpeg|png))'],
    imgSwap: ['-[sm](\\.jpg)$', '-l$1'],
  }),
};

const ETTELAAT_SOURCE: OfficialSeed = {
  slug: 'ettelaat',
  name: 'نسخه روز اطلاعات',
  type: 'official',
  url: 'https://www.ettelaat.com/issue/latest',
  priority: -1,
  configuration: JSON.stringify({
    pageUrl: 'https://www.ettelaat.com/issue/latest',
    imgPattern: '((?:https?:)?//media\\.ettelaat\\.com/[^"\'\\s)]+?\\.jpg)',
    keywords: ['اطلاعات', 'صفحه اول'],
  }),
};

const JAMJAM_SOURCE: OfficialSeed = {
  slug: 'jamjam',
  name: 'آرشیو رسمی جام جم',
  type: 'official',
  url: 'https://jamejamdaily.ir/Newspaper/Archivepage?Type=0',
  priority: -1,
  configuration: JSON.stringify({
    archiveUrl: 'https://jamejamdaily.ir/Newspaper/Archivepage?Type=0',
    itemPattern: 'nid=(\\d+)',
    imgPatternList: ['(/content/newspaper/[^"\'\\s)]+?newspaperimgl_\\d+_1\\.jpg[^"\'\\s)]*)'],
    preferLargestWidth: true,
    preferFirstPage: true,
    requireIssueId: true,
  }),
};

const JAVAN_SOURCE: OfficialSeed = {
  slug: 'javan',
  name: 'آرشیو رسمی جوان',
  type: 'official',
  url: 'https://javanonline.ir/fa/publication',
  priority: -1,
  configuration: JSON.stringify({
    archiveUrl: 'https://javanonline.ir/fa/publication',
    itemPattern: '/fa/publication/(?!issue/)(\\d+)',
    imgPatternList: ['(/files/[^"\'\\s)]*?/pages/[^"\'\\s)]+?\\.jpg)', '(/files/[^"\'\\s)]*?cover_\\d+\\.png)'],
  }),
};

const VATAN_SOURCE: OfficialSeed = {
  slug: 'vatan-emrooz',
  name: 'آرشیو رسمی وطن امروز',
  type: 'official',
  url: 'https://vatanemrooz.ir/fa/publication',
  priority: -1,
  configuration: JSON.stringify({
    archiveUrl: 'https://vatanemrooz.ir/fa/publication',
    itemPattern: '/fa/publication/issue/(\\d+)/',
    idPattern: '/issue/(\\d+)/',
    preferFirstPage: true,
    imgPatternList: ['(/files/[^"\'\\s)]*?/pages/[^"\'\\s)]+?\\.jpg)', '(/files/[^"\'\\s)]*?cover_\\d+\\.jpg)'],
  }),
};

const ETEMAD_SOURCE: OfficialSeed = {
  slug: 'etemad',
  name: 'نسخه روز اعتماد',
  type: 'official',
  url: 'https://etemadnewspaper.ir/',
  priority: -1,
  configuration: JSON.stringify({
    pageUrl: 'https://etemadnewspaper.ir/',
    imgPattern: '(https?://www\\.etemadnewspaper\\.ir/\\d{4}/\\d{2}/\\d{2}/Main/JPG/[^"\'\\s)]+?\\.jpg)',
    datePath: true,
    keywords: ['اعتماد', 'صفحه اول'],
  }),
};

const DONYA_SOURCE: OfficialSeed = {
  slug: 'donya-e-eqtesad',
  name: 'نسخه روز دنیای اقتصاد',
  type: 'official',
  url: 'https://donya-e-eqtesad.com/',
  priority: -1,
  configuration: JSON.stringify({
    pageUrl: 'https://donya-e-eqtesad.com/',
    linkText: 'نسخه کامل شماره امروز',
    imgPattern: '((?:https?:)?//cdn\\.donya-e-eqtesad\\.com/[^"\'\\s)]+?\\.jpg)',
  }),
};

const GOAL_SOURCE: OfficialSeed = {
  slug: 'goal',
  name: 'کیوسک رسمی گل',
  type: 'official',
  url: 'https://goaldaily.ir/',
  priority: -1,
  configuration: JSON.stringify({
    archiveUrl: 'https://goaldaily.ir/',
    itemPattern: 'newspaper/view/(\\d+)/',
    imgPatternList: ['(/cache/[^"\'\\s)]*?main_pic/[^"\'\\s)]+?_p01\\.jpg)'],
  }),
};

const BAMDAD_SOURCE: OfficialSeed = {
  slug: 'bamdad-jonoob',
  name: 'آرشیو رسمی بامداد جنوب',
  type: 'official',
  url: 'https://bamdadjonub.ir/issues',
  priority: -1,
  configuration: JSON.stringify({
    archiveUrl: 'https://bamdadjonub.ir/issues',
    itemPattern: '/issues/(\\d+)/',
    imgPatternList: ['(/[^\\s"\']*?-scaled\\.webp)', '(/[^\\s"\']*?400x571\\.webp)'],
  }),
};

export const OFFICIAL_SOURCES: OfficialSeed[] = [
  { ...KAYHAN_SOURCE },
  SHARGH_SOURCE,
  IRAN_SOURCE,
  IRANVARZESHI_SOURCE,
  ETTELAAT_SOURCE,
  JAMJAM_SOURCE,
  JAVAN_SOURCE,
  VATAN_SOURCE,
  ETEMAD_SOURCE,
  DONYA_SOURCE,
  GOAL_SOURCE,
  BAMDAD_SOURCE,
];

// سورس‌های تکمیلی تأییدشده توسط مدیر (ممیزی دوم): تلاش سایت خراسان، پیشخوان پیام عسلویه، تسنیم
export interface ExtraSeed {
  slug: string;
  name: string;
  type: string;
  url: string;
  priority: number;
  configuration: string;
}

// URL کلید تسنیم برای محافظت از بازفعال‌سازی خودکار (ردیف‌های DB غیرفعال می‌مانند تا تصمیم بعدی)
export const TASNIM_URL = 'https://www.tasnimnews.ir/fa/keyword/2297/';
// NOTE: سورس‌های tasnim فعلاً غیرفعال‌اند (404 از Vercel) — ردیف‌های DB حفظ می‌شوند تا بعداً فعال شوند.
// به همین دلیل ورودی tasnim در EXTRA_SOURCES وجود ندارد و ensure آن‌ها را بازسازی نمی‌کند.

export const EXTRA_SOURCES: ExtraSeed[] = [
  {
    // PRIMARY تأییدشده با مشاهده مستقیم HTML صفحه امروز (شماره 22138 — 1405/6/19)
    slug: 'khorasan',
    name: 'آرشیو رسمی خراسان',
    type: 'official',
    url: 'https://khorasanonline.ir/',
    priority: -1,
    configuration: JSON.stringify({
      archiveUrl: 'https://khorasanonline.ir/',
      itemPattern: 'nid=(\\d+)',
      imgPatternList: ['(/content/newspaper/[^"\'\\s)]+?newspaperimgl_\\d+_1\\.jpg[^"\'\\s)]*)'],
      preferLargestWidth: true,
      preferFirstPage: true,
      requireIssueId: true,
    }),
  },
  {
    slug: 'payam-asaluyeh',
    name: 'پیشخوان پیام عسلویه',
    type: 'other',
    url: 'https://www.pishkhan.com/rooznameh/PayameAsalooye',
    priority: 1,
    configuration: JSON.stringify({ pageUrl: 'https://www.pishkhan.com/rooznameh/PayameAsalooye', keywords: ['پیام عسلویه', 'صفحه اول', 'جلد'] }),
  },
];
