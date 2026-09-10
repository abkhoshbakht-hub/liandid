// تاریخ تهران + شمسی برای ماژول روزنامه‌ها
export interface TehranDay {
  gy: number; gm: number; gd: number; // میلادی به وقت تهران
  jy: number; jm: number; jd: number; // شمسی
  key: string; // میلادی YYYY-MM-DD (نیمه‌شب UTC همان روز تهران)
  persian: string; // شمسی YYYY/MM/DD
  utcMidnight: Date;
}

const faDigits = '۰۱۲۳۴۵۶۷۸۹';
export function toFaDigits(s: string | number): string {
  return String(s).replace(/[0-9]/g, (d) => faDigits[Number(d)]);
}

// نام روز هفته شمسی برای یک تاریخ میلادی (به وقت تهران)
export function weekdayFa(d: Date): string {
  try {
    return new Intl.DateTimeFormat('fa-IR', { timeZone: 'Asia/Tehran', weekday: 'long' }).format(d);
  } catch {
    return '';
  }
}

// قالب کامل: «پنجشنبه ۱۹ شهریور ۱۴۰۵» از persianDate به شکل YYYY/MM/DD + تاریخ میلادی
export function fullPersianDate(persianDate: string, gregorian?: Date | string): string {
  const m = persianDate.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/);
  if (!m) return toFaDigits(persianDate);
  const faMonths = ['', 'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
  const body = `${Number(m[3])} ${faMonths[Number(m[2])] || ''} ${m[1]}`;
  const wd = gregorian ? weekdayFa(new Date(gregorian)) : '';
  return toFaDigits(wd ? `${wd} ${body}` : body);
}

function tehranParts(d: Date, cal: 'gregory' | 'persian'): { y: number; m: number; day: number } {
  const fmt = new Intl.DateTimeFormat(`en-u-ca-${cal}-nu-latn`, {
    timeZone: 'Asia/Tehran',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
  const p: Record<string, number> = {};
  for (const x of fmt.formatToParts(d)) {
    if (x.type === 'year' || x.type === 'month' || x.type === 'day') p[x.type] = Number(x.value);
  }
  return { y: p.year, m: p.month, day: p.day };
}

export function tehranToday(now = new Date()): TehranDay {
  const g = tehranParts(now, 'gregory');
  const j = tehranParts(now, 'persian');
  const pad = (n: number) => String(n).padStart(2, '0');
  const key = `${g.y}-${pad(g.m)}-${pad(g.day)}`;
  return {
    gy: g.y, gm: g.m, gd: g.day,
    jy: j.y, jm: j.m, jd: j.day,
    key,
    persian: `${j.y}/${pad(j.m)}/${pad(j.day)}`,
    utcMidnight: new Date(`${key}T00:00:00.000Z`),
  };
}

// رشته‌های محتمل تاریخ امروز در متن فارسی صفحات (برای تشخیص تازگی تصویر)
export function todayNeedles(day: TehranDay): string[] {
  const faMonths = ['', 'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
  const pad = (n: number) => String(n).padStart(2, '0');
  return [
    `${day.jy}/${pad(day.jm)}/${pad(day.jd)}`,
    `${day.jy}-${pad(day.jm)}-${pad(day.jd)}`,
    `${day.jy}/${day.jm}/${day.jd}`,
    `${day.jy}-${day.jm}-${day.jd}`,
    `${day.jd} ${faMonths[day.jm]}`,
    `${day.jd} ${faMonths[day.jm]} ${day.jy}`,
    `${day.gy}-${pad(day.gm)}-${pad(day.gd)}`,
  ];
}
