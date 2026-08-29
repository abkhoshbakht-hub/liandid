'use client';

type GoFn = (href: string) => void;

const C = { dk: '#0a1628', nv: '#1B365D', nv2: '#1e3a64', gd: '#C9A96E', lt: '#f8f9fb', wh: '#ffffff', gr: '#e5e7eb', tx: '#6b7280' };
const sel: React.CSSProperties = { outline: '3px solid #facc15', outlineOffset: '2px', boxShadow: '0 0 20px rgba(250,204,21,0.35)', borderRadius: '12px' };
const no: React.CSSProperties = {};

function G({ href, go, children, style }: { href: string; go?: GoFn; children: React.ReactNode; style?: React.CSSProperties }) {
  return <div onClick={() => go?.(href)} className={go ? 'cursor-pointer transition-all hover:brightness-110' : ''} style={style}>{children}</div>;
}

function HeaderWireframe({ activeLabel, go }: { activeLabel?: string; go?: GoFn }) {
  const h = (l: string) => activeLabel === l;
  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-2xl" style={{ direction: 'rtl' }}>
      <div className="flex items-center justify-between px-6 py-3" style={{ background: C.nv }}>
        <div className="flex items-center gap-3">
          <G href="/dashboard/header" go={go} style={{ color: 'rgba(255,255,255,0.8)', background: h('پروانه انتشار') ? 'rgba(250,204,21,0.3)' : 'rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 500, ...(h('پروانه انتشار') ? sel : no) }}>پروانه انتشار: ۹۶۲۲</G>
        </div>
        <div className="flex items-center gap-2">
          <G href="/dashboard/header" go={go} style={{ color: h('درباره ما') ? C.gd : 'rgba(255,255,255,0.7)', background: h('درباره ما') ? 'rgba(250,204,21,0.3)' : 'rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', ...(h('درباره ما') ? sel : no) }}>درباره ما</G>
          <G href="/dashboard/header" go={go} style={{ color: h('تماس با ما') ? C.gd : 'rgba(255,255,255,0.7)', background: h('تماس با ما') ? 'rgba(250,204,21,0.3)' : 'rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', ...(h('تماس با ما') ? sel : no) }}>تماس با ما</G>
          <G href="/dashboard/social" go={go} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', background: h('شبکه‌های اجتماعی') ? 'rgba(250,204,21,0.3)' : 'rgba(255,255,255,0.1)', ...(h('شبکه‌های اجتماعی') ? sel : no) }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: h('شبکه‌های اجتماعی') ? '#0088cc' : 'rgba(255,255,255,0.35)' }} />
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: h('شبکه‌های اجتماعی') ? '#e4405f' : 'rgba(255,255,255,0.35)' }} />
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: h('شبکه‌های اجتماعی') ? '#2563eb' : 'rgba(255,255,255,0.35)' }} />
          </G>
        </div>
      </div>
      <div className="flex items-center justify-between px-6 py-5" style={{ background: C.wh }}>
        <G href="/dashboard/header" go={go} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', borderRadius: '12px', background: h('لوگو') ? 'rgba(250,204,21,0.15)' : 'transparent', ...(h('لوگو') ? sel : no) }}>
          <div style={{ width: 40, height: 28, borderRadius: 8, background: C.nv }} />
          <span style={{ fontSize: 18, fontWeight: 900, color: C.nv }}>لیان دید</span>
        </G>
        <div className="flex-1 mx-8 max-w-lg" style={{ ...(h('نوار جستجو') ? sel : no) }}>
          <G href="/dashboard/header" go={go} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', borderRadius: '12px', background: '#f9fafb', border: '2px solid #e5e7eb' }}>
            <div style={{ flex: 1, height: 8, borderRadius: 4, background: '#d1d5db' }} />
            <div style={{ width: 24, height: 24, borderRadius: 8, background: C.nv, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'white' }} />
            </div>
          </G>
        </div>
      </div>
      <div className="flex items-center gap-1 px-4 py-3 overflow-x-auto" style={{ background: `linear-gradient(to left, ${C.nv}, ${C.nv2}, ${C.nv})`, ...(h('نوار منوی ناوبری') ? sel : no) }}>
        <G href="/dashboard/homepage" go={go} style={{ padding: '8px 16px', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', borderRadius: 8, color: h('تب صفحه اصلی') ? C.nv : 'rgba(255,255,255,0.9)', background: h('تب صفحه اصلی') ? C.gd : 'rgba(255,255,255,0.08)' }}>صفحه اصلی</G>
        <G href="/dashboard/articles?cat=siyasi" go={go} style={{ padding: '8px 16px', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', borderRadius: 8, color: h('تب سیاسی') ? C.nv : 'rgba(255,255,255,0.9)', background: h('تب سیاسی') ? C.gd : 'rgba(255,255,255,0.08)' }}>سیاسی</G>
        <G href="/dashboard/articles?cat=eghtesadi" go={go} style={{ padding: '8px 16px', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', borderRadius: 8, color: h('تب اقتصادی') ? C.nv : 'rgba(255,255,255,0.9)', background: h('تب اقتصادی') ? C.gd : 'rgba(255,255,255,0.08)' }}>اقتصادی</G>
        <G href="/dashboard/articles?cat=ejtemaei" go={go} style={{ padding: '8px 16px', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', borderRadius: 8, color: h('تب اجتماعی') ? C.nv : 'rgba(255,255,255,0.9)', background: h('تب اجتماعی') ? C.gd : 'rgba(255,255,255,0.08)' }}>اجتماعی</G>
        <G href="/dashboard/articles?cat=beynolmelal" go={go} style={{ padding: '8px 16px', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', borderRadius: 8, color: h('تب بین‌الملل') ? C.nv : 'rgba(255,255,255,0.9)', background: h('تب بین‌الملل') ? C.gd : 'rgba(255,255,255,0.08)' }}>بین‌الملل</G>
        <G href="/dashboard/articles?cat=fanavari" go={go} style={{ padding: '8px 16px', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', borderRadius: 8, color: h('تب فناوری') ? C.nv : 'rgba(255,255,255,0.9)', background: h('تب فناوری') ? C.gd : 'rgba(255,255,255,0.08)' }}>فناوری</G>
        <G href="/dashboard/articles?cat=varzeshi" go={go} style={{ padding: '8px 16px', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', borderRadius: 8, color: h('تب ورزشی') ? C.nv : 'rgba(255,255,255,0.9)', background: h('تب ورزشی') ? C.gd : 'rgba(255,255,255,0.08)' }}>ورزشی</G>
        <G href="/dashboard/articles?cat=farhangi" go={go} style={{ padding: '8px 16px', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', borderRadius: 8, color: h('تب فرهنگی') ? C.nv : 'rgba(255,255,255,0.9)', background: h('تب فرهنگی') ? C.gd : 'rgba(255,255,255,0.08)' }}>فرهنگی</G>
        <G href="/dashboard/articles?cat=elmi" go={go} style={{ padding: '8px 16px', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', borderRadius: 8, color: h('تب علمی') ? C.nv : 'rgba(255,255,255,0.9)', background: h('تب علمی') ? C.gd : 'rgba(255,255,255,0.08)' }}>علمی</G>
        <G href="/dashboard/gallery" go={go} style={{ padding: '8px 16px', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', borderRadius: 8, color: h('تب گالری') ? C.nv : 'rgba(255,255,255,0.9)', background: h('تب گالری') ? C.gd : 'rgba(255,255,255,0.08)' }}>گالری</G>
        <G href="/dashboard/regions" go={go} style={{ padding: '8px 16px', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', borderRadius: 8, color: h('اخبار شهرها') ? C.nv : 'rgba(255,255,255,0.9)', background: h('اخبار شهرها') ? C.gd : 'rgba(255,255,255,0.08)' }}>اخبار شهرها</G>
      </div>
    </div>
  );
}

function NavMenuWireframe({ activeLabel, go }: { activeLabel?: string; go?: GoFn }) {
  const h = (l: string) => activeLabel === l;
  const cats = [
    { name: 'صفحه اصلی', href: '/dashboard/homepage', subs: [] as string[] },
    { name: 'سیاسی', href: '/dashboard/categories?cat=siyasi', subs: ['رهبری','دولت','مجلس'] },
    { name: 'اقتصادی', href: '/dashboard/categories?cat=eghtesadi', subs: ['اقتصاد ایران','بورس','مسکن'] },
    { name: 'اجتماعی', href: '/dashboard/categories?cat=ejtemaei', subs: ['حوادث','بهداشت','آموزش'] },
    { name: 'بین‌الملل', href: '/dashboard/categories?cat=beynolmelal', subs: ['خاورمیانه','آسیا','اروپا'] },
    { name: 'فناوری', href: '/dashboard/categories?cat=fanavari', subs: ['هوش مصنوعی','موبایل'] },
    { name: 'ورزشی', href: '/dashboard/categories?cat=varzeshi', subs: ['فوتبال','کشتی'] },
    { name: 'فرهنگی', href: '/dashboard/categories?cat=farhangi', subs: ['سینما','موسیقی'] },
    { name: 'علمی', href: '/dashboard/categories?cat=elmi', subs: ['پزشکی','نجوم'] },
    { name: 'گالری', href: '/dashboard/gallery', subs: [] as string[] },
    { name: 'اخبار شهرها', href: '/dashboard/regions', subs: [] as string[] },
  ];
  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-2xl p-4" style={{ background: C.wh, direction: 'rtl' }}>
      {cats.map((cat, i) => (
        <div key={cat.name} className="mb-1">
          <G href={cat.href} go={go} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderRadius: 12, fontSize: 16, fontWeight: 700, background: h(cat.name) ? 'rgba(27,54,93,0.1)' : i === 0 ? C.lt : 'transparent', color: C.nv, borderRight: h(cat.name) ? `4px solid ${C.gd}` : '4px solid transparent', ...(h(cat.name) ? sel : no) }}>
            <span>{cat.name}</span>
            {cat.subs.length > 0 && <span style={{ fontSize: 14, color: C.tx }}>{'\u25BE'}</span>}
          </G>
          {cat.subs.length > 0 && (
            <div className="flex gap-2 flex-wrap px-8 py-2">
              {cat.subs.map(sub => <div key={sub} style={{ padding: '6px 16px', borderRadius: 8, fontSize: 14, background: C.lt, color: C.tx, border: `1px solid ${C.gr}` }}>{sub}</div>)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function HomepageWireframe({ activeLabel, go }: { activeLabel?: string; go?: GoFn }) {
  const h = (l: string) => activeLabel === l;
  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-2xl p-4" style={{ background: C.lt, direction: 'rtl' }}>
      <G href="/dashboard/homepage" go={go} style={h('باکس‌های خبری هیرو') ? sel : no}>
        <div className="grid grid-cols-3 gap-3 p-4 pb-0" style={{ background: C.dk, borderRadius: '16px 16px 0 0' }}>
          <div className="col-span-2 rounded-xl relative" style={{ minHeight: 180, background: '#111c32' }}>
            <div className="absolute top-4 right-4 px-4 py-2 rounded-lg text-sm font-bold" style={{ background: C.gd, color: C.dk }}>ویژه</div>
            <div className="absolute bottom-4 right-4 left-4"><div className="h-4 rounded mb-2" style={{ background: 'rgba(255,255,255,0.9)', width: '80%' }} /><div className="h-2 rounded" style={{ background: 'rgba(255,255,255,0.4)', width: '60%' }} /></div>
          </div>
          <div className="flex flex-col gap-3"><div className="flex-1 rounded-xl" style={{ minHeight: 85, background: '#111c32' }} /><div className="flex-1 rounded-xl" style={{ minHeight: 85, background: '#111c32' }} /></div>
        </div>
      </G>
      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="col-span-2 rounded-xl overflow-hidden" style={h('آخرین اخبار') ? sel : no}>
          <G href="/dashboard/homepage" go={go}><div className="px-5 py-3" style={{ background: C.nv }}><span className="text-sm font-bold text-white">آخرین اخبار</span></div></G>
          <div className="p-3 space-y-3 bg-white">{[1,2,3].map(i => <div key={i} className="flex gap-3 items-center p-3 rounded-xl" style={{ border: `1px solid ${C.gr}` }}><div className="w-16 h-12 rounded-xl flex-shrink-0" style={{ background: C.gr }} /><div className="flex-1"><div className="h-3 rounded mb-2" style={{ background: C.nv, width: `${70+i*5}%` }} /><div className="h-2 rounded" style={{ background: C.gr, width: '40%' }} /></div></div>)}</div>
        </div>
        <div className="rounded-xl overflow-hidden" style={h('اخبار لحظه‌ای خبرگزاری‌ها') ? sel : no}>
          <G href="/dashboard/external-news" go={go}><div className="px-5 py-3" style={{ background: C.nv }}><span className="text-sm font-bold text-white">خبرگزاری</span></div></G>
          <div className="p-3 space-y-3 bg-white">{[1,2,3].map(i => <div key={i} className="flex gap-3 items-center py-2" style={{ borderBottom: `1px solid ${C.gr}` }}><div className="w-8 h-7 rounded-lg flex-shrink-0" style={{ background: C.gr }} /><div className="flex-1"><div className="h-2 rounded" style={{ background: C.tx, width: '80%' }} /></div></div>)}</div>
        </div>
      </div>
    </div>
  );
}

function ArticlesWireframe({ activeLabel, go }: { activeLabel?: string; go?: GoFn }) {
  const h = (l: string) => activeLabel === l;
  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-2xl p-4 space-y-4" style={{ background: C.wh, direction: 'rtl' }}>
      <G href="/dashboard/articles" go={go} style={{ borderRadius: 12, padding: 20, border: `2px solid ${C.gr}`, display: 'block', ...(h('اخبار سایت') ? sel : no) }}>
        <div className="text-base font-bold mb-3" style={{ color: C.nv }}>اخبار سایت</div>
        {[1,2,3].map(i => <div key={i} className="flex gap-3 items-center py-3" style={{ borderBottom: `1px solid ${C.gr}` }}><div className="flex-1 h-3 rounded" style={{ background: C.gr }} /><div className="w-8 h-3 rounded-full" style={{ background: i===1?'#10b981':i===2?'#f59e0b':C.gr }} /></div>)}
      </G>
      <G href="/dashboard/external-news" go={go} style={{ borderRadius: 12, padding: 20, border: `2px solid ${C.gr}`, display: 'block', ...(h('خبرگزاری') ? sel : no) }}>
        <div className="text-base font-bold mb-3" style={{ color: C.nv }}>خبرگزاری</div>
        {['ایسنا','فارس','مهر'].map(a => <div key={a} className="flex items-center gap-3 py-3" style={{ borderBottom: `1px solid ${C.gr}` }}><div className="w-8 h-7 rounded-lg" style={{ background: C.gr }} /><div className="flex-1 h-2.5 rounded" style={{ background: C.gr }} /><div className="w-8 h-3 rounded-full" style={{ background: '#10b981' }} /></div>)}
      </G>
      <G href="/dashboard/submissions" go={go} style={{ borderRadius: 12, padding: 20, border: `2px solid ${C.gr}`, display: 'block', ...(h('ارسالی مخاطبین') ? sel : no) }}>
        <div className="text-base font-bold mb-3" style={{ color: C.nv }}>ارسالی مخاطبین</div>
        {[1,2].map(i => <div key={i} className="flex gap-3 items-center py-3" style={{ borderBottom: `1px solid ${C.gr}` }}><div className="flex-1 h-3 rounded" style={{ background: C.gr }} /><div className="w-8 h-3 rounded-full" style={{ background: '#f59e0b' }} /></div>)}
      </G>
    </div>
  );
}

function CategoriesWireframe({ activeLabel, go }: { activeLabel?: string; go?: GoFn }) {
  const h = (l: string) => activeLabel === l;
  const items = [
    { name: 'دسته‌بندی‌ها', href: '/dashboard/categories' },
    { name: 'شهرها', href: '/dashboard/regions' },
    { name: 'نظرات', href: '/dashboard/comments' },
    { name: 'خبرنامه', href: '/dashboard/subscribers' },
    { name: 'کاربران', href: '/dashboard/users' },
    { name: 'رسانه', href: '/dashboard/media' },
  ];
  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-2xl p-4 space-y-2" style={{ background: C.wh, direction: 'rtl' }}>
      {items.map(item => (
        <G key={item.name} href={item.href} go={go} style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '16px 20px', borderRadius: 12, background: h(item.name) ? `${C.nv}10` : 'transparent', borderRight: h(item.name) ? `4px solid ${C.gd}` : `4px solid ${C.gr}`, ...(h(item.name) ? sel : no) }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: h(item.name) ? C.gd : C.gr }} />
          <div style={{ flex: 1 }}><div style={{ height: 14, borderRadius: 4, marginBottom: 6, background: h(item.name) ? C.nv : C.gr, width: '50%' }} /><div style={{ height: 8, borderRadius: 4, background: C.gr, width: '30%' }} /></div>
        </G>
      ))}
    </div>
  );
}

function FooterWireframe({ activeLabel, go }: { activeLabel?: string; go?: GoFn }) {
  const h = (l: string) => activeLabel === l;
  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-2xl" style={{ direction: 'rtl' }}>
      <div className="grid grid-cols-5 gap-px p-3" style={{ background: '#0f2440' }}>
        <G href="/dashboard/footer" go={go} style={{ borderRadius: 12, padding: 16, textAlign: 'center', background: h('لوگو و توضیحات') ? `${C.gd}30` : 'rgba(255,255,255,0.05)', ...(h('لوگو و توضیحات') ? sel : no) }}><div style={{ width: 80, height: 24, borderRadius: 8, margin: '0 auto 12px', background: 'rgba(255,255,255,0.25)' }} /><div style={{ height: 8, borderRadius: 4, margin: '0 auto', background: 'rgba(255,255,255,0.12)', width: '60%' }} /></G>
        <G href="/dashboard/social" go={go} style={{ borderRadius: 12, padding: 16, textAlign: 'center', background: h('شبکه‌های اجتماعی') ? `${C.gd}30` : 'rgba(255,255,255,0.05)', ...(h('شبکه‌های اجتماعی') ? sel : no) }}><div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: C.gd }}>شبکه‌ها</div><div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}><div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} /><div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} /><div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} /></div></G>
        <G href="/dashboard/footer" go={go} style={{ borderRadius: 12, padding: 16, textAlign: 'center', background: h('لینک‌های مفید') ? `${C.gd}30` : 'rgba(255,255,255,0.05)', ...(h('لینک‌های مفید') ? sel : no) }}><div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: C.gd }}>لینک‌ها</div><div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.15)' }} /><div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.15)' }} /><div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.15)' }} /></div></G>
        <G href="/dashboard/subscribers" go={go} style={{ borderRadius: 12, padding: 16, textAlign: 'center', background: h('خبرنامه') ? `${C.gd}30` : 'rgba(255,255,255,0.05)', ...(h('خبرنامه') ? sel : no) }}><div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: C.gd }}>خبرنامه</div><div style={{ height: 24, borderRadius: 8, background: 'rgba(255,255,255,0.1)' }} /></G>
        <G href="/dashboard/footer" go={go} style={{ borderRadius: 12, padding: 16, textAlign: 'center', background: h('کپی‌رایت') ? `${C.gd}30` : 'rgba(255,255,255,0.05)', ...(h('کپی‌رایت') ? sel : no) }}><div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: C.gd }}>لوگو</div><div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.15)' }} /></G>
      </div>
      <G href="/dashboard/footer" go={go} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', background: '#0a1628', ...(h('کپی‌رایت') ? sel : no) }}><div style={{ height: 8, borderRadius: 4, background: h('کپی‌رایت') ? C.gd : 'rgba(255,255,255,0.2)', width: '30%' }} /><div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.2)', width: '20%' }} /></G>
    </div>
  );
}

function SocialWireframe({ activeLabel, go }: { activeLabel?: string; go?: GoFn }) {
  const h = (l: string) => activeLabel === l;
  const platforms = [{ name: 'تلگرام', color: '#0088cc', href: '/dashboard/social' },{ name: 'اینستاگرام', color: '#e4405f', href: '/dashboard/social' },{ name: 'روبیکا', color: '#ff6600', href: '/dashboard/social' },{ name: 'بله', color: '#2563eb', href: '/dashboard/social' }];
  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-2xl p-4 space-y-2" style={{ background: C.wh, direction: 'rtl' }}>
      {platforms.map(p => (
        <G key={p.name} href={p.href} go={go} style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '16px 20px', borderRadius: 12, background: h(p.name) ? `${p.color}15` : 'transparent', borderRight: h(p.name) ? `4px solid ${p.color}` : `4px solid ${C.gr}`, ...(h(p.name) ? sel : no) }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: h(p.name) ? p.color : `${p.color}30` }} />
          <div style={{ fontSize: 16, fontWeight: 700, color: h(p.name) ? p.color : C.tx }}>{p.name}</div>
        </G>
      ))}
    </div>
  );
}

function RegionsWireframe({ activeLabel, go }: { activeLabel?: string; go?: GoFn }) {
  const h = (l: string) => activeLabel === l;
  const cities = ['بوشهر','بندرریگ','بَردخون','اهرم','تنگستان','دشتی'];
  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-2xl p-4" style={{ background: C.wh, direction: 'rtl' }}>
      <G href="/dashboard/regions" go={go} style={{ borderRadius: 12, padding: 20, border: `2px solid ${C.gr}`, display: 'block', ...(h('شهرها') ? sel : no) }}>
        <div className="grid grid-cols-3 gap-3">{cities.map(city => <div key={city} className="text-center px-4 py-3 rounded-xl text-sm font-medium" style={{ background: C.lt, color: C.tx }}>{city}</div>)}</div>
      </G>
    </div>
  );
}

type WFProps = { activeLabel?: string; go?: GoFn };
const wireframes: Record<string, React.FC<WFProps>> = {
  header: HeaderWireframe, navmenu: NavMenuWireframe, homepage: HomepageWireframe,
  footer: FooterWireframe, categories: CategoriesWireframe, articles: ArticlesWireframe,
  social: SocialWireframe, regions: RegionsWireframe,
};

export default function SitePreview({ type, activeLabel, go }: { type: string; activeLabel?: string; go?: (href: string) => void }) {
  const Component = wireframes[type];
  if (!Component) return null;
  return <Component activeLabel={activeLabel} go={go} />;
}
