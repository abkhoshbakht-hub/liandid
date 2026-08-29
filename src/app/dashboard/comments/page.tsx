'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Comment {
  id: string;
  content: string;
  approved: boolean;
  createdAt: string;
  user: { name: string; email: string };
  article: { title: string; slug: string };
}

export default function CommentsPage() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/secure-a2x-admin');
    }
  }, [isAuthenticated, isAdmin, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && isAdmin) fetchComments();
  }, [isAuthenticated, isAdmin]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/comments');
      const data = await res.json();
      if (data.success) setComments(data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string, approved: boolean) => {
    try {
      const res = await fetch('/api/admin/comments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId: id, approved }),
      });
      const data = await res.json();
      if (data.success) fetchComments();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const filteredComments = comments.filter(c => {
    if (filter === 'pending') return !c.approved;
    if (filter === 'approved') return c.approved;
    return true;
  });

  if (isLoading || !isAuthenticated || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-[#C9A96E] border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#1B365D] text-white py-4">
        <div className="site-container flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-[#C9A96E] hover:text-white transition-colors">← بازگشت</Link>
            <h1 className="text-xl font-bold">مدیریت نظرات</h1>
          </div>
          <div className="flex gap-2">
            {(['all', 'pending', 'approved'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filter === f ? 'bg-[#C9A96E] text-[#1B365D]' : 'bg-white/20 text-white hover:bg-white/30'}`}>
                {f === 'all' ? 'همه' : f === 'pending' ? 'در انتظار' : 'تایید شده'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="site-container py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">در حال بارگذاری...</div>
          ) : filteredComments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">نظری یافت نشد</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredComments.map(comment => (
                <div key={comment.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-sm text-[#1B365D]">{comment.user.name}</span>
                        <span className="text-xs text-gray-500">{comment.user.email}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${comment.approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {comment.approved ? 'تایید شده' : 'در انتظار'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{comment.content}</p>
                      <div className="text-xs text-gray-400">
                        خبر: <Link href={`/news/${comment.article.slug}`} target="_blank" className="text-[#C9A96E] hover:underline">{comment.article.title}</Link>
                        <span className="mr-3">{new Date(comment.createdAt).toLocaleString('fa-IR')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!comment.approved && (
                        <button onClick={() => handleApprove(comment.id, true)} className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs font-bold hover:bg-green-200 transition-colors">تایید</button>
                      )}
                      {comment.approved && (
                        <button onClick={() => handleApprove(comment.id, false)} className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-bold hover:bg-yellow-200 transition-colors">رد</button>
                      )}
                    </div>
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
