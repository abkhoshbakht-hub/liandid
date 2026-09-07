// نسبت قاب عکس شاخص — تک‌منبع برای کراپ، پیش‌نمایش داشبورد و صفحه خبر سایت
export function aspectToRatio(aspect: string | undefined | null): string | null {
  if (aspect === '1:1') return '1 / 1';
  if (aspect === '4:3') return '4 / 3';
  if (aspect === 'free') return null;
  return '16 / 9';
}
