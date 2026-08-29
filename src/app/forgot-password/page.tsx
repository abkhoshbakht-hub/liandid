'use client';

import { useState } from 'react';
import Link from 'next/link';

type Step = 'phone' | 'otp' | 'newPassword' | 'done';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpDebug, setOtpDebug] = useState('');

  const handleSendOTP = async () => {
    setError('');
    if (!phone.trim()) { setError('شماره موبایل را وارد کنید'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message); setLoading(false); return; }
      if (data.otp) setOtpDebug(data.otp);
      setStep('otp');
    } catch {
      setError('خطا در ارتباط با سرور');
    }
    setLoading(false);
  };

  const handleVerifyOTP = () => {
    setError('');
    if (!otp.trim()) { setError('کد بازیابی را وارد کنید'); return; }
    if (otp.trim().length !== 6) { setError('کد بازیابی ۶ رقمی است'); return; }
    setStep('newPassword');
  };

  const handleResetPassword = async () => {
    setError('');
    if (!newPassword) { setError('رمز جدید را وارد کنید'); return; }
    if (newPassword.length < 6) { setError('رمز جدید باید حداقل ۶ کاراکتر باشد'); return; }
    if (newPassword !== confirmPassword) { setError('تکرار رمز مطابقت ندارد'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim(), otp: otp.trim(), newPassword }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message); setLoading(false); return; }
      setStep('done');
    } catch {
      setError('خطا در ارتباط با سرور');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2440] via-[#1B365D] to-[#2a4a7a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">بازیابی رمز عبور</h1>
          <p className="text-white/60 text-sm">لیان دید | پایگاه خبری استان بوشهر</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Step indicators */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {['phone', 'otp', 'newPassword'].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s ? 'bg-[#C9A96E] text-white' :
                  (['phone', 'otp', 'newPassword'].indexOf(step) > i ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400')
                }`}>{i + 1}</div>
                {i < 2 && <div className={`w-8 h-0.5 ${['phone', 'otp', 'newPassword'].indexOf(step) > i ? 'bg-green-500' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-200">{error}</div>
          )}

          {otpDebug && step === 'otp' && (
            <div className="mb-4 p-3 bg-blue-50 text-blue-700 text-sm rounded-xl border border-blue-200">
              <strong>کد OTP شما:</strong> <span className="font-mono text-lg">{otpDebug}</span>
              <div className="text-xs text-blue-500 mt-1">(پیامک فعال نیست - کد در اینجا نمایش داده می‌شود)</div>
            </div>
          )}

          {/* Step 1: Phone */}
          {step === 'phone' && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <div className="w-16 h-16 mx-auto bg-[#1B365D]/10 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-8 h-8 text-[#1B365D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-gray-800">شماره موبایل خود را وارد کنید</h2>
                <p className="text-sm text-gray-400 mt-1">کد بازیابی رمز به این شماره ارسال می‌شود</p>
              </div>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-center focus:outline-none focus:border-[#C9A96E]"
                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                dir="ltr"
              />
              <button onClick={handleSendOTP} disabled={loading}
                className="w-full py-3 bg-gradient-to-l from-[#C9A96E] to-[#b8945d] text-white rounded-xl font-bold hover:from-[#d4b87a] hover:to-[#C9A96E] transition-all disabled:opacity-50">
                {loading ? 'در حال ارسال...' : 'ارسال کد بازیابی'}
              </button>
            </div>
          )}

          {/* Step 2: OTP */}
          {step === 'otp' && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <div className="w-16 h-16 mx-auto bg-[#1B365D]/10 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-8 h-8 text-[#1B365D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-gray-800">کد بازیابی را وارد کنید</h2>
                <p className="text-sm text-gray-400 mt-1">کد ۶ رقمی ارسال شده به شماره {phone}</p>
              </div>
              <input
                type="text"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:border-[#C9A96E]"
                placeholder="۰۰۰۰۰۰"
                dir="ltr"
                maxLength={6}
              />
              <button onClick={handleVerifyOTP}
                className="w-full py-3 bg-gradient-to-l from-[#C9A96E] to-[#b8945d] text-white rounded-xl font-bold hover:from-[#d4b87a] hover:to-[#C9A96E] transition-all">
                تایید کد
              </button>
              <button onClick={() => { setStep('phone'); setError(''); setOtpDebug(''); }}
                className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                تغییر شماره موبایل
              </button>
            </div>
          )}

          {/* Step 3: New Password */}
          {step === 'newPassword' && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <div className="w-16 h-16 mx-auto bg-[#1B365D]/10 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-8 h-8 text-[#1B365D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-gray-800">رمز عبور جدید را وارد کنید</h2>
              </div>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C9A96E]"
                placeholder="حداقل ۶ کاراکتر"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C9A96E]"
                placeholder="تکرار رمز عبور جدید"
              />
              <button onClick={handleResetPassword} disabled={loading}
                className="w-full py-3 bg-gradient-to-l from-[#C9A96E] to-[#b8945d] text-white rounded-xl font-bold hover:from-[#d4b87a] hover:to-[#C9A96E] transition-all disabled:opacity-50">
                {loading ? 'در حال ذخیره...' : 'ذخیره رمز جدید'}
              </button>
            </div>
          )}

          {/* Step 4: Done */}
          {step === 'done' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-800">رمز عبور با موفقیت تغییر کرد</h2>
              <p className="text-sm text-gray-400">حالا می‌توانید با رمز جدید وارد شوید</p>
              <Link href="/secure-a2x-admin"
                className="block w-full py-3 bg-[#1B365D] text-white rounded-xl font-bold hover:bg-[#2a4a7a] transition-all text-center">
                ورود به پنل مدیریت
              </Link>
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <Link href="/secure-a2x-admin" className="text-white/50 hover:text-white text-sm transition-colors">
            بازگشت به صفحه ورود
          </Link>
        </div>
      </div>
    </div>
  );
}
