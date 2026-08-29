export function toPersianDate(date: Date | string): string {
  const d = new Date(date);
  const gy = d.getFullYear();
  const gm = d.getMonth() + 1;
  const gd = d.getDate();

  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let gy2: number;
  let days: number;

  if (gm > 2) {
    gy2 = gy + 1;
  } else {
    gy2 = gy;
  }

  days =
    355666 +
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) +
    gd +
    g_d_m[gm - 1];

  let jy: number;
  let jm: number;
  let jd: number;

  jy = -1595 + 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }

  if (days < 186) {
    jm = 1 + Math.floor(days / 31);
    jd = 1 + (days % 31);
  } else {
    jm = 7 + Math.floor((days - 186) / 30);
    jd = 1 + ((days - 186) % 30);
  }

  return `${jy}/${jm.toString().padStart(2, '0')}/${jd.toString().padStart(2, '0')}`;
}

export function toPersianDateTime(date: Date | string): string {
  const d = new Date(date);
  const datePart = toPersianDate(d);
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${datePart} - ${hours}:${minutes}`;
}

export function toPersianNumber(num: number | string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/\d/g, (d) => persianDigits[parseInt(d)]);
}

export function toGregorian(jy: number, jm: number, jd: number): Date {
  const j_ly = jy % 33 === 1 || jy % 33 === 5 || jy % 33 === 9 || jy % 33 === 13 || jy % 33 === 17 || jy % 33 === 22 || jy % 33 === 26 || jy % 33 === 30;
  const j_days_in_month = [0, 31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, j_ly ? 30 : 29];

  let day_no = 0;
  for (let i = 0; i < jm; i++) {
    day_no += j_days_in_month[i];
  }
  day_no += jd - 1;

  const g_d_m = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const gy2 = jy + 621;
  const march = day_no <= 79 ? 1 : 2;

  let gy = gy2 - (march <= 3 ? 1 : 0);
  let gd = day_no + (march <= 3 ? 79 : -79) + 1;
  let gm = march;

  for (let i = 1; i < 13; i++) {
    if (gd <= g_d_m[gm]) break;
    gd -= g_d_m[gm];
    gm++;
    if (gm > 12) {
      gm = 1;
      gy++;
    }
  }

  return new Date(gy, gm - 1, gd);
}

export function parsePersianDateTime(persianDate: string, persianTime: string): Date | null {
  const dateParts = persianDate.split('/');
  if (dateParts.length !== 3) return null;

  const jy = parseInt(dateParts[0]);
  const jm = parseInt(dateParts[1]);
  const jd = parseInt(dateParts[2]);

  if (isNaN(jy) || isNaN(jm) || isNaN(jd)) return null;

  const timeParts = persianTime.split(':');
  const hours = timeParts.length >= 2 ? parseInt(timeParts[0]) : 0;
  const minutes = timeParts.length >= 2 ? parseInt(timeParts[1]) : 0;

  const gregorian = toGregorian(jy, jm, jd);
  gregorian.setHours(hours, minutes, 0, 0);
  return gregorian;
}
