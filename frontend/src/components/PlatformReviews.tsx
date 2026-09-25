'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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
    <div style={{ padding: '4rem 2rem', maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '0.75rem', color: '#fff' }}>
          VaultLedger <span style={{ color: '#10b981' }}>App Experience &amp; Reviews</span>
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Share your experience using VaultLedger.</p>
      </div>

      {reviews.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          {reviews.map((review) => (
            <div key={review.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '1rem', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ color: '#fbbf24' }}>{'★'.repeat(review.rating)}</div>
                {review.createdAt && <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{new Date(review.createdAt).toLocaleDateString()}</span>}
              </div>
              <p style={{ color: '#e2e8f0', fontStyle: 'italic', marginBottom: '1rem', lineHeight: 1.5 }}>&ldquo;{review.feedback}&rdquo;</p>
              <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fff' }}>{review.name} <span style={{ color: '#10b981', fontWeight: 400 }}>• {review.profession}</span></div>
            </div>
          ))}
        </div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ background: 'rgba(8, 10, 16, 0.6)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '1.25rem', padding: '2rem', maxWidth: '650px', margin: '0 auto' }}>
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#fff' }}>Review submitted for moderation</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0.5rem 0 1rem' }}>It will appear publicly after approval.</p>
            <button onClick={() => setSubmitted(false)} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>Write Another Review</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 'bold', color: '#fff', textAlign: 'center' }}>Submit VaultLedger Usage Review</h3>
            {errorMsg && <div style={{ color: '#f87171', fontSize: '0.85rem', textAlign: 'center' }}>{errorMsg}</div>}
            <input required maxLength={100} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your Name" />
            <input maxLength={100} value={form.profession} onChange={(e) => setForm({ ...form, profession: e.target.value })} placeholder="Role / Profession" />
            <div style={{ display: 'flex', gap: '0.5rem' }}>{[1,2,3,4,5].map((star) => <button type="button" key={star} onClick={() => setForm({ ...form, rating: star })} style={{ background: 'none', border: 'none', fontSize: '1.25rem', color: star <= form.rating ? '#fbbf24' : '#475569' }}>★</button>)}</div>
            <textarea required rows={3} maxLength={1000} value={form.feedback} onChange={(e) => setForm({ ...form, feedback: e.target.value })} placeholder="How was your experience?" />
            <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit Review'}</button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
