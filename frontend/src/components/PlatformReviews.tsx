'use client';

import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';

export interface Review {
  id: string;
  name: string;
  rating: number;
  feedback: string;
  profession?: string;
  createdAt?: string;
}

export function PlatformReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [form, setForm] = useState({ name: '', profession: '', rating: 5, feedback: '' });

  useEffect(() => {
    apiRequest<{ success: boolean; data: Review[] }>({
      method: 'GET',
      path: '/api/public/reviews',
      requiresAuth: false,
    }).then((data) => {
      if (data.success) setReviews(data.data);
    }).catch(() => setReviews([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.feedback.trim()) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const data = await apiRequest<{ success: boolean; message?: string }>({
        method: 'POST',
        path: '/api/public/reviews',
        requiresAuth: false,
        body: {
          name: form.name.trim(),
          profession: form.profession.trim() || 'User',
          rating: form.rating,
          feedback: form.feedback.trim(),
        },
      });
      if (!data.success) throw new Error(data.message || 'Review submission failed.');
      setSubmitted(true);
      setForm({ name: '', profession: '', rating: 5, feedback: '' });
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Review submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-5xl">
      <div className="mb-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent-primary)]">Community feedback</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">VaultLedger reviews</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--text-secondary)]">Public reviews are moderated before they appear here.</p>
      </div>

      {reviews.length > 0 && (
        <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-2">
          {reviews.map((review) => (
            <article key={review.id} className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-secondary)] p-5 shadow-[var(--shadow-sm)]">
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm tracking-wide text-amber-400" aria-label={review.rating + ' out of 5 stars'}>
                  {'★'.repeat(review.rating)}
                </div>
                {review.createdAt && <time className="text-xs text-[var(--text-muted)]">{new Date(review.createdAt).toLocaleDateString()}</time>}
              </div>
              <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">“{review.feedback}”</p>
              <p className="mt-4 text-sm font-semibold text-[var(--text-primary)]">
                {review.name}
                <span className="font-normal text-[var(--text-secondary)]"> · {review.profession || 'User'}</span>
              </p>
            </article>
          ))}
        </div>
      )}

      <div className="mx-auto max-w-2xl rounded-2xl border border-[var(--border-default)] bg-[var(--bg-secondary)] p-6 shadow-[var(--shadow-sm)] sm:p-8">
        {submitted ? (
          <div className="py-4 text-center">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Review submitted for moderation</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">It will appear publicly after approval.</p>
            <button onClick={() => setSubmitted(false)} className="mt-5 rounded-lg border border-[var(--border-default)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]">
              Write another review
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Share your experience</h3>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">Your review will be moderated before publication.</p>
            </div>
            {errorMsg && <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-2 text-sm text-rose-500">{errorMsg}</div>}
            <input required maxLength={100} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-input)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--border-focus)]" />
            <input maxLength={100} value={form.profession} onChange={(e) => setForm({ ...form, profession: e.target.value })} placeholder="Role / profession" className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-input)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--border-focus)]" />
            <div className="flex items-center gap-1" aria-label="Choose rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button type="button" key={star} onClick={() => setForm({ ...form, rating: star })} aria-label={star + ' stars'} className={'rounded-lg px-2 py-1 text-xl transition-colors ' + (star <= form.rating ? 'text-amber-400' : 'text-[var(--text-muted)] hover:text-amber-300')}>
                  ★
                </button>
              ))}
            </div>
            <textarea required rows={4} maxLength={2000} value={form.feedback} onChange={(e) => setForm({ ...form, feedback: e.target.value })} placeholder="How was your experience?" className="w-full resize-none rounded-xl border border-[var(--border-default)] bg-[var(--bg-input)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--border-focus)]" />
            <button type="submit" disabled={isSubmitting} className="w-full rounded-xl bg-[var(--accent-primary)] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50">
              {isSubmitting ? 'Submitting…' : 'Submit review'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
