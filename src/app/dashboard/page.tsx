'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

const toFa = (n: number) => n.toString().replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[+d]);

const SvgIcons = {
  news: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>,
  pending: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  submit: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  subscriber: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  write: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  rss: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 110-2 1 1 0 010 2z" /></svg>,
  analysis: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  right: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>,
  plus: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
  calendar: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  site: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>,
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ articles: 0, pending: 0, submissions: 0, subscribers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const r = await Promise.allSettled([
        fetch('/api/admin/articles?limit=1').then(r => r.json()),
        fetch('/api/admin/articles?status=PENDING&limit=1').then(r => r.json()),
        fetch('/api/admin/submissions?status=PENDING').then(r => r.json()),
        fetch('/api/admin/subscribers').then(r => r.json()),
      ]);
      const g = (i: number) => r[i].status === 'fulfilled' ? (r[i] as any).value : null;
      setStats({
        articles: g(0)?.pagination?.total || 0,
        pending: g(1)?.pagination?.total || 0,
        submissions: g(2)?.items?.length || 0,
        subscribers: g(3)?.count || 0,
      });
    } catch {} finally { setLoading(false); }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-gray-300 border-t-[#1B365D] rounded-full animate-spin" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="bg-gradient-to-l from-[#1B365D] to-[#2E5090] rounded-3xl p-10 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-white rounded-full" />
          <div className="absolute -bottom-32 -right-10 w-80 h-80 bg-[#C9A96E] rounded-full" />
        </div>
        <div className="relative text-center">
          <p className="text-white/50 text-sm mb-1">سلام {user?.name}</p>
          <h1 className="text-3xl font-black">داشبورد مدیریت</h1>
          <p className="text-white/40 text-xs mt-2">{new Date().toLocaleDateString('fa-IR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <Link href="/dashboard/articles" className="inline-flex items-center gap-2 bg-[#C9A96E] text-[#1B365D] px-8 py-3 rounded-2xl font-bold hover:bg-[#d4b87a] transition-all shadow-lg shadow-amber-900/20 mt-6">
            {SvgIcons.plus}
            خبر جدید
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'اخبار منتشر شده', value: stats.articles, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-700', icon: SvgIcons.news },
          { label: 'در انتظار تایید', value: stats.pending, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50 border-amber-100', text: 'text-amber-700', icon: SvgIcons.pending },
          { label: 'ارسالی مخاطبین', value: stats.submissions, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50 border-blue-100', text: 'text-blue-700', icon: SvgIcons.submit },
          { label: 'اعضای خبرنامه', value: stats.subscribers, color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50 border-purple-100', text: 'text-purple-700', icon: SvgIcons.subscriber },
        ].map(card => (
          <div key={card.label} className={`rounded-2xl p-5 border text-center ${card.bg} hover:shadow-md transition-all`}>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mx-auto mb-3 text-white shadow-lg`}>
              {card.icon}
            </div>
            <p className={`text-3xl font-extrabold ${card.text}`}>{toFa(card.value)}</p>
            <p className="text-xs font-bold mt-1 opacity-60 text-gray-600">{card.label}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-sm font-bold text-gray-500 mb-4">سریع شروع کن</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            { href: '/dashboard/articles', label: 'خبر جدید', desc: 'نوشتن و انتشار', icon: SvgIcons.write, color: 'group-hover:border-[#1B365D]' },
            { href: '/dashboard/external-news', label: 'خبرگزاری', desc: 'تایید اخبار RSS', icon: SvgIcons.rss, color: 'group-hover:border-emerald-500' },
            { href: '/dashboard/submissions', label: 'ارسالی\u200cها', desc: 'بررسی مخاطبین', icon: SvgIcons.submit, color: 'group-hover:border-blue-500' },
            { href: '/dashboard/subscribers', label: 'خبرنامه', desc: 'مدیریت اعضا', icon: SvgIcons.subscriber, color: 'group-hover:border-purple-500' },
            { href: '/dashboard/homepage?section=analysis', label: 'تحلیل خبر', desc: 'مدیریت تحلیل‌ها', icon: SvgIcons.analysis, color: 'group-hover:border-[#C9A96E]' },
            { href: '/dashboard/events', label: 'تقویم', desc: 'مناسبت‌ها', icon: SvgIcons.calendar, color: 'group-hover:border-amber-500' },
            { href: '/dashboard/categories', label: 'دسته‌بندی', desc: 'مدیریت دسته‌ها', icon: SvgIcons.site, color: 'group-hover:border-pink-500' },
            { href: '/', label: 'مشاهده سایت', desc: 'پیش‌نمایش زنده', icon: SvgIcons.site, color: 'group-hover:border-gray-500', external: true },
          ].map(item => (
            <Link
              key={item.href + item.label}
              href={item.href}
              {...(item.external ? { target: '_blank' } : {})}
              className={`bg-white border border-gray-200 rounded-2xl p-5 ${item.color} hover:shadow-lg transition-all group text-center`}
            >
              <div className="w-10 h-10 rounded-xl bg-gray-50 group-hover:bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400 group-hover:text-[#1B365D] transition-colors">
                {item.icon}
              </div>
              <p className="font-bold text-gray-800 text-sm">{item.label}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
