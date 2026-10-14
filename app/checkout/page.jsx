'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import SiteNav from '../../components/SiteNav';
import { api } from '../../lib/api';
import { useShop } from '../../lib/store';

const inputCls = 'w-full border border-[#2e2e24]/25 bg-transparent px-4 py-3 text-sm focus:border-[#2e2e24] focus:outline-none';

export default function CheckoutPage() {
  const { user, cart, refreshCart } = useShop();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', line1: '', city: '', state: '', zip: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  // Stable idempotency key per page mount: network retries reuse it, so a
  // retry can never create a second order.
  const idemKey = useRef(
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `web-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );

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
        body: { shippingAddress: form },
        headers: { 'X-Idempotency-Key': idemKey.current },
      });
      await refreshCart();
      if (stripe && clientSecret) {
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
        <p className="mt-2 text-sm opacity-60">
          Demo build — no real charge (Stripe key unset). Receipt goes to <strong>{user.email}</strong>.
        </p>
        <form onSubmit={submit} className="mt-8 space-y-3">
          <div>
            <label htmlFor="co-name" className="sr-only">Full name</label>
            <input id="co-name" required placeholder="Full name" value={form.name} onChange={(e) => set('name', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label htmlFor="co-line1" className="sr-only">Street address</label>
            <input id="co-line1" required placeholder="Street address" value={form.line1} onChange={(e) => set('line1', e.target.value)} className={inputCls} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="co-city" className="sr-only">City</label>
              <input id="co-city" required placeholder="City" value={form.city} onChange={(e) => set('city', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label htmlFor="co-state" className="sr-only">State</label>
              <input id="co-state" placeholder="State" value={form.state} onChange={(e) => set('state', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label htmlFor="co-zip" className="sr-only">ZIP code</label>
              <input id="co-zip" required placeholder="ZIP" value={form.zip} onChange={(e) => set('zip', e.target.value)} className={inputCls} />
            </div>
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
