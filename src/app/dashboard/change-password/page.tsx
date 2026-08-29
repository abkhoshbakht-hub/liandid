'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ChangePasswordPage() {
  const { isAuthenticated, isAdmin, isLoading, user } = useAuth();
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  if (isLoading || !isAuthenticated || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-[#C9A96E] border-t-transparent rounded-full" /></div>;
  }

  const handleSubmit = async () => {
    setResult(null);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setResult({ success: false, message: 'لطفاً تمام فیلدها را پر کنید' });
      return;
    }
    if (newPassword.length < 6) {
      setResult({ success: false, message: 'رمز جدید باید حداقل ۶ کاراکتر باشد' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setResult({ success: false, message: 'رمز جدید و تکرار آن مطابقت ندارند' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      setResult(data);
      if (data.success) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setResult({ success: false, message: 'خطا در ارتباط با سرور' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#1B365D] text-white py-4">
        <div className="site-container flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-[#C9A96E] hover:text-white transition-colors">بازگشت</Link>
            <h1 className="text-xl font-bold">تغییر رمز عبور</h1>
          </div>
        </div>
      </div>

      <div className="site-container py-12">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto bg-[#1B365D]/10 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-[#1B365D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-800">تغییر رمز عبور</h2>
            <p className="text-sm text-gray-400 mt-1">{user?.email}</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">رمز عبور فعلی</label>
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C9A96E]"
                placeholder="رمز فعلی را وارد کنید"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">رمز عبور جدید</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C9A96E]"
                placeholder="حداقل ۶ کاراکتر"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">تکرار رمز جدید</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C9A96E]"
                placeholder="رمز جدید را دوباره وارد کنید"
              />
            </div>

            {result && (
              <div className={`p-3 rounded-xl text-sm font-medium ${result.success ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                {result.message}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-l from-[#C9A96E] to-[#b8945d] text-white rounded-xl font-bold hover:from-[#d4b87a] hover:to-[#C9A96E] transition-all disabled:opacity-50"
            >
              {loading ? 'در حال ذخیره...' : 'ذخیره رمز جدید'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
