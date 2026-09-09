// سید ۱۴ روزنامه — بدون هیچ URL حدسی (سورس‌ها بعداً از پنل تنظیم می‌شوند)
export interface NewspaperSeed {
  name: string;
  slug: string;
  category: 'national' | 'bushehr' | 'sports';
  displayOrder: number;
}

export const NEWSPAPER_SEEDS: NewspaperSeed[] = [
  // سراسری
  { name: 'ایران', slug: 'iran', category: 'national', displayOrder: 1 },
  { name: 'همشهری', slug: 'hamshahri', category: 'national', displayOrder: 2 },
  { name: 'شرق', slug: 'shargh', category: 'national', displayOrder: 3 },
  { name: 'اعتماد', slug: 'etemad', category: 'national', displayOrder: 4 },
  { name: 'دنیای اقتصاد', slug: 'donya-e-eqtesad', category: 'national', displayOrder: 5 },
  { name: 'کیهان', slug: 'kayhan', category: 'national', displayOrder: 6 },
  { name: 'جوان', slug: 'javan', category: 'national', displayOrder: 7 },
  { name: 'وطن امروز', slug: 'vatan-emrooz', category: 'national', displayOrder: 8 },
  { name: 'فرهیختگان', slug: 'farhikhtegan', category: 'national', displayOrder: 9 },
  { name: 'خراسان', slug: 'khorasan', category: 'national', displayOrder: 10 },
  // بوشهر
  { name: 'بامداد جنوب', slug: 'bamdad-jonoob', category: 'bushehr', displayOrder: 11 },
  { name: 'پیام عسلویه', slug: 'payam-asaluyeh', category: 'bushehr', displayOrder: 12 },
  // ورزشی
  { name: 'ابرار ورزشی', slug: 'abrar-varzeshi', category: 'sports', displayOrder: 13 },
  { name: 'گل', slug: 'goal', category: 'sports', displayOrder: 14 },
];
