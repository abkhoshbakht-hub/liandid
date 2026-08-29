'use client';

import { useState } from 'react';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(data.message);
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error);
      }
    } catch {
      setStatus('error');
      setMessage('خطا در اتصال');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 min-w-0">
      <input
        type="email"
        value={email}
        onChange={e => { setEmail(e.target.value); setStatus('idle'); }}
        placeholder="ایمیل خود را وارد کنید"
        required
        className="flex-1 min-w-0 px-3 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-[#C9A96E] transition-colors placeholder-white/40"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="px-4 py-2.5 bg-[#C9A96E] text-[#1B365D] rounded-lg hover:bg-[#d4b87a] transition-all font-bold text-sm whitespace-nowrap flex-shrink-0 disabled:opacity-50"
      >
        {status === 'loading' ? '...' : 'عضویت'}
      </button>
      {status !== 'idle' && (
        <p className={`absolute -bottom-6 right-0 text-[11px] ${status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
          {message}
        </p>
      )}
    </form>
  );
}
