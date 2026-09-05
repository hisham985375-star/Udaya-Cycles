"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { useSession } from "next-auth/react";

export function ProductReviews({ productId }: { productId: string }) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState({ rating: 5, title: "", body: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`);
      const data = await res.json();
      if (res.ok) {
        setReviews(data.reviews || []);
      }
    } catch (e) {
      console.error("Failed to fetch reviews", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      alert("Please log in to leave a review.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, productId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setFormOpen(false);
      setFormData({ rating: 5, title: "", body: "" });
      fetchReviews(); // refresh
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="mt-16 pt-16 border-t border-border">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-display font-bold text-text-primary uppercase tracking-tight">Customer Reviews</h2>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center text-accent">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-5 h-5 ${i < Math.round(Number(averageRating)) ? "fill-current" : "text-border"}`} />
              ))}
            </div>
            <span className="text-text-secondary font-mono">{averageRating} out of 5 ({reviews.length} reviews)</span>
          </div>
        </div>
        {!formOpen && (
          <button 
            onClick={() => setFormOpen(true)}
            className="bg-surface-raised border border-border px-6 py-3 rounded-xl font-bold hover:bg-surface-overlay transition-colors text-sm uppercase tracking-wide"
          >
            Write a Review
          </button>
        )}
      </div>

      {formOpen && (
        <form onSubmit={handleSubmit} className="bg-surface-raised border border-border rounded-2xl p-6 mb-10 space-y-6 animate-fade-in-up">
          <h3 className="font-bold text-text-primary uppercase tracking-wider border-b border-border pb-4">Write your review</h3>
          
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">Rating</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star} 
                  type="button" 
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className={`p-1 transition-colors ${formData.rating >= star ? 'text-accent' : 'text-border hover:text-accent/50'}`}
                >
                  <Star className="w-8 h-8 fill-current" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">Title</label>
            <input 
              required type="text" 
              value={formData.title} 
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-bg border border-border rounded-xl p-3 text-text-primary focus:border-accent outline-none" 
              placeholder="Summarize your thoughts"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">Review</label>
            <textarea 
              required rows={4} 
              value={formData.body} 
              onChange={e => setFormData({ ...formData, body: e.target.value })}
              className="w-full bg-bg border border-border rounded-xl p-3 text-text-primary focus:border-accent outline-none resize-none" 
              placeholder="What did you like or dislike?"
            />
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button 
              type="submit" 
              disabled={submitting}
              className="bg-accent text-bg px-6 py-3 rounded-xl font-bold hover:bg-accent-dim transition-colors uppercase tracking-wide text-sm"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
            <button 
              type="button" 
              onClick={() => setFormOpen(false)}
              className="text-text-muted hover:text-text-primary text-sm font-bold uppercase tracking-wide px-4 py-3"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 skeleton rounded-xl"></div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 text-text-muted border border-dashed border-border rounded-2xl">
          No reviews yet. Be the first to share your thoughts!
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review._id} className="bg-surface rounded-2xl p-6 border border-border flex flex-col md:flex-row gap-6">
              <div className="md:w-1/4 shrink-0">
                <div className="flex items-center gap-1 text-accent mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < review.rating ? "fill-current" : "text-border"}`} />
                  ))}
                </div>
                <div className="font-bold text-text-primary">{review.user?.firstName} {review.user?.lastName}</div>
                <div className="text-xs text-text-muted mt-1">{new Date(review.createdAt).toLocaleDateString()}</div>
                {review.verifiedPurchase && <div className="text-[10px] text-success uppercase tracking-widest font-bold mt-2">Verified Purchase</div>}
              </div>
              <div className="md:w-3/4">
                {review.title && <h4 className="font-bold text-text-primary mb-2">{review.title}</h4>}
                <p className="text-text-secondary whitespace-pre-wrap">{review.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
