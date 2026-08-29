'use client';

import Link from 'next/link';

export default function BackToHome() {
  return (
    <Link
      href="/"
      className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-5 py-3 bg-[#1B365D] text-white rounded-full shadow-lg shadow-[#1B365D]/30 hover:bg-[#2E5090] hover:shadow-xl transition-all font-bold text-sm"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
      صفحه اصلی
    </Link>
  );
}
