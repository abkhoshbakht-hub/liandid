const fs = require('fs');
const path = require('path');

const content = `'use client';

import { useState, useEffect, useRef } from 'react';

const allEvents: Record<string, string[]> = {
  '۱ فروردین': ['عید نوروز / سال نو شمسی'],
  '۲ فروردین': ['عید نوروز'],
  '۳ فروردین': ['عید نوروز'],
  '۴ فروردین': ['عید نوروز'],
  '۱۰ فروردین': ['شهادت آیت‌الله مدرس / روز مجلس'],
  '۱۲ فروردین': ['روز جمهوری اسلامی ایران'],
  '۱۳ فروردین': ['سیزده بدر / روز طبیعت'],
  '۲۰ فروردین': ['روز ملی فناوری هسته‌ای'],
  '۲۱ فروردین': ['شهادت شهید صیاد شیرازی'],
  '۲۵ فروردین': ['شهادت امام جعفر صادق (ع)'],
  '۲۹ فروردین': ['روز ارتش / نیروی زمینی'],
  '۳۰ فروردین': ['ولادت حضرت معصومه (س) / روز دختر'],
  '۱ اردیبهشت': ['بزرگداشت سعدی / روز شهدای ورزشکار'],
  '۲ اردیبهشت': ['تأسیس سپاه پاسداران / روز زمین پاک'],
  '۳ اردیبهشت': ['شهادت امیر سپهبد قرنی / روز معماری'],
  '۵ اردیبهشت': ['سالروز شکست حمله آمریکا در طبس'],
  '۹ اردیبهشت': ['ولادت امام رضا (ع)'],
  '۱۰ اردیبهشت': ['روز ملی خلیج فارس'],
  '۱۱ اردیبهشت': ['روز کار و کارگر'],
  '۱۲ اردیبهشت': ['شهادت شهید مطهری / روز معلم'],
  '۲۵ اردیبهشت': ['بزرگداشت فردوسی / روز پاسداشت زبان فارسی'],
  '۲۷ اردیبهشت': ['شهادت امام محمدتقی (ع)'],
  '۲۸ اردیبهشت': ['ازدواج حضرت علی (ع) و فاطمه (س) / روز ازدواج'],
  '۳ خرداد': ['فتح خرمشهر / روز مقاومت و ایثار'],
  '۴ خرداد': ['روز مقاومت و پایداری / روز دزفول'],
  '۵ خرداد': ['روز عرفه'],
  '۶ خرداد': ['عید قربان'],
  '۱۴ خرداد': ['رحلت امام خمینی (ره)'],
  '۱۵ خرداد': ['قیام خونین ۱۵ خرداد'],
  '۱۶ خرداد': ['ولادت امام موسی کاظم (ع)'],
  '۲۶ خرداد': ['آغاز سال ۱۴۴۷ هجری قمری'],
  '۳۱ خرداد': ['شهادت شهید چمران / روز خانواده'],
  '۳ تیر': ['تاسوعای حسینی'],
  '۴ تیر': ['عاشورای حسینی'],
  '۷ تیر': ['شهادت آیت‌الله بهشتی و ۷۲ تن'],
  '۱۰ تیر': ['روز صنعت و معدن'],
  '۱۲ تیر': ['روز افشای حقوق بشر آمریکایی'],
  '۱۴ تیر': ['روز قلم'],
  '۲۱ تیر': ['روز عفاف و حجاب'],
  '۲۲ تیر': ['بزرگداشت خوارزمی'],
  '۱۳ مرداد': ['اربعین حسینی'],
  '۲۱ مرداد': ['رحلت پیامبر (ص) / شهادت امام حسن مجتبی (ع)'],
  '۲۳ مرداد': ['شهادت امام رضا (ع)'],
  '۳۰ مرداد': ['شهادت امام حسن عسکری (ع)'],
  '۴ مرداد': ['بزرگداشت شیخ صفی‌الدین اردبیلی'],
  '۸ مرداد': ['بزرگداشت شیخ شهاب‌الدین سهروردی'],
  '۱۰ مرداد': ['بزرگداشت سلمان فارسی'],
  '۱۴ مرداد': ['صدور فرمان مشروطیت'],
  '۱۵ مرداد': ['شهادت شهید بابایی'],
  '۱۷ مرداد': ['شهادت محمود صارمی / روز خبرنگار'],
  '۲۶ مرداد': ['آغاز بازگشت آزادگان'],
  '۲۸ مرداد': ['کودتای ۲۸ مرداد ۱۳۳۲'],
  '۱ شهریور': ['بزرگداشت ابوعلی سینا / روز پزشک'],
  '۲ شهریور': ['آغاز هفته دولت'],
  '۴ شهریور': ['روز کارمند'],
  '۸ شهریور': ['ولادت پیامبر (ص)'],
  '۱۲ شهریور': ['شهادت رئیسعلی دلواری'],
  '۱۷ شهریور': ['قیام ۱۷ شهریور'],
  '۲۱ شهریور': ['روز سینما'],
  '۲۷ شهریور': ['بزرگداشت شهریار'],
  '۳۱ شهریور': ['آغاز جنگ تحمیلی'],
  '۷ مهر': ['روز آتش‌نشانی'],
  '۸ مهر': ['بزرگداشت مولوی'],
  '۱۳ مهر': ['روز نیروی انتظامی'],
  '۱۵ مهر': ['روز روستا و عشایر'],
  '۲۰ مهر': ['بزرگداشت حافظ'],
  '۲۶ مهر': ['روز تربیت بدنی'],
  '۸ آبان': ['روز نوجوان'],
  '۱۳ آبان': ['روز دانش‌آموز'],
  '۲۴ آبان': ['روز کتاب'],
  '۵ آذر': ['روز بسیج'],
  '۷ آذر': ['روز نیروی دریایی'],
  '۹ آذر': ['ولادت حضرت فاطمه (س) / روز مادر'],
  '۱۰ آذر': ['روز مجلس'],
  '۱۲ آذر': ['روز قانون'],
  '۱۶ آذر': ['روز دانشجو'],
  '۲۵ آذر': ['روز پژوهش'],
  '۲۷ آذر': ['روز وحدت حوزه و دانشگاه'],
  '۳۰ آذر': ['شب یلدا'],
  '۲ دی': ['ولادت حضرت علی (ع) / روز پدر'],
  '۵ دی': ['سالروز زلزله بم'],
  '۱۳ دی': ['شهادت سردار سلیمانی'],
  '۱۶ دی': ['بعثت پیامبر (ص)'],
  '۱۹ دی': ['قیام مردم قم'],
  '۲۲ دی': ['ولادت امام حسین (ع) / روز پاسدار'],
  '۲۳ دی': ['ولادت حضرت ابالفضل (ع) / روز جانباز'],
  '۲۴ دی': ['ولادت امام سجاد (ع)'],
  '۲۶ دی': ['فرار شاه'],
  '۳۰ دی': ['آتش‌سوزی پلاسکو'],
  '۴ بهمن': ['ولادت حضرت قائم (عج)'],
  '۱۲ بهمن': ['بازگشت امام خمینی (ره)'],
  '۱۴ بهمن': ['روز فناوری فضایی'],
  '۱۹ بهمن': ['روز نیروی هوایی'],
  '۲۲ بهمن': ['پیروزی انقلاب اسلامی'],
  '۲۹ بهمن': ['روز اقتصاد مقاومتی'],
  '۳ اسفند': ['روز اکرام و نیکوکاری'],
  '۵ اسفند': ['روز مهندس'],
  '۹ اسفند': ['شهادت حضرت علی (ع)'],
  '۱۵ اسفند': ['روز درختکاری'],
  '۲۲ اسفند': ['روز بزرگداشت شهدا'],
  '۲۹ اسفند': ['روز ملی شدن صنعت نفت'],
};

const nationalHolidays = new Set([
  '۱ فروردین', '۲ فروردین', '۳ فروردین', '۴ فروردین',
  '۱۲ فروردین', '۱۳ فروردین',
  '۱۴ خرداد', '۱۵ خرداد',
  '۵ خرداد', '۶ خرداد',
  '۳ تیر', '۴ تیر',
  '۹ آذر', '۲ دی', '۴ بهمن', '۱۲ بهمن', '۲۲ بهمن',
]);

const pM = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];

const P = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const toP = (n: number) => String(n).split('').map(d => P[parseInt(d)]).join('');

const Q = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
const toQ = (n: number) => String(n).split('').map(d => Q[parseInt(d)]).join('');

const pW = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];

function parseParts(date: Date, cal: string, locale: string) {
  const f = new Intl.DateTimeFormat(locale + '-u-ca-' + cal, { day: 'numeric', month: 'numeric', year: 'numeric', timeZone: 'Asia/Tehran' });
  const parts = f.formatToParts(date);
  return {
    day: parseInt(parts.find(p => p.type === 'day')!.value),
    month: parseInt(parts.find(p => p.type === 'month')!.value),
    year: parseInt(parts.find(p => p.type === 'year')!.value),
  };
}

function getJalali(date: Date) { return parseParts(date, 'persian', 'en-GB'); }
function getHijri(date: Date) { return parseParts(date, 'islamic', 'en-GB'); }

function formatHijri(date: Date): string {
  const h = getHijri(date);
  const monthNames = ['محرم', 'صفر', 'ربیع‌الاول', 'ربیع‌الثانی', 'جمادی‌الاول', 'جمادی‌الثانی', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذی‌القعده', 'ذی‌الحجه'];
  return monthNames[h.month - 1] + ' ' + toQ(h.year);
}

function formatGregorian(date: Date): string {
  const f = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Tehran' });
  return f.format(date);
}

function jalaliMonthLen(m: number, leap: boolean): number {
  if (m <= 6) return 31;
  if (m <= 11) return 30;
  return leap ? 30 : 29;
}

function isJalaliLeap(jy: number): boolean {
  const cycle = ((jy - 1) % 2820) % 33;
  return [1, 5, 9, 13, 17, 22, 26, 30].includes(cycle);
}

function jalaliToGregorian(jy: number, jm: number, jd: number): Date {
  const ref = new Date(Date.UTC(2026, 2, 21));
  let days = 0;
  for (let y = 1405; y < jy; y++) days += isJalaliLeap(y) ? 366 : 365;
  for (let m = 1; m < jm; m++) days += jalaliMonthLen(m, isJalaliLeap(jy));
  days += jd - 1;
  const result = new Date(ref.getTime() + days * 86400000);
  const resultJ = getJalali(result);
  const diff = (jy - resultJ.year) * 400 + (jm - resultJ.month) * 31 + (jd - resultJ.day);
  if (diff !== 0) {
    const adjusted = new Date(result.getTime() + diff * 86400000);
    return adjusted;
  }
  return result;
}

function makeTehranToday(): Date {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Tehran', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now).split('/');
  return new Date(Date.UTC(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]), 12, 0, 0));
}

function JalaliCalendar({ today, selected, onSelect, onClose }: {
  today: Date; selected: Date;
  onSelect: (d: Date) => void; onClose: () => void;
}) {
  const selJ = getJalali(selected);
  const todayJ = getJalali(today);
  const [viewY, setViewY] = useState(selJ.year);
  const [viewM, setViewM] = useState(selJ.month);

  const daysInMonth = jalaliMonthLen(viewM, isJalaliLeap(viewY));
  const firstDate = jalaliToGregorian(viewY, viewM, 1);
  const firstDow = new Date(firstDate).getUTCDay();
  const startOffset = firstDow === 6 ? 0 : firstDow + 1;

  return (
    <div className="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 z-50 w-80" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => { if (viewM === 1) { setViewM(12); setViewY(viewY - 1); } else setViewM(viewM - 1); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
          <svg className="w-4 h-4 text-gray-600 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
        <div className="font-black text-[#1B365D] text-lg">{pM[viewM - 1]} {toP(viewY)}</div>
        <button onClick={() => { if (viewM === 12) { setViewM(1); setViewY(viewY + 1); } else setViewM(viewM + 1); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'].map((d, i) => (
          <div key={d} className={\`text-center text-[10px] font-bold py-1 \${i === 6 ? 'text-red-400' : 'text-gray-400'}\`}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startOffset }).map((_, i) => <div key={\`e\${i}\`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const isToday = viewY === todayJ.year && viewM === todayJ.month && day === todayJ.day;
          const isSelected = viewY === selJ.year && viewM === selJ.month && day === selJ.day;
          const gDate = jalaliToGregorian(viewY, viewM, day);
          const wd = new Date(gDate).getUTCDay();
          const isFriday = wd === 5;
          const dayKey = \`\${toP(day)} \${pM[viewM - 1]}\`;
          const isHoliday = nationalHolidays.has(dayKey);

          let cls = 'text-gray-700 hover:bg-[#1B365D] hover:text-white';
          if (isToday) cls = 'bg-[#C9A96E] text-white shadow-md';
          else if (isSelected) cls = 'bg-[#1B365D] text-white';
          else if (isFriday || isHoliday) cls = 'text-red-500 font-bold';

          return (
            <button key={day} onClick={() => { onSelect(gDate); onClose(); }}
              className={\`w-full py-2 text-sm rounded-lg font-bold transition-all \${cls}\`}>
              {toP(day)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function MarketTicker() {
  const [mounted, setMounted] = useState(false);
  const [selDate, setSelDate] = useState<Date | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const calRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelDate(makeTehranToday());
    setMounted(true);
  }, []);

  useEffect(() => {
    const close = (e: MouseEvent) => { if (calRef.current && !calRef.current.contains(e.target as Node)) setShowCalendar(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  if (!mounted || !selDate) {
    return (
      <div className="bg-gradient-to-l from-[#0a1628] via-[#0f1d35] to-[#0a1628] text-white py-2.5 border-b border-white/5">
        <div className="max-w-[1400px] mx-auto px-4"><div className="h-8 animate-pulse bg-white/5 rounded" /></div>
      </div>
    );
  }

  const today = makeTehranToday();
  const j = getJalali(selDate);
  const dayKey = \`\${toP(j.day)} \${pM[j.month - 1]}\`;
  const events = allEvents[dayKey] || [];
  const isToday = selDate.getTime() === today.getTime();
  const weekday = pW[new Date(selDate).getUTCDay() === 6 ? 0 : new Date(selDate).getUTCDay() + 1];

  const goDay = (delta: number) => {
    const g = new Date(selDate.getTime() + delta * 86400000);
    setSelDate(g);
  };

  return (
    <div className="bg-gradient-to-l from-[#0a1628] via-[#0f1d35] to-[#0a1628] text-white py-2.5 border-b border-white/5 relative">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => goDay(1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-amber-400/20 hover:text-amber-400 transition-all border border-white/5 hover:border-amber-400/30">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
            <button onClick={() => goDay(-1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-amber-400/20 hover:text-amber-400 transition-all border border-white/5 hover:border-amber-400/30">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
          </div>

          <div className="w-px h-8 bg-white/10 shrink-0" />

          <div className="relative shrink-0" ref={calRef}>
            <button onClick={() => setShowCalendar(!showCalendar)} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-400/20 cursor-pointer">
                <svg className="w-4 h-4 text-[#0a1628]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <div className="text-right">
                <div className="text-sm font-black text-white leading-tight">{pM[j.month - 1]} {toP(j.year)}</div>
                <div className="text-[10px] text-amber-400/80 font-bold">{weekday}</div>
              </div>
            </button>
            {showCalendar && (
              <JalaliCalendar today={today} selected={selDate} onSelect={(d) => setSelDate(d)} onClose={() => setShowCalendar(false)} />
            )}
          </div>

          <div className="w-px h-8 bg-white/10 shrink-0" />

          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span className="text-xs font-bold text-white">ق</span>
            </div>
            <div className="text-xs font-bold text-emerald-300">{formatHijri(selDate)}</div>
          </div>

          <div className="hidden sm:block w-px h-8 bg-white/10 shrink-0" />

          <div className="hidden md:flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-xs font-bold text-white">M</span>
            </div>
            <div className="text-xs font-bold text-blue-300">{formatGregorian(selDate)}</div>
          </div>

          <div className="hidden md:block w-px h-8 bg-white/10 shrink-0" />

          <div className="flex-1 min-w-0">
            {events.length > 0 ? (
              <div className="flex items-center gap-2">
                <span className="shrink-0 text-[10px] font-black px-2 py-0.5 bg-amber-400 text-[#0a1628] rounded">مناسبت</span>
                <div className="overflow-hidden">
                  <div className="whitespace-nowrap animate-marquee">
                    {[...events, ...events, ...events].map((e, i) => (
                      <span key={i} className="inline-flex items-center mx-4 text-sm text-gray-300">
                        {e}
                        <span className="mx-8 text-amber-400/30 text-xs">✦</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-gray-500 italic">مناسبت خاصی ثبت نشده</div>
            )}
          </div>

          {!isToday && (
            <button onClick={() => setSelDate(today)} className="shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 bg-amber-400/10 text-amber-400 rounded-lg hover:bg-amber-400/20 transition-all font-bold border border-amber-400/20">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              امروز
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync(path.join(__dirname, '..', 'src', 'components', 'news', 'MarketTicker.tsx'), content);
console.log('Written successfully');
