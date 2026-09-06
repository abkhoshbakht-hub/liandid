// تشخیص اخبار استان بوشهر — تنها مرجع مشترک سایت و داشبورد
// باکس «آخرین اخبار» فقط اخبار بوشهر را نمایش می‌دهد.

export const BUSHEHR_SOURCES = [
  'بوشهر خبر',
  'بوشهر نیوز',
  'پی جی نیوز',
  'کارانه بوشهر',
  'ندای استان',
  'سوک نیوز',
];

export const BUSHEHR_KEYWORDS =
  /بوشهر(ی|ستان)?|عسلویه|کنگان(ی)?|گناوه(ای)?|(?<![مد])دیر(?!کل|یت|عامل|ان|انه)|تنگستان(ی)?|دیلم(ی)?|خارگ(ی)?|برازجان(ی)?|دشتی|دشتستان(ی)?|جم‌پیلن|کیمیای پارس|پارس جنوبی|نخل تقی|سیراف(ی)?|اهرم(ی)?|چاه‌مبارک|پارسیان(ی)?/i;

interface BushehrCheck {
  category?: string | null;
  sourceName?: string | null;
  title?: string | null;
  description?: string | null;
}

export function isBushehrNews(n: BushehrCheck): boolean {
  if (!n) return false;
  if (n.category === 'بوشهر') return true;
  if (n.sourceName && (n.sourceName.includes('بوشهر') || (BUSHEHR_SOURCES as string[]).includes(n.sourceName))) return true;
  if (n.title && BUSHEHR_KEYWORDS.test(n.title)) return true;
  if (n.description && BUSHEHR_KEYWORDS.test(n.description)) return true;
  return false;
}
