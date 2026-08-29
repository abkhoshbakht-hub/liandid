'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function ContactContent() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      alert('لطفاً فیلدهای الزامی را پر کنید');
      return;
    }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    }, 1500);
  };

  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen">
        <section className="relative bg-gradient-to-br from-[#1B365D] via-[#2a4a7a] to-[#1B365D] text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-72 h-72 bg-[#C9A96E] rounded-full blur-[120px]" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#C9A96E] rounded-full blur-[150px]" />
          </div>
          <div className="site-container py-20 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold mb-6">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                پاسخگوی پیام‌های شما
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-6">
                تماس با <span className="text-[#C9A96E]">لیان دید</span>
              </h1>
              <p className="text-lg text-white/80 leading-8">
                سوالی دارید؟ پیشنهادی دارید؟ ما اینجا هستیم
              </p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent" />
        </section>

        <div className="site-container py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 -mt-8 relative z-20 mb-16">
            {[
              { icon: '📞', title: 'تلفن', info: '۰۹۳۶-۰۲۸-۰۵۶۲', sub: 'شنبه تا پنجشنبه', color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50' },
              { icon: '✉️', title: 'ایمیل', info: 'info@liandid.ir', sub: 'پاسخ ظرف ۲۴ ساعت', color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50' },
              { icon: '📍', title: 'آدرس', info: 'بوشهر، امامزاده مهر ۱۸', sub: 'خبرگزاری لیان دید', color: 'from-emerald-500 to-green-500', bg: 'bg-emerald-50' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-shadow">
                <div className={`w-14 h-14 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center text-2xl mb-4`}>
                  {item.icon}
                </div>
                <h3 className="font-black text-[#1B365D] mb-1">{item.title}</h3>
                <div className="text-lg font-bold text-gray-800" dir="ltr">{item.info}</div>
                <div className="text-sm text-gray-500 mt-1">{item.sub}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-1 h-8 bg-[#C9A96E] rounded-full" />
                  <h2 className="text-xl font-black text-[#1B365D]">ارسال پیام</h2>
                </div>

                {sent ? (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-10 text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                      <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-black text-green-800 mb-2">پیام شما با موفقیت ارسال شد</h3>
                    <p className="text-green-600 mb-6">کارشناسان ما در اسرع وقت با شما تماس خواهند گرفت</p>
                    <button onClick={() => setSent(false)} className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors text-sm">
                      ارسال پیام جدید
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">نام و نام خانوادگی *</label>
                        <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/10 transition-all" placeholder="نام خود را وارد کنید" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">ایمیل *</label>
                        <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/10 transition-all" placeholder="example@email.com" dir="ltr" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">موضوع</label>
                      <input type="text" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/10 transition-all" placeholder="موضوع پیام خود را بنویسید" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">متن پیام *</label>
                      <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={6} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/10 transition-all resize-none" placeholder="پیام خود را اینجا بنویسید..." />
                    </div>
                    <button type="submit" disabled={sending} className="w-full py-4 bg-gradient-to-l from-[#1B365D] to-[#2a4a7a] text-white rounded-xl font-bold hover:from-[#2a4a7a] hover:to-[#1B365D] transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-base shadow-lg shadow-[#1B365D]/20">
                      {sending ? (<><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> در حال ارسال...</>) : (<>ارسال پیام<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg></>)}
                    </button>
                  </form>
                )}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <h3 className="font-black text-[#1B365D] mb-6 flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#C9A96E]/10 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#C9A96E]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  ساعات کاری
                </h3>
                <div className="space-y-3">
                  {[
                    { day: 'شنبه تا چهارشنبه', time: '۸:۰۰ - ۱۷:۰۰' },
                    { day: 'پنجشنبه', time: '۸:۰۰ - ۱۳:۰۰' },
                    { day: 'جمعه', time: 'تعطیل' },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                      <span className="text-sm text-gray-600">{item.day}</span>
                      <span className="text-sm font-bold text-[#1B365D]" dir="ltr">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <h3 className="font-black text-[#1B365D] mb-3">همکاری با ما</h3>
                <p className="text-gray-500 text-sm leading-7 mb-4 text-justify">اگر علاقه‌مند به همکاری با لیان دید هستید، رزومه خود را به ایمیل زیر ارسال کنید.</p>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-sm text-gray-500 mb-1">ایمیل استخدام</div>
                  <div className="font-bold text-[#1B365D]" dir="ltr">jobs@liandid.ir</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
