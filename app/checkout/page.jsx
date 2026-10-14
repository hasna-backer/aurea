'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SiteNav from '../../components/SiteNav';
import { api } from '../../lib/api';
import { useShop } from '../../lib/store';

export default function CheckoutPage() {
  const { user, cart, refreshCart } = useShop();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', name: '', line1: '', city: '', state: '', zip: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function set(k, v) {
    setForm({ ...form, [k]: v });
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { order, clientSecret, stripe } = await api('/api/orders/checkout', {
        method: 'POST',
        body: { email: form.email, shippingAddress: form },
      });
      await refreshCart();
      if (stripe && clientSecret) {
        // Phase 2: confirm with Stripe Elements (needs NEXT_PUBLIC_STRIPE_PK).
        // Dev build has no card UI yet — order stays pending until confirmed.
        setError('Card payment is not configured in this demo build (no Stripe key). Order is pending.');
        router.push(`/checkout/success?id=${order._id}&pending=1`);
        return;
      }
      router.push(`/checkout/success?id=${order._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (!user)
    return (
      <div className="min-h-screen">
        <SiteNav />
        <p className="mx-auto max-w-md px-6 pt-36">Please <a href="/login" className="underline">log in</a> to check out.</p>
      </div>
    );

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-2xl px-6 pt-32">
        <h1 className="font-serif-d text-5xl">Checkout</h1>
        <p className="mt-2 text-sm opacity-60">Demo build — no real charge (Stripe key unset).</p>
        <form onSubmit={submit} className="mt-8 space-y-3">
          <input required type="email" placeholder="Email" value={form.email} onChange={(e) => set('email', e.target.value)} className="w-full border border-[#2e2e24]/25 bg-transparent px-4 py-3 text-sm" />
          <input required placeholder="Full name" value={form.name} onChange={(e) => set('name', e.target.value)} className="w-full border border-[#2e2e24]/25 bg-transparent px-4 py-3 text-sm" />
          <input required placeholder="Street address" value={form.line1} onChange={(e) => set('line1', e.target.value)} className="w-full border border-[#2e2e24]/25 bg-transparent px-4 py-3 text-sm" />
          <div className="grid grid-cols-3 gap-3">
            <input required placeholder="City" value={form.city} onChange={(e) => set('city', e.target.value)} className="border border-[#2e2e24]/25 bg-transparent px-4 py-3 text-sm" />
            <input placeholder="State" value={form.state} onChange={(e) => set('state', e.target.value)} className="border border-[#2e2e24]/25 bg-transparent px-4 py-3 text-sm" />
            <input required placeholder="ZIP" value={form.zip} onChange={(e) => set('zip', e.target.value)} className="border border-[#2e2e24]/25 bg-transparent px-4 py-3 text-sm" />
          </div>
          {cart.totals && (
            <p className="text-sm">Total to charge: <strong>${cart.totals.total}</strong></p>
          )}
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button disabled={busy} className="w-full bg-[#2e2e24] py-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#f5f0e8] disabled:opacity-50">
            {busy ? 'Placing order…' : 'Place order'}
          </button>
        </form>
      </main>
    </div>
  );
}
