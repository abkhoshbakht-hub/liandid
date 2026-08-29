'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface MediaFile {
  name: string;
  url: string;
  size?: number;
}

export default function MediaPage() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/secure-a2x-admin');
    }
  }, [isAuthenticated, isAdmin, isLoading, router]);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const res = await fetch('/api/admin/media');
      const data = await res.json();
      if (data.success) setFiles(data.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (data.success) {
          setFiles(prev => [...prev, data.data]);
        }
        setUploadProgress(Math.round(((i + 1) / fileList.length) * 100));
      } catch (error) {
        console.error('Error uploading:', error);
      }
    }

    setUploading(false);
    setUploadProgress(0);
    e.target.value = '';
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    alert('آدرس کپی شد');
  };

  if (isLoading || !isAuthenticated || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-[#C9A96E] border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#1B365D] text-white py-4">
        <div className="site-container flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-[#C9A96E] hover:text-white transition-colors">← بازگشت</Link>
            <h1 className="text-xl font-bold">مدیریت رسانه</h1>
          </div>
        </div>
      </div>

      <div className="site-container py-8">
        {/* ناحیه آپلود */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-bold text-[#1B365D] mb-4">آپلود فایل</h2>
          
          <label className="block w-full border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-[#C9A96E] hover:bg-gray-50 transition-all">
            <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-gray-600 font-bold mb-1">برای آپلود کلیک کنید</p>
            <p className="text-sm text-gray-400">PNG, JPG, GIF تا ۵ مگابایت</p>
            <input type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" disabled={uploading} />
          </label>

          {uploading && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>در حال آپلود...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-[#C9A96E] h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* لیست فایل‌ها */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-[#1B365D] mb-4">فایل‌های آپلود شده ({files.length})</h2>
          
          {files.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p>فایلی آپلود نشده</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {files.map((file, idx) => (
                <div key={idx} className="group relative aspect-square rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all">
                  <Image src={file.url} alt={file.name} fill className="object-cover" sizes="200px" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button onClick={() => copyUrl(file.url)} className="px-3 py-1.5 bg-white text-[#1B365D] rounded-lg text-xs font-bold hover:bg-[#C9A96E] transition-colors">
                      کپی لینک
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-white/90 px-2 py-1 text-xs text-gray-600 truncate">
                    {file.name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
