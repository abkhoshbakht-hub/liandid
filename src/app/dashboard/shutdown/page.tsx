'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ShutdownPage() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<'confirm' | 'backup' | 'done'>('confirm');
  const [wantBackup, setWantBackup] = useState<boolean | null>(null);
  const [backupPath, setBackupPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; path?: string } | null>(null);

  if (isLoading || !isAuthenticated || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-[#C9A96E] border-t-transparent rounded-full" /></div>;
  }

  const handleBackup = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backupPath: backupPath || undefined, shutdown: false }),
      });
      const data = await res.json();
      setResult(data);
      setStep('done');
    } catch {
      setResult({ success: false, message: 'خطا در ارتباط با سرور' });
      setStep('done');
    }
    setLoading(false);
  };

  const handleShutdown = async () => {
    if (wantBackup) {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/backup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ backupPath: backupPath || undefined, shutdown: true }),
        });
        const data = await res.json();
        setResult({ ...data, message: 'بکاپ ذخیره شد. سرور در حال خاموش شدن...' });
        setStep('done');
      } catch {
        setResult({ success: false, message: 'خطا در ارتباط با سرور' });
        setStep('done');
      }
    } else {
      try {
        await fetch('/api/admin/backup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ backupPath: '', shutdown: true }),
        });
        setResult({ success: true, message: 'سرور در حال خاموش شدن...' });
        setStep('done');
      } catch {
        setResult({ success: true, message: 'سرور در حال خاموش شدن...' });
        setStep('done');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#1B365D] text-white py-4">
        <div className="site-container flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-[#C9A96E] hover:text-white transition-colors">بازگشت</Link>
            <h1 className="text-xl font-bold">خاموش کردن سیستم</h1>
          </div>
        </div>
      </div>

      <div className="site-container py-12">
        <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-lg p-8">

          {step === 'confirm' && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-red-50 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800">خاموش کردن سیستم</h2>
              <p className="text-gray-500">آیا می‌خواهید قبل از خاموشی بکاپ بگیرید؟</p>
              <div className="flex gap-3">
                <button
                  onClick={() => { setWantBackup(true); setStep('backup'); }}
                  className="flex-1 py-3 bg-[#1B365D] text-white rounded-xl font-bold hover:bg-[#2a4a7a] transition-colors"
                >
                  بله، بکاپ بگیر
                </button>
                <button
                  onClick={() => { setWantBackup(false); handleShutdown(); }}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
                >
                  خیر، فقط خاموش کن
                </button>
              </div>
            </div>
          )}

          {step === 'backup' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800">ذخیره بکاپ</h2>
                <p className="text-gray-500 mt-2 text-sm">مسیر ذخیره‌سازی بکاپ را مشخص کنید</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">مسیر ذخیره‌سازی</label>
                <input
                  type="text"
                  value={backupPath}
                  onChange={e => setBackupPath(e.target.value)}
                  placeholder={`پیش‌فرض: D:\\MyProgect\\backup_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C9A96E]"
                />
                <p className="text-xs text-gray-400 mt-2">اگه خالی بذارید، مسیر پیش‌فرض انتخاب میشه</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleBackup}
                  disabled={loading}
                  className="flex-1 py-3 bg-[#1B365D] text-white rounded-xl font-bold hover:bg-[#2a4a7a] transition-colors disabled:opacity-50"
                >
                  {loading ? 'در حال بکاپ...' : 'ذخیره بکاپ'}
                </button>
                <button
                  onClick={handleShutdown}
                  disabled={loading}
                  className="py-3 px-6 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  خاموش کن
                </button>
              </div>
              <button onClick={() => setStep('confirm')} className="w-full text-center text-gray-400 text-sm hover:text-gray-600">
                بازگشت
              </button>
            </div>
          )}

          {step === 'done' && result && (
            <div className="text-center space-y-6">
              <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
                {result.success ? (
                  <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <h2 className={`text-xl font-bold ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                {result.success ? 'موفق' : 'خطا'}
              </h2>
              <p className="text-gray-500">{result.message}</p>
              {result.path && (
                <p className="text-xs text-gray-400 bg-gray-50 p-3 rounded-lg break-all">{result.path}</p>
              )}
              <Link
                href="/dashboard"
                className="inline-block py-3 px-8 bg-[#1B365D] text-white rounded-xl font-bold hover:bg-[#2a4a7a] transition-colors"
              >
                بازگشت به داشبورد
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
