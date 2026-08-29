'use client';

import { useState, useEffect } from 'react';

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

function toGregorianDate(jy: number, jm: number, jd: number): Date {
  const j_ly = jy % 33 === 1 || jy % 33 === 5 || jy % 33 === 9 || jy % 33 === 13 || jy % 33 === 17 || jy % 33 === 22 || jy % 33 === 26 || jy % 33 === 30;
  const j_days = [0, 31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, j_ly ? 30 : 29];
  let day_no = 0;
  for (let i = 0; i < jm; i++) day_no += j_days[i];
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
    if (gm > 12) { gm = 1; gy++; }
  }
  return new Date(gy, gm - 1, gd);
}

const persianMonths = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];

export default function ShamsiDateTimePicker({ value, onChange }: Props) {
  const now = new Date();
  const parts = value ? toPersianDateParts(new Date(value)) : toPersianDateParts(now);
  const defaultTime = value ? new Date(value) : now;

  const [jy, setJy] = useState(parts.jy);
  const [jm, setJm] = useState(parts.jm);
  const [jd, setJd] = useState(parts.jd);
  const [hours, setHours] = useState(defaultTime.getHours().toString().padStart(2, '0'));
  const [minutes, setMinutes] = useState(defaultTime.getMinutes().toString().padStart(2, '0'));

  useEffect(() => {
    if (jy && jm && jd) {
      const g = toGregorianDate(jy, jm, jd);
      g.setHours(parseInt(hours) || 0, parseInt(minutes) || 0, 0, 0);
      onChange(g.toISOString());
    }
  }, [jy, jm, jd, hours, minutes]);

  const maxDay = jm <= 6 ? 31 : jm <= 11 ? 30 : (jy % 33 === 1 || jy % 33 === 5 || jy % 33 === 9 || jy % 33 === 13 || jy % 33 === 17 || jy % 33 === 22 || jy % 33 === 26 || jy % 33 === 30) ? 30 : 29;

  return (
    <div className="flex flex-wrap gap-2">
      {/* روز */}
      <select value={jd} onChange={e => setJd(parseInt(e.target.value))} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A96E] bg-white">
        {Array.from({ length: maxDay }, (_, i) => i + 1).map(d => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      {/* ماه */}
      <select value={jm} onChange={e => { setJm(parseInt(e.target.value)); if (jd > (parseInt(e.target.value) <= 6 ? 31 : parseInt(e.target.value) <= 11 ? 30 : 29)) setJd(1); }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A96E] bg-white">
        {persianMonths.map((m, i) => (
          <option key={i + 1} value={i + 1}>{m}</option>
        ))}
      </select>

      {/* سال */}
      <input type="number" value={jy} onChange={e => setJy(parseInt(e.target.value) || 1404)} className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A96E] text-center" />

      <span className="flex items-center text-gray-400 text-sm">ساعت</span>

      {/* ساعت */}
      <select value={hours} onChange={e => setHours(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A96E] bg-white">
        {Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')).map(h => (
          <option key={h} value={h}>{h}</option>
        ))}
      </select>

      <span className="flex items-center text-gray-400 text-sm">:</span>

      {/* دقیقه */}
      <select value={minutes} onChange={e => setMinutes(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A96E] bg-white">
        {Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0')).map(m => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
    </div>
  );
}
