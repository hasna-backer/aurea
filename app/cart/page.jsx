'use client';

import { useState } from 'react';
import Link from 'next/link';
import SiteNav from '../../components/SiteNav';
import { useShop } from '../../lib/store';

export default function CartPage() {
  const { user, cart, setQty, removeItem, applyCoupon } = useShop();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  async function apply(e) {
    e.preventDefault();
    setError('');
    try {
      await applyCoupon(code.trim());
      setCode('');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-4xl px-6 pt-32">
        <h1 className="font-serif-d text-5xl">Cart</h1>
        {!user && cart.items.length > 0 && (
          <p className="mt-3 text-sm opacity-70">
            Browsing as guest — <Link href="/login" className="underline">log in</Link> to sync + check out.
          </p>
        )}
        {cart.items.length === 0 ? (
          <p className="mt-8 opacity-70">Empty. <Link href="/shop" className="underline">Shop the trio</Link></p>
        ) : (
          <>
            <ul className="mt-8 space-y-4">
              {cart.items.map((i) => (
                <li key={i.slug || i.productId} className="flex items-center justify-between rounded-2xl border border-[#e3d9c4] bg-white/60 p-5">
                  <div>
                    <div className="font-serif-d text-2xl">{i.name || i.slug}</div>
                    <div className="text-sm opacity-60">${i.price} each</div>
                  </div>
                  <div className="flex items-center gap-3">
                    {user ? (
                      <>
                        <input
                          type="number"
                          min={0}
                          max={99}
                          value={i.qty}
                          onChange={(e) => setQty(i.productId, Number(e.target.value))}
                          className="w-16 border border-[#2e2e24]/25 bg-transparent px-2 py-2 text-center"
                        />
                        <button onClick={() => removeItem(i.productId)} className="text-sm underline opacity-60">Remove</button>
                      </>
                    ) : (
                      <span className="text-sm">× {i.qty} (login to edit)</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            {user && (
              <form onSubmit={apply} className="mt-6 flex gap-3">
                <div className="flex-1">
                  <label htmlFor="cart-coupon" className="sr-only">Coupon code</label>
                  <input id="cart-coupon" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Coupon (try WELCOME10)" className="w-full border border-[#2e2e24]/25 bg-transparent px-4 py-3 text-sm" />
                </div>
                <button className="border border-[#2e2e24] px-6 py-3 text-sm">Apply</button>
              </form>
            )}
            {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
            {cart.totals && (
              <dl className="mt-6 space-y-1 text-sm">
                <div className="flex justify-between"><dt>Subtotal</dt><dd>${cart.totals.subtotal}</dd></div>
                <div className="flex justify-between"><dt>Discount</dt><dd>−${cart.totals.discount}</dd></div>
                <div className="flex justify-between"><dt>Shipping</dt><dd>${cart.totals.shipping}</dd></div>
                <div className="flex justify-between font-semibold"><dt>Total</dt><dd>${cart.totals.total}</dd></div>
              </dl>
            )}
            <Link href="/checkout" className="mt-6 block bg-[#2e2e24] py-4 text-center text-sm font-semibold uppercase tracking-[0.18em] text-[#f5f0e8]">
              Checkout
            </Link>
          </>
        )}
      </main>
    </div>
  );
}
