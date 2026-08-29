'use client';

import { useState, useEffect, useRef } from 'react';

interface MediaFile {
  id: string;
  filename: string;
  url: string;
  size: number;
  createdAt: string;
}

export default function GalleryPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFiles = async () => {
    try {
      const res = await fetch('/api/admin/media');
      const data = await res.json();
      setFiles(data.files || []);
    } catch {}
  };

  useEffect(() => { loadFiles(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setProgress(0);
    const formData = new FormData();
    formData.append('file', file);
    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener('progress', e => {
      if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
    });
    xhr.addEventListener('load', () => {
      setUploading(false);
      setProgress(0);
      loadFiles();
    });
    xhr.open('POST', '/api/admin/media');
    xhr.send(formData);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا مطمئن هستید؟')) return;
    await fetch(`/api/admin/media?id=${id}`, { method: 'DELETE' });
    loadFiles();
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  return (
    <div dir="rtl">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-[#0a1628]">گالری تصاویر</h1>
        <p className="text-sm text-gray-400 mt-1">تصاویر و فایل‌های رسانه سایت</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 rounded-xl bg-[#1B365D] text-white text-sm font-bold hover:bg-[#0f2440] transition-colors disabled:opacity-50"
        >
          {uploading ? `در حال آپلود... ${progress}%` : 'آپلود تصویر'}
        </button>
        {uploading && (
          <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#C9A96E] rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {files.map(file => (
          <div key={file.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden group">
            <div className="aspect-square bg-gray-50 relative overflow-hidden">
              <img src={file.url} alt={file.filename} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button onClick={() => copyUrl(file.url)} className="w-8 h-8 rounded-lg bg-white/90 flex items-center justify-center text-[#1B365D] hover:bg-white" title="کپی لینک">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                </button>
                <button onClick={() => handleDelete(file.id)} className="w-8 h-8 rounded-lg bg-red-500/90 flex items-center justify-center text-white hover:bg-red-500" title="حذف">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
            <div className="p-2">
              <p className="text-[11px] text-gray-500 truncate">{file.filename}</p>
              <p className="text-[10px] text-gray-300">{(file.size / 1024).toFixed(0)} KB</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
