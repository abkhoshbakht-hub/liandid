'use client';

import { useState, useEffect, useRef } from 'react';

interface Props {
  value: string; // ISO string or empty
  onChange: (isoString: string) => void;
}

function toPersianDateParts(date: Date) {
  const gy = date.getFullYear();
  const gm = date.getMonth() + 1;
  const gd = date.getDate();
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days = 355666 + 365 * gy + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) + gd + g_d_m[gm - 1];
  let jy = -1595 + 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) { jy += Math.floor((days - 1) / 365); days = (days - 1) % 365; }
  let jm: number, jd: number;
  if (days < 186) { jm = 1 + Math.floor(days / 31); jd = 1 + (days % 31); }
  else { jm = 7 + Math.floor((days - 186) / 30); jd = 1 + ((days - 186) % 30); }
  return { jy, jm, jd };
}

// کبیسه شمسی (چرخه ۳۳ ساله، مبدأ ۱۴۰۳ کبیسه)
function isLeapJalali(jy: number): boolean {
  return [1, 5, 9, 13, 17, 22, 26, 30].includes(((jy % 33) + 33) % 33);
}

// شمسی به میلادی از روی نقطه مرجع قطعی: ۱ فروردین ۱۴۰۴ = ۲۱ مارس ۲۰۲۵
function toGregorianDate(jy: number, jm: number, jd: number): Date {
  const dayOfYear = (jm <= 6 ? (jm - 1) * 31 : 186 + (jm - 7) * 30) + jd;
  let days = 0;
  if (jy >= 1404) {
    for (let y = 1404; y < jy; y++) days += isLeapJalali(y) ? 366 : 365;
    days += dayOfYear - 1;
  } else {
    for (let y = jy; y < 1404; y++) days -= isLeapJalali(y) ? 366 : 365;
    days += dayOfYear - 1;
  }
  const d = new Date(Date.UTC(2025, 2, 21) + days * 86400000);
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

const persianMonths = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];

function isLeapYear(jy: number): boolean {
  return isLeapJalali(jy);
}

export default function ShamsiDateTimePicker({ value, onChange }: Props) {
  const now = new Date();
  const parts = value ? toPersianDateParts(new Date(value)) : toPersianDateParts(now);
  const defaultTime = value ? new Date(value) : now;
  const touched = useRef(false);

  const [jy, setJy] = useState(parts.jy);
  const [jm, setJm] = useState(parts.jm);
  const [jd, setJd] = useState(parts.jd);
  const [hours, setHours] = useState(defaultTime.getHours().toString().padStart(2, '0'));
  const [minutes, setMinutes] = useState(defaultTime.getMinutes().toString().padStart(2, '0'));

  // همگام‌سازی با مقدار بیرونی (مثلاً باز کردن خبر دیگر برای ویرایش)
  useEffect(() => {
    if (!value) return;
    const p = toPersianDateParts(new Date(value));
    const t = new Date(value);
    touched.current = false;
    setJy(p.jy);
    setJm(p.jm);
    setJd(p.jd);
    setHours(t.getHours().toString().padStart(2, '0'));
    setMinutes(t.getMinutes().toString().padStart(2, '0'));
  }, [value]);

  // فقط وقتی کاربر واقعاً چیزی را تغییر داد، مقدار بیرونی به‌روز می‌شود
  useEffect(() => {
    if (!touched.current) return;
    if (jy && jm && jd) {
      const g = toGregorianDate(jy, jm, jd);
      g.setHours(parseInt(hours) || 0, parseInt(minutes) || 0, 0, 0);
      onChange(g.toISOString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jy, jm, jd, hours, minutes]);

  const maxDay = jm <= 6 ? 31 : jm <= 11 ? 30 : isLeapYear(jy) ? 30 : 29;
  const currentJy = toPersianDateParts(new Date()).jy;

  const touch = () => { touched.current = true; };

  return (
    <div className="flex flex-wrap gap-2">
      {/* روز */}
      <select value={jd} onChange={e => { touch(); setJd(parseInt(e.target.value)); }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A96E] bg-white">
        {Array.from({ length: maxDay }, (_, i) => i + 1).map(d => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      {/* ماه */}
      <select value={jm} onChange={e => { touch(); setJm(parseInt(e.target.value)); if (jd > (parseInt(e.target.value) <= 6 ? 31 : parseInt(e.target.value) <= 11 ? 30 : 29)) setJd(1); }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A96E] bg-white">
        {persianMonths.map((m, i) => (
          <option key={i + 1} value={i + 1}>{m}</option>
        ))}
      </select>

      {/* سال */}
      <input type="number" value={jy} onChange={e => { touch(); setJy(parseInt(e.target.value) || currentJy); }} className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A96E] text-center" />

      <span className="flex items-center text-gray-400 text-sm">ساعت</span>

      {/* ساعت */}
      <select value={hours} onChange={e => { touch(); setHours(e.target.value); }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A96E] bg-white">
        {Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')).map(h => (
          <option key={h} value={h}>{h}</option>
        ))}
      </select>

      <span className="flex items-center text-gray-400 text-sm">:</span>

      {/* دقیقه */}
      <select value={minutes} onChange={e => { touch(); setMinutes(e.target.value); }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A96E] bg-white">
        {Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')).map(m => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
    </div>
  );
}
