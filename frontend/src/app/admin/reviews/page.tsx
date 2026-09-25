'use client';

import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { toast } from 'sonner';

interface AdminReview {
  id: string; name: string; profession: string | null; rating: number; feedback: string;
  status: 'pending' | 'approved'; createdAt: string; updatedAt: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadReviews() {
    try {
      const response = await apiRequest<{ data: AdminReview[] }>({ method: 'GET', path: '/api/admin/reviews' });
      setReviews(response.data);
    } catch { toast.error('Failed to load reviews'); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadReviews(); }, []);

  async function approve(id: string) {
    try {
      await apiRequest({ method: 'PATCH', path: `/api/admin/reviews/${id}/approve` });
      setReviews((current) => current.map((review) => review.id === id ? { ...review, status: 'approved' } : review));
      toast.success('Review approved');
    } catch { toast.error('Failed to approve review'); }
  }

  async function remove(id: string) {
    if (!window.confirm('Delete this review?')) return;
    try {
      await apiRequest({ method: 'DELETE', path: `/api/admin/reviews/${id}` });
      setReviews((current) => current.filter((review) => review.id !== id));
      toast.success('Review deleted');
    } catch { toast.error('Failed to delete review'); }
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] text-[var(--text-secondary)]">Loading reviews…</div>;

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] px-4 py-8 text-[var(--text-primary)] md:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="border-b border-[var(--border-default)] pb-6">
          <p className="text-sm text-[var(--text-secondary)]">Admin moderation</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Reviews</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">Approve submitted reviews before they become publicly visible.</p>
        </header>
        {reviews.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-10 text-center text-sm text-[var(--text-secondary)]">No reviews submitted.</div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <article key={review.id} className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="font-semibold">{review.name}</h2>
                      <span className="text-sm text-[var(--text-secondary)]">{review.profession || 'User'}</span>
                      <span className="text-sm" aria-label={`${review.rating} out of 5 stars`}>{'★'.repeat(review.rating)}</span>
                      <span className="rounded-full border border-[var(--border-default)] px-2 py-1 text-xs">{review.status}</span>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[var(--text-secondary)]">{review.feedback}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {review.status !== 'approved' && <button onClick={() => approve(review.id)} className="rounded-lg border border-emerald-500/30 px-3 py-2 text-sm font-medium text-emerald-500 hover:bg-emerald-500/10">Approve</button>}
                    <button onClick={() => remove(review.id)} className="rounded-lg border border-rose-500/30 px-3 py-2 text-sm font-medium text-rose-500 hover:bg-rose-500/10">Delete</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
