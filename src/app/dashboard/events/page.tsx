'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const pM = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
const P = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const toP = (n: number) => String(n).split('').map(d => P[parseInt(d)]).join('');

const defaultEvents: Record<string, string[]> = {
  '۱ فروردین': ['عید نوروز / سال نو شمسی'],
  '۲ فروردین': ['عید نوروز'],
  '۳ فروردین': ['عید نوروز'],
  '۴ فروردین': ['عید نوروز'],
  '۱۰ فروردین': ['شهادت آیت\u200cالله مدرس / روز مجلس'],
  '۱۲ فروردین': ['روز جمهوری اسلامی ایران'],
  '۱۳ فروردین': ['سیزده بدر / روز طبیعت'],
  '۲۰ فروردین': ['روز ملی فناوری هسته\u200cای'],
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
  '۷ تیر': ['شهادت آیت\u200cالله بهشتی و ۷۲ تن'],
  '۱۰ تیر': ['روز صنعت و معدن'],
  '۱۲ تیر': ['روز افشای حقوق بشر آمریکایی'],
  '۱۴ تیر': ['روز قلم'],
  '۲۱ تیر': ['روز عفاف و حجاب'],
  '۲۲ تیر': ['بزرگداشت خوارزمی'],
  '۱۳ مرداد': ['اربعین حسینی'],
  '۲۱ مرداد': ['رحلت پیامبر (ص) / شهادت امام حسن مجتبی (ع)'],
  '۲۳ مرداد': ['شهادت امام رضا (ع)'],
  '۳۰ مرداد': ['شهادت امام حسن عسکری (ع)'],
  '۴ مرداد': ['بزرگداشت شیخ صفی\u200cالدین اردبیلی'],
  '۸ مرداد': ['بزرگداشت شیخ شهاب\u200cالدین سهروردی'],
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
  '۷ مهر': ['روز آتش\u200cنشانی'],
  '۸ مهر': ['بزرگداشت مولوی'],
  '۱۳ مهر': ['روز نیروی انتظامی'],
  '۱۵ مهر': ['روز روستا و عشایر'],
  '۲۰ مهر': ['بزرگداشت حافظ'],
  '۲۶ مهر': ['روز تربیت بدنی'],
  '۸ آبان': ['روز نوجوان'],
  '۱۳ آبان': ['روز دانش\u200cآموز'],
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
  '۳۰ دی': ['آتش\u200cسوزی پلاسکو'],
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

const defaultHolidayDates = [
  '۱ فروردین', '۲ فروردین', '۳ فروردین', '۴ فروردین',
  '۱۲ فروردین', '۱۳ فروردین',
  '۱۴ خرداد', '۱۵ خرداد',
  '۵ خرداد', '۶ خرداد',
  '۳ تیر', '۴ تیر',
  '۹ آذر', '۲ دی', '۴ بهمن', '۱۲ بهمن', '۲۲ بهمن',
];

interface CalendarEvent {
  date: string;
  title: string;
  isHoliday: boolean;
}

export default function EventsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-[#C9A96E] border-t-transparent rounded-full" /></div>}>
      <EventsContent />
    </Suspense>
  );
}

function EventsContent() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [search, setSearch] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newIsHoliday, setNewIsHoliday] = useState(false);
  const [filterMonth, setFilterMonth] = useState('');

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) router.push('/secure-a2x-admin');
  }, [isAuthenticated, isAdmin, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && isAdmin) fetchEvents();
  }, [isAuthenticated, isAdmin]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      const source = data.calendarEvents ? JSON.parse(data.calendarEvents) : defaultEvents;
      const holidays = data.calendarHolidays ? JSON.parse(data.calendarHolidays) : defaultHolidayDates;
      const list: CalendarEvent[] = [];
      for (const [date, titles] of Object.entries(source)) {
        (titles as string[]).forEach(t => {
          list.push({ date, title: t, isHoliday: holidays.includes(date) });
        });
      }
      list.sort((a, b) => {
        const monthDiff = pM.indexOf(a.date.split(' ')[1]) - pM.indexOf(b.date.split(' ')[1]);
        if (monthDiff !== 0) return monthDiff;
        const dayA = parseInt(a.date.split(' ')[0]);
        const dayB = parseInt(b.date.split(' ')[0]);
        return dayA - dayB;
      });
      setEvents(list);
    } catch (e) {
      const list: CalendarEvent[] = [];
      for (const [date, titles] of Object.entries(defaultEvents)) {
        (titles as string[]).forEach(t => {
          list.push({ date, title: t, isHoliday: defaultHolidayDates.includes(date) });
        });
      }
      setEvents(list);
    }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const eventMap: Record<string, string[]> = {};
      const holidays: string[] = [];
      events.forEach(ev => {
        if (!eventMap[ev.date]) eventMap[ev.date] = [];
        eventMap[ev.date].push(ev.title);
        if (ev.isHoliday && !holidays.includes(ev.date)) holidays.push(ev.date);
      });
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calendarEvents: JSON.stringify(eventMap),
          calendarHolidays: JSON.stringify(holidays),
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const addEvent = () => {
    if (!newDate || !newTitle) return;
    setEvents([...events, { date: newDate, title: newTitle, isHoliday: newIsHoliday }]);
    setNewDate('');
    setNewTitle('');
    setNewIsHoliday(false);
  };

  const removeEvent = (idx: number) => {
    setEvents(events.filter((_, i) => i !== idx));
  };

  const editEvent = (idx: number, field: keyof CalendarEvent, value: string | boolean) => {
    const updated = [...events];
    updated[idx] = { ...updated[idx], [field]: value };
    setEvents(updated);
  };

  const filtered = events.filter(ev => {
    const matchSearch = !search || ev.title.includes(search) || ev.date.includes(search);
    const matchMonth = !filterMonth || ev.date.includes(filterMonth);
    return matchSearch && matchMonth;
  });

  if (isLoading || !isAuthenticated || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-[#C9A96E] border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="max-w-4xl" dir="rtl">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-[#0a1628]">مدیریت مناسبت‌های تقویمی</h1>
        <p className="text-sm text-gray-400 mt-1">مناسبت‌های ملی و مذهبی تقویم شمسی را مدیریت کنید</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
        <h2 className="text-sm font-black text-[#1B365D] mb-4">افزودن مناسبت جدید</h2>
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-xs text-gray-400 mb-1">تاریخ (مثلاً: ۲۲ بهمن)</label>
            <select value={newDate} onChange={e => setNewDate(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A96E]">
              <option value="">انتخاب روز و ماه</option>
              {pM.map(month => (
                <optgroup key={month} label={month}>
                  {Array.from({ length: month === 'اسفند' ? 29 : (pM.indexOf(month) < 6 ? 31 : 30) }).map((_, i) => (
                    <option key={i} value={`${toP(i + 1)} ${month}`}>{toP(i + 1)} {month}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-400 mb-1">عنوان مناسبت</label>
            <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A96E]" placeholder="مثلاً: پیروزی انقلاب اسلامی" />
          </div>
          <label className="flex items-center gap-2 px-4 py-2.5 cursor-pointer">
            <input type="checkbox" checked={newIsHoliday} onChange={e => setNewIsHoliday(e.target.checked)} className="w-4 h-4 text-[#C9A96E] rounded" />
            <span className="text-sm">تعطیل رسمی</span>
          </label>
          <button onClick={addEvent} disabled={!newDate || !newTitle} className="px-6 py-2.5 bg-[#1B365D] text-white text-sm font-bold rounded-xl hover:bg-[#2a4a7a] transition-colors disabled:opacity-50">افزودن</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="جستجو..." className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A96E]" />
          <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A96E]">
            <option value="">همه ماه‌ها</option>
            {pM.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <span className="text-xs text-gray-400">{filtered.length} مناسبت</span>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">در حال بارگذاری...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">مناسبتی یافت نشد</div>
        ) : (
          <div className="space-y-2">
            {filtered.map((ev, idx) => {
              const realIdx = events.indexOf(ev);
              return (
                <div key={realIdx} className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${ev.isHoliday ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'}`}>
                  <span className="text-xs text-gray-400 w-24 shrink-0 font-mono" dir="ltr">{ev.date}</span>
                  <input type="text" value={ev.title} onChange={e => editEvent(realIdx, 'title', e.target.value)} className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C9A96E] bg-white" />
                  <label className="flex items-center gap-1 cursor-pointer shrink-0">
                    <input type="checkbox" checked={ev.isHoliday} onChange={e => editEvent(realIdx, 'isHoliday', e.target.checked)} className="w-3.5 h-3.5 text-red-500 rounded" />
                    <span className="text-[10px] text-red-500">تعطیل</span>
                  </label>
                  <button onClick={() => removeEvent(realIdx)} className="text-red-400 hover:text-red-600 text-xs font-bold shrink-0">حذف</button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 rounded-xl bg-[#1B365D] text-white text-sm font-bold hover:bg-[#0f2440] transition-colors disabled:opacity-50">
        {saving ? 'در حال ذخیره...' : saved ? 'ذخیره شد' : 'ذخیره تغییرات'}
      </button>
    </div>
  );
}
