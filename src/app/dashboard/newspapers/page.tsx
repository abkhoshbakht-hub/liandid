'use client';
import { useEffect, useState } from 'react';

const TABS = [
  { id: 'dash', label: 'داشبورد' },
  { id: 'papers', label: 'روزنامه‌ها' },
  { id: 'issues', label: 'شماره‌ها' },
  { id: 'errors', label: 'خطاها' },
];
const STATUS_FA: Record<string, string> = { PUBLISHED: 'منتشرشده', NEEDS_REVIEW: 'نیاز به بررسی', PENDING: 'در انتظار', PROCESSING: 'در حال پردازش', FAILED: 'ناموفق', REJECTED: 'ردشده' };
const TYPE_FA: Record<string, string> = { official: 'سایت رسمی', telegram: 'تلگرام', news_agency: 'خبرگزاری', other: 'سایر', manual: 'دستی' };

async function api(path: string, opts?: RequestInit) {
  const r = await fetch(path, opts);
  return r.json();
}

export default function NewspapersAdminPage() {
  const [tab, setTab] = useState('dash');
  const [initState, setInitState] = useState<'loading' | 'ready' | 'no'>('loading');

  useEffect(() => {
    api('/api/admin/newspapers/init').then((d) => setInitState(d?.data?.initialized ? 'ready' : 'no')).catch(() => setInitState('no'));
  }, []);

  async function doInit() {
    if (!confirm('جداول ماژول روزنامه‌ها ساخته و ۱۴ روزنامه ثبت شود؟')) return;
    const d = await api('/api/admin/newspapers/init', { method: 'POST' });
    if (d.success) { alert(`انجام شد — ${d.data.papers} روزنامه`); setInitState('ready'); }
    else alert(d.message || 'خطا');
  }

  if (initState === 'loading') return <div className="p-8 text-center text-white">در حال بررسی...</div>;
  if (initState === 'no')
    return (
      <div className="p-8 max-w-lg mx-auto text-center bg-white rounded-xl shadow mt-10">
        <h1 className="text-xl font-bold mb-3">ماژول صفحه اول روزنامه‌ها</h1>
        <p className="text-gray-600 mb-5 text-sm">جداول هنوز ساخته نشده‌اند. با یک کلیک راه‌اندازی کن:</p>
        <button onClick={doInit} className="bg-[#1B365D] text-white px-6 py-2.5 rounded-lg font-bold">راه‌اندازی جداول + ثبت ۱۴ روزنامه</button>
      </div>
    );

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <h1 className="text-xl font-bold text-white mb-4">صفحه اول روزنامه‌ها</h1>
      <div className="flex gap-2 mb-5 flex-wrap">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2 rounded-lg text-sm font-bold ${tab === t.id ? 'bg-[#C9A96E] text-[#0f1d35]' : 'bg-white/10 text-white'}`}>{t.label}</button>
        ))}
      </div>
      {tab === 'dash' && <DashTab />}
      {tab === 'papers' && <PapersTab />}
      {tab === 'issues' && <IssuesTab />}
      {tab === 'errors' && <ErrorsTab />}
    </div>
  );
}

async function runOnePaper(newspaperId: string) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 55000);
  try {
    const r = await fetch('/api/admin/newspapers/fetch', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ newspaperId }), signal: ctrl.signal });
    clearTimeout(timer);
    const text = await r.text();
    try {
      return JSON.parse(text);
    } catch {
      return { success: false, message: `HTTP ${r.status}: ${text.slice(0, 150)}` };
    }
  } catch (e: any) {
    clearTimeout(timer);
    return { success: false, message: e?.name === 'AbortError' ? 'timeout(55s)' : String(e?.message || e).slice(0, 150) };
  }
}

function DashTab() {
  const [s, setS] = useState<any>(null);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const load = () => api('/api/admin/newspapers/stats').then((d) => d.success && setS(d.data));
  useEffect(() => { load(); }, []);
  async function runOne(id: string) {
    setBusyId(id);
    await runOnePaper(id);
    setBusyId(null);
    load();
  }
  async function publishOne(issueId: string) {
    setBusyId(issueId);
    await api(`/api/admin/newspapers/issues/${issueId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'publish' }) });
    setBusyId(null);
    load();
  }
  async function seedSources() {
    if (!confirm('سورس‌های خودکار (کیهان + ۹ کانال تلگرام) برای روزنامه‌های بدون سورس ساخته شود؟')) return;
    const d = await api('/api/admin/newspapers/init', { method: 'POST' });
    alert(d.success ? 'انجام شد' : (d.message || 'خطا'));
    load();
  }
  async function runAll() {
    if (!s?.papers?.length) return;
    if (!confirm('دریافت امروز برای همه روزنامه‌ها تک‌تک اجرا شود؟ (چند دقیقه، صفحه را نبند)')) return;
    setRunning(true);
    let ok = 0;
    const fails: string[] = [];
    for (let i = 0; i < s.papers.length; i++) {
      const p = s.papers[i];
      if (p.todayStatus === 'PUBLISHED') { ok++; continue; }
      setProgress(`${p.name} (${i + 1} از ${s.papers.length})`);
      const d = await runOnePaper(p.id);
      if (d.success && d.data?.ok) ok++;
      else fails.push(`${p.name}: ${d.data?.error || d.message || 'نامشخص'}`);
      load();
    }
    setRunning(false);
    setProgress('');
    alert(`تمام شد — موفق: ${ok}، ناموفق: ${fails.length}` + (fails.length ? `\n${fails.slice(0, 6).join('\n')}` : ''));
    load();
  }
  if (!s) return <div className="text-white">در حال بارگذاری...</div>;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[['امروز', s.date], ['کل روزنامه‌ها', s.total], ['موفق', s.ok], ['نیاز به بررسی', s.review], ['بدون جلد', s.failed]].map(([l, v]) => (
          <div key={l as string} className="bg-white rounded-xl p-4 text-center shadow"><div className="text-2xl font-black text-[#1B365D]">{v as any}</div><div className="text-xs text-gray-500 mt-1">{l}</div></div>
        ))}
      </div>
      <div className="bg-white rounded-xl p-4 shadow flex flex-wrap items-center gap-3">
        <button onClick={runAll} disabled={running} className="bg-[#1B365D] text-white px-5 py-2 rounded-lg font-bold text-sm disabled:opacity-50">{running ? `در حال دریافت... ${progress}` : 'اجرای دریافت امروز'}</button>
        <button onClick={seedSources} disabled={running} className="border border-[#1B365D] text-[#1B365D] px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50">تکمیل سورس‌های خودکار</button>
        <span className="text-xs text-gray-500">آخرین کرون: {s.lastCron ? new Date(s.lastCron).toLocaleString('fa-IR') : '—'} — آرشیو: {s.archiveTotal} شماره</span>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-4 shadow">
          <h3 className="font-bold mb-2 text-sm">وضعیت امروز روزنامه‌ها</h3>
          <div className="space-y-1 max-h-72 overflow-auto text-sm">
            {s.papers.map((p: any) => (
              <div key={p.id} className="flex justify-between items-center border-b py-1.5">
                <span>{p.name}</span>
                <span className="flex items-center gap-2">
                  <span className={p.todayStatus === 'PUBLISHED' ? 'text-green-600' : p.todayStatus === 'NEEDS_REVIEW' ? 'text-amber-600' : 'text-red-500'}>{p.todayStatus ? STATUS_FA[p.todayStatus] : '— بدون جلد'}</span>
                  {p.todayStatus === 'NEEDS_REVIEW' && p.todayIssueId && (
                    <button onClick={() => publishOne(p.todayIssueId)} disabled={busyId === p.todayIssueId || running} className="text-xs bg-green-600 text-white px-2 py-0.5 rounded font-bold disabled:opacity-50">{busyId === p.todayIssueId ? '...' : 'انتشار'}</button>
                  )}
                  {p.todayStatus !== 'PUBLISHED' && p.todayStatus !== 'NEEDS_REVIEW' && (
                    <button onClick={() => runOne(p.id)} disabled={busyId === p.id || running} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded disabled:opacity-50">{busyId === p.id ? '...' : 'دریافت'}</button>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow">
          <h3 className="font-bold mb-2 text-sm">خطاهای اخیر</h3>
          <div className="space-y-1 max-h-72 overflow-auto text-sm">
            {s.recentFails.length === 0 && <div className="text-gray-400">خطایی نیست</div>}
            {s.recentFails.map((f: any) => (
              <div key={f.id} className="border-b py-1.5"><b>{f.paperName}</b><div className="text-xs text-red-600 truncate">{f.error}</div></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PapersTab() {
  const [papers, setPapers] = useState<any[]>([]);
  const [sel, setSel] = useState<any>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', slug: '', category: 'national', website: '', telegram: '' });
  const [sform, setSform] = useState({ name: '', type: 'official', url: '', priority: '', configuration: '' });
  const [testing, setTesting] = useState<string | null>(null);
  const [testRes, setTestRes] = useState<any>(null);
  const [editSrc, setEditSrc] = useState<any>(null);

  const load = () => api('/api/admin/newspapers').then((d) => d.success && Array.isArray(d.data) && setPapers(d.data));
  const loadSources = (id: string) => api(`/api/admin/newspapers/${id}/sources`).then((d) => d.success && setSources(d.data));
  useEffect(() => { load(); }, []);
  useEffect(() => { if (sel) loadSources(sel.id); setTestRes(null); setEditSrc(null); }, [sel]);

  async function addPaper() {
    const d = await api('/api/admin/newspapers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (d.success) { setForm({ name: '', slug: '', category: 'national', website: '', telegram: '' }); load(); } else alert(d.message);
  }
  async function toggleActive(p: any) {
    await api(`/api/admin/newspapers/${p.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: !p.active }) });
    load();
  }
  async function delPaper(p: any) {
    if (!confirm(`«${p.name}» با همه شماره‌ها و سورس‌ها حذف شود؟`)) return;
    await api(`/api/admin/newspapers/${p.id}`, { method: 'DELETE' });
    setSel(null); load();
  }
  async function addSource() {
    const d = await api(`/api/admin/newspapers/${sel.id}/sources`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...sform, priority: sform.priority === '' ? undefined : Number(sform.priority) }) });
    if (d.success) { setSform({ name: '', type: 'official', url: '', priority: '', configuration: '' }); loadSources(sel.id); } else alert(d.message);
  }
  async function saveSrc() {
    const d = await api(`/api/admin/newspapers/sources/${editSrc.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editSrc) });
    if (d.success) { setEditSrc(null); loadSources(sel.id); } else alert(d.message);
  }
  async function delSrc(id: string) {
    if (!confirm('این سورس حذف شود؟')) return;
    await api(`/api/admin/newspapers/sources/${id}`, { method: 'DELETE' });
    loadSources(sel.id);
  }
  async function testSrc(id: string) {
    setTesting(id); setTestRes(null);
    const d = await api(`/api/admin/newspapers/fetch?testSource=${id}`);
    setTesting(null); setTestRes(d.data || { ok: false, error: d.message });
  }

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <div className="bg-white rounded-xl p-4 shadow">
        <h3 className="font-bold mb-2 text-sm">روزنامه‌ها ({papers.length})</h3>
        <div className="space-y-1 max-h-96 overflow-auto mb-3 text-sm">
          {papers.map((p) => (
            <div key={p.id} className={`flex items-center justify-between border rounded-lg px-2 py-1.5 ${sel?.id === p.id ? 'border-[#C9A96E] bg-amber-50' : ''}`}>
              <button className="flex-1 text-right" onClick={() => setSel(p)}><b>{p.name}</b> <span className="text-xs text-gray-400">{p.catFa} • {p.issues} شماره • {p.sources} سورس {p.lastIssue ? `• آخر: ${p.lastIssue.persianDate}` : ''}</span></button>
              <button onClick={() => toggleActive(p)} className={`text-xs px-2 py-1 rounded mx-1 ${p.active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>{p.active ? 'فعال' : 'غیرفعال'}</button>
              <button onClick={() => delPaper(p)} className="text-xs px-2 py-1 rounded bg-red-100 text-red-600">حذف</button>
            </div>
          ))}
        </div>
        <div className="border-t pt-3 grid grid-cols-2 gap-2 text-sm">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="نام روزنامه" className="border rounded-lg px-2 py-1.5" />
          <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="نامک انگلیسی" className="border rounded-lg px-2 py-1.5" dir="ltr" />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="border rounded-lg px-2 py-1.5"><option value="national">سراسری</option><option value="bushehr">بوشهر</option><option value="sports">ورزشی</option></select>
          <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="سایت (اختیاری)" className="border rounded-lg px-2 py-1.5" dir="ltr" />
          <button onClick={addPaper} className="col-span-2 bg-[#1B365D] text-white rounded-lg py-2 font-bold">+ افزودن روزنامه</button>
        </div>
      </div>
      <div className="bg-white rounded-xl p-4 shadow">
        {!sel ? <div className="text-gray-400 text-sm">یک روزنامه انتخاب کن تا سورس‌هایش را مدیریت کنی.</div> : (
          <>
            <h3 className="font-bold mb-2 text-sm">سورس‌های «{sel.name}»</h3>
            <div className="space-y-2 mb-3 text-sm">
              {sources.map((s) => (
                <div key={s.id} className="border rounded-lg p-2">
                  {editSrc?.id === s.id ? (
                    <div className="grid grid-cols-2 gap-1">
                      <input value={editSrc.name} onChange={(e) => setEditSrc({ ...editSrc, name: e.target.value })} className="border rounded px-2 py-1" />
                      <select value={editSrc.type} onChange={(e) => setEditSrc({ ...editSrc, type: e.target.value })} className="border rounded px-2 py-1">{Object.entries(TYPE_FA).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
                      <input value={editSrc.url || ''} onChange={(e) => setEditSrc({ ...editSrc, url: e.target.value })} className="border rounded px-2 py-1 col-span-2" dir="ltr" placeholder="URL" />
                      <input value={editSrc.configuration || ''} onChange={(e) => setEditSrc({ ...editSrc, configuration: e.target.value })} className="border rounded px-2 py-1 col-span-2" dir="ltr" placeholder='{"telegram_channel":"..."}' />
                      <input value={editSrc.priority} type="number" onChange={(e) => setEditSrc({ ...editSrc, priority: Number(e.target.value) })} className="border rounded px-2 py-1" placeholder="اولویت" />
                      <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={editSrc.active} onChange={(e) => setEditSrc({ ...editSrc, active: e.target.checked })} /> فعال</label>
                      <button onClick={saveSrc} className="bg-green-600 text-white rounded px-2 py-1">ذخیره</button>
                      <button onClick={() => setEditSrc(null)} className="bg-gray-200 rounded px-2 py-1">انصراف</button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0"><b>#{s.priority} {s.name}</b> <span className="text-xs text-gray-500">({TYPE_FA[s.type]})</span><div className="text-xs text-gray-400 truncate" dir="ltr">{s.url || '—'}</div></div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => testSrc(s.id)} disabled={testing === s.id} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{testing === s.id ? '...' : 'تست'}</button>
                        <button onClick={() => setEditSrc(s)} className="text-xs bg-gray-100 px-2 py-1 rounded">ویرایش</button>
                        <button onClick={() => delSrc(s.id)} className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">حذف</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {sources.length === 0 && <div className="text-xs text-amber-600">سورسی ثبت نشده — دریافت خودکار برای این روزنامه انجام نمی‌شود.</div>}
            </div>
            {testRes && (
              <div className={`text-xs rounded-lg p-2 mb-2 ${testRes.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                {testRes.ok ? <>✓ تصویر پیدا شد ({testRes.dims?.width}×{testRes.dims?.height}) — <span dir="ltr">{testRes.imageUrl?.slice(0, 80)}...</span></> : <>✗ {testRes.stage}: {testRes.error}</>}
                {testRes.debug && <div className="mt-1 pt-1 border-t border-black/10" dir="ltr">ch:{testRes.debug.channel} html:{testRes.debug.htmlLen} blocks:{testRes.debug.blocks} photos:{testRes.debug.photoBlocks} nf:{String(testRes.debug.notFound)} err:{testRes.debug.fetchError || '-'}</div>}
              </div>
            )}
            <div className="border-t pt-2 grid grid-cols-2 gap-1 text-sm">
              <input value={sform.name} onChange={(e) => setSform({ ...sform, name: e.target.value })} placeholder="نام سورس" className="border rounded px-2 py-1.5" />
              <select value={sform.type} onChange={(e) => setSform({ ...sform, type: e.target.value })} className="border rounded px-2 py-1.5">{Object.entries(TYPE_FA).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
              <input value={sform.url} onChange={(e) => setSform({ ...sform, url: e.target.value })} placeholder="URL (سایت یا t.me/...)" className="border rounded px-2 py-1.5 col-span-2" dir="ltr" />
              <input value={sform.configuration} onChange={(e) => setSform({ ...sform, configuration: e.target.value })} placeholder='تنظیمات JSON مثل {"telegram_channel":"hamshahri"}' className="border rounded px-2 py-1.5 col-span-2" dir="ltr" />
              <button onClick={addSource} className="col-span-2 bg-[#1B365D] text-white rounded-lg py-1.5 font-bold">+ افزودن سورس</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function IssuesTab() {
  const [items, setItems] = useState<any[]>([]);
  const [papers, setPapers] = useState<any[]>([]);
  const [f, setF] = useState({ status: '', newspaperId: '' });
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [up, setUp] = useState({ newspaperId: '', date: '', file: null as File | null });

  const load = (p = 1) => {
    const q = new URLSearchParams({ page: String(p) });
    if (f.status) q.set('status', f.status);
    if (f.newspaperId) q.set('newspaperId', f.newspaperId);
    api(`/api/admin/newspapers/issues?${q}`).then((d) => { if (d.success) { setItems(d.data.items); setPages(d.data.pages); setPage(d.data.page); } });
  };
  useEffect(() => { api('/api/admin/newspapers').then((d) => d.success && Array.isArray(d.data) && setPapers(d.data)); load(1); }, []);

  async function act(id: string, action: string) {
    const d = await api(`/api/admin/newspapers/issues/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) });
    if (d.success) load(page); else alert(d.message);
  }
  async function del(id: string) {
    if (!confirm('این شماره حذف شود؟')) return;
    await api(`/api/admin/newspapers/issues/${id}`, { method: 'DELETE' });
    load(page);
  }
  async function replace(id: string, file: File | null) {
    if (!file) return;
    const fd = new FormData(); fd.append('file', file);
    const r = await fetch(`/api/admin/newspapers/issues/${id}/replace`, { method: 'POST', body: fd });
    const d = await r.json();
    if (d.success) { alert('جایگزین شد (MANUAL)'); load(page); } else alert(d.message);
  }
  async function upload() {
    if (!up.newspaperId || !up.file) { alert('روزنامه و عکس لازم است'); return; }
    const fd = new FormData();
    fd.append('newspaperId', up.newspaperId); fd.append('file', up.file);
    if (up.date) fd.append('date', up.date);
    const r = await fetch('/api/admin/newspapers/issues', { method: 'POST', body: fd });
    const d = await r.json();
    if (d.success) { alert('ثبت شد'); setUp({ newspaperId: '', date: '', file: null }); load(1); } else alert(d.message);
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-3 shadow flex flex-wrap gap-2 items-end text-sm">
        <select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })} className="border rounded-lg px-2 py-1.5"><option value="">همه وضعیت‌ها</option>{Object.entries(STATUS_FA).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        <select value={f.newspaperId} onChange={(e) => setF({ ...f, newspaperId: e.target.value })} className="border rounded-lg px-2 py-1.5"><option value="">همه روزنامه‌ها</option>{papers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
        <button onClick={() => load(1)} className="bg-[#1B365D] text-white px-4 py-1.5 rounded-lg">اعمال</button>
        <div className="flex gap-2 items-end mr-auto flex-wrap">
          <select value={up.newspaperId} onChange={(e) => setUp({ ...up, newspaperId: e.target.value })} className="border rounded-lg px-2 py-1.5"><option value="">آپلود دستی...</option>{papers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
          <input type="date" value={up.date} onChange={(e) => setUp({ ...up, date: e.target.value })} className="border rounded-lg px-2 py-1.5" />
          <input type="file" accept="image/*" onChange={(e) => setUp({ ...up, file: e.target.files?.[0] || null })} className="text-xs" />
          <button onClick={upload} className="bg-green-700 text-white px-4 py-1.5 rounded-lg font-bold">ثبت دستی</button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map((it) => (
          <div key={it.id} className="bg-white rounded-xl shadow overflow-hidden">
            {it.thumbnailUrl ? <img src={it.thumbnailUrl} alt={it.newspaper.name} className="w-full aspect-[3/4] object-cover" loading="lazy" /> : <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center text-gray-400 text-xs">بدون تصویر</div>}
            <div className="p-2 text-xs">
              <b>{it.newspaper.name}</b> <span className="text-gray-500">{it.persianDate}</span>
              <div className="text-gray-500">اطمینان: {it.confidence} • {STATUS_FA[it.status]}</div>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {it.status !== 'PUBLISHED' && <button onClick={() => act(it.id, 'publish')} className="bg-green-100 text-green-700 px-2 py-0.5 rounded">انتشار</button>}
                {it.status !== 'REJECTED' && <button onClick={() => act(it.id, 'reject')} className="bg-red-100 text-red-600 px-2 py-0.5 rounded">رد</button>}
                <label className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded cursor-pointer">جایگزینی<input type="file" accept="image/*" className="hidden" onChange={(e) => replace(it.id, e.target.files?.[0] || null)} /></label>
                <button onClick={() => del(it.id)} className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded">حذف</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {pages > 1 && (
        <div className="flex gap-2 justify-center text-white text-sm">
          <button disabled={page <= 1} onClick={() => load(page - 1)} className="px-3 py-1 bg-white/10 rounded disabled:opacity-40">قبلی</button>
          <span className="px-2 py-1">{page} / {pages}</span>
          <button disabled={page >= pages} onClick={() => load(page + 1)} className="px-3 py-1 bg-white/10 rounded disabled:opacity-40">بعدی</button>
        </div>
      )}
    </div>
  );
}

function ErrorsTab() {
  const [logs, setLogs] = useState<any[]>([]);
  useEffect(() => { api('/api/admin/newspapers/logs?status=FAILED&limit=100').then((d) => d.success && setLogs(d.data)); }, []);
  return (
    <div className="bg-white rounded-xl p-4 shadow text-sm">
      <h3 className="font-bold mb-2">خطاهای دریافت ({logs.length})</h3>
      <div className="space-y-1 max-h-[60vh] overflow-auto">
        {logs.length === 0 && <div className="text-gray-400">خطایی ثبت نشده است.</div>}
        {logs.map((l) => (
          <div key={l.id} className="border-b py-1.5"><b>{l.paperName || '—'}</b> <span className="text-gray-400 text-xs">{new Date(l.createdAt).toLocaleString('fa-IR')}</span><div className="text-red-600 text-xs">{l.errorMessage}</div></div>
        ))}
      </div>
    </div>
  );
}
