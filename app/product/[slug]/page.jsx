'use client';

import { useEffect, useState } from 'react';
import SiteNav from '../../../components/SiteNav';
import { api } from '../../../lib/api';
import { useShop } from '../../../lib/store';

export default function ProductPage({ params }) {
  const { slug } = params;
  const { user, addToCart } = useShop();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState('');
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [reviewMsg, setReviewMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/api/products/${slug}`)
      .then((d) => setProduct(d.product))
      .catch((e) => setError(e.message));
  }, [slug]);

  useEffect(() => {
    if (!product) return;
    api(`/api/reviews/product/${product._id}`)
      .then((d) => setReviews(d.reviews))
      .catch(() => {});
  }, [product]);

  async function add() {
    try {
      await addToCart(slug, qty);
      setMsg('Added to cart ✓ — log in at checkout to keep it synced.');
    } catch (e) {
      setMsg(e.message);
    }
  }

  async function submitReview(e) {
    e.preventDefault();
    setError('');
    try {
      await api(`/api/reviews/product/${product._id}`, {
        method: 'POST',
        body: { rating, text },
      });
      setText('');
      setReviewMsg('Thanks ✓ — your review was submitted and will appear after moderation.');
    } catch (e) {
      setError(e.message);
    }
  }

  async function helpful(id) {
    const { helpful: n } = await api(`/api/reviews/${id}/helpful`, { method: 'POST' });
    setReviews(reviews.map((r) => (r._id === id ? { ...r, helpful: n } : r)));
  }

  if (error && !product) return <div className="min-h-screen"><SiteNav /><p className="px-6 pt-36">{error}</p></div>;
  if (!product) return <div className="min-h-screen"><SiteNav /><p className="px-6 pt-36">Loading…</p></div>;

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-6 pt-32">
        <div className="grid gap-12 md:grid-cols-2">
          <div className="flex h-96 items-center justify-center rounded-[2rem] bg-gradient-to-br from-white to-[#e9dfc8] font-serif-d text-8xl italic">
            A.
          </div>
          <div>
            <p className="eyebrow text-[#b89b5e]">{product.tagline}</p>
            <h1 className="font-serif-d mt-3 text-6xl">{product.name}</h1>
            {!!product.ratingCount && <p className="mt-2 opacity-60">★ {product.ratingAvg} · {product.ratingCount} reviews</p>}
            <p className="mt-4 leading-relaxed opacity-80">{product.description}</p>
            <p className="mt-3 text-sm opacity-70"><strong>Use:</strong> {product.howToUse}</p>
            <p className="mt-2 text-sm opacity-70"><strong>Ingredients:</strong> {product.ingredients}</p>
            <div className="font-serif-d mt-5 text-4xl">${product.price}</div>
            <p className="mt-1 text-sm opacity-60">{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</p>
            <div className="mt-5 flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={9}
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                className="w-20 border border-[#2e2e24]/25 bg-transparent px-3 py-3 text-center"
              />
              <button onClick={add} className="bg-[#2e2e24] px-8 py-3.5 text-sm font-medium text-[#f5f0e8]">
                Add to cart
              </button>
            </div>
            {msg && <p className="mt-3 text-sm">{msg}</p>}
          </div>
        </div>

        <section className="py-16">
          <h2 className="font-serif-d text-4xl">Reviews</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {reviews.map((r) => (
              <figure key={r._id} className="rounded-2xl border border-[#e3d9c4] bg-white/60 p-6">
                <div className="text-sm">★ {r.rating} {r.verified && <span className="opacity-60">· verified buyer</span>}</div>
                <blockquote className="font-serif-d mt-2 text-xl italic">{r.text}</blockquote>
                <figcaption className="mt-3 flex items-center justify-between text-sm opacity-60">
                  <span>{r.user?.name || 'Customer'}</span>
                  <button onClick={() => helpful(r._id)} className="underline">Helpful ({r.helpful})</button>
                </figcaption>
              </figure>
            ))}
            {reviews.length === 0 && <p className="opacity-60">No reviews yet — be the first.</p>}
          </div>
          <form onSubmit={submitReview} className="mt-8 max-w-xl space-y-3">
            <h3 className="font-serif-d text-2xl">Write a review {user ? '' : '(login required)'}</h3>
            <div>
              <label htmlFor="rv-rating" className="sr-only">Star rating</label>
              <select id="rv-rating" value={rating} onChange={(e) => setRating(Number(e.target.value))} className="border border-[#2e2e24]/25 bg-transparent px-3 py-2">
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} stars</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="rv-text" className="sr-only">Your review</label>
              <textarea id="rv-text" required value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="How did it work for you?" className="w-full border border-[#2e2e24]/25 bg-transparent px-4 py-3 text-sm" />
            </div>
            {error && <p className="text-sm text-red-700">{error}</p>}
            {reviewMsg && <p className="text-sm">{reviewMsg}</p>}
            <button className="bg-[#2e2e24] px-6 py-3 text-sm text-[#f5f0e8]">Submit review</button>
          </form>
        </section>
      </main>
    </div>
  );
}
