'use client';

import { useState, useEffect } from 'react';

interface Submission {
  id: string;
  title: string;
  content: string;
  category: string;
  mediaType: string;
  mediaUrl: string | null;
  senderName: string;
  senderPhone: string | null;
  senderEmail: string | null;
  status: string;
  adminNote: string | null;
  createdAt: string;
}

const statusMap: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'در انتظار بررسی', color: 'bg-amber-100 text-amber-700' },
  APPROVED: { label: 'تایید شده', color: 'bg-emerald-100 text-emerald-700' },
  REJECTED: { label: 'رد شده', color: 'bg-red-100 text-red-700' },
};

const categoryMap: Record<string, string> = {
  havades: 'حوادث', eghtesadi: 'اقتصادی', ejtemaei: 'اجتماعی',
  siyasi: 'سیاسی', varzeshi: 'ورزشی', farhangi: 'فرهنگی',
  fanavari: 'فناوری', elmi: 'علمی', bushahr: 'بوشهر', other: 'سایر',
};

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filter, setFilter] = useState('PENDING');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [note, setNote] = useState('');

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/submissions?status=${filter}`);
      const data = await res.json();
      setSubmissions(data.items || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchSubmissions(); }, [filter]);

  const handleAction = async (id: string, status: string) => {
    await fetch('/api/admin/submissions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, adminNote: note }),
    });
    setSelected(null);
    setNote('');
    fetchSubmissions();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا مطمئن هستید؟')) return;
    await fetch('/api/admin/submissions', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setSelected(null);
    fetchSubmissions();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-[#1B365D]">اخبار ارسالی مخاطبین</h1>
        <div className="flex gap-2">
          {['PENDING', 'APPROVED', 'REJECTED'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                filter === s ? 'bg-[#1B365D] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {statusMap[s].label}
              {submissions.length > 0 && filter === s && (
                <span className="mr-1.5 text-xs opacity-70">({submissions.length})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-4 border-[#C9A96E] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-400">خبری موجود نیست</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelected(item)}
              className="bg-white rounded-xl border border-gray-100 p-5 cursor-pointer hover:border-[#C9A96E]/30 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${statusMap[item.status]?.color}`}>
                      {statusMap[item.status]?.label}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {categoryMap[item.category] || item.category}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                      {item.mediaType === 'PHOTO' ? '📷 عکس' : item.mediaType === 'VIDEO' ? '🎬 فیلم' : '📝 متنی'}
                    </span>
                  </div>
                  <h3 className="font-bold text-[#1B365D] text-lg mb-1">{item.title}</h3>
                  <p className="text-gray-500 text-sm line-clamp-2">{item.content}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                    <span>👤 {item.senderName}</span>
                    {item.senderPhone && <span>📞 {item.senderPhone}</span>}
                    <span>{new Date(item.createdAt).toLocaleDateString('fa-IR')}</span>
                  </div>
                </div>
                {item.mediaUrl && (
                  <div className="flex-shrink-0">
                    {item.mediaType === 'PHOTO' ? (
                      <img src={item.mediaUrl} alt="" className="w-20 h-20 rounded-lg object-cover" />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center text-2xl">🎬</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* مودال */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black text-[#1B365D]">{selected.title}</h2>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${statusMap[selected.status]?.color}`}>
                  {statusMap[selected.status]?.label}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                  {categoryMap[selected.category] || selected.category}
                </span>
              </div>

              {selected.mediaUrl && (
                <div className="mb-4">
                  {selected.mediaType === 'PHOTO' ? (
                    <img src={selected.mediaUrl} alt="" className="w-full rounded-xl" />
                  ) : (
                    <video src={selected.mediaUrl} controls className="w-full rounded-xl" />
                  )}
                </div>
              )}

              <div className="prose prose-sm max-w-none mb-4 text-gray-700 whitespace-pre-wrap">{selected.content}</div>

              <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm">
                <div className="grid grid-cols-3 gap-4">
                  <div><span className="text-gray-400">فرستنده:</span> <span className="font-bold">{selected.senderName}</span></div>
                  <div><span className="text-gray-400">تلفن:</span> <span className="font-bold">{selected.senderPhone || '-'}</span></div>
                  <div><span className="text-gray-400">ایمیل:</span> <span className="font-bold">{selected.senderEmail || '-'}</span></div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">یادداشت مدیر</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9A96E]"
                  placeholder="یادداشت اختیاری..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleAction(selected.id, 'APPROVED')}
                  className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-colors"
                >
                  تایید و انتشار
                </button>
                <button
                  onClick={() => handleAction(selected.id, 'REJECTED')}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-colors"
                >
                  رد کردن
                </button>
                <button
                  onClick={() => handleDelete(selected.id)}
                  className="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
                >
                  حذف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}