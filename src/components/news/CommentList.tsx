'use client';

import { useEffect, useState } from 'react';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    name: string;
    avatar: string | null;
  };
}

interface CommentListProps {
  articleId: string;
}

export default function CommentList({ articleId }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [articleId]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?articleId=${articleId}`);
      const data = await res.json();
      if (data.success) {
        setComments(data.data);
      }
    } catch {
      console.error('خطا در دریافت نظرات');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500">
        در حال بارگذاری نظرات...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold flex items-center gap-2">
        <svg className="w-5 h-5 text-[#1B365D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
        </svg>
        نظرات ({comments.length})
      </h3>

      {comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
          هنوز نظری ثبت نشده است. اولین نفری باشید که نظر می‌دهید!
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1B365D] to-[#2E5090] flex items-center justify-center text-white font-bold text-sm">
                  {comment.user.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-sm">{comment.user.name}</div>
                  <div className="text-xs text-gray-500">{formatDate(comment.createdAt)}</div>
                </div>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">{comment.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
