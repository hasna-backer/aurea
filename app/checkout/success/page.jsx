'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import SiteNav from '../../../components/SiteNav';
import { api } from '../../../lib/api';

function Body() {
  const q = useSearchParams();
  const id = q.get('id');
  const [state, setState] = useState({ loading: Boolean(id), order: null });

  useEffect(() => {
    if (!id) return;
    api(`/api/orders/${id}`)
      .then((d) => setState({ loading: false, order: d.order }))
      .catch(() => setState({ loading: false, order: null }));
  }, [id]);

  if (!id)
    return (
      <main className="mx-auto max-w-md px-6 pt-36 text-center">
        <h1 className="font-serif-d text-5xl">No order here</h1>
        <p className="mt-4 opacity-70">This page only appears right after checkout.</p>
        <div className="mt-8">
          <Link href="/shop" className="bg-[#2e2e24] px-6 py-3 text-sm text-[#f5f0e8]">Shop the trio</Link>
        </div>
      </main>
    );

  if (state.loading)
    return (
      <main className="mx-auto max-w-md px-6 pt-36 text-center">
        <p className="opacity-60">Confirming your order…</p>
      </main>
    );

  if (!state.order)
    return (
      <main className="mx-auto max-w-md px-6 pt-36 text-center">
        <h1 className="font-serif-d text-5xl">Order not found</h1>
        <p className="mt-4 opacity-70">It may belong to a different account, or the link is wrong.</p>
        <div className="mt-8">
          <Link href="/account" className="bg-[#2e2e24] px-6 py-3 text-sm text-[#f5f0e8]">View your orders</Link>
        </div>
      </main>
    );

  const o = state.order;
  return (
    <main className="mx-auto max-w-md px-6 pt-36 text-center">
      <h1 className="font-serif-d text-5xl">Thank you ✓</h1>
      <p className="mt-4 opacity-70">
        {o.status === 'pending'
          ? 'Order received and pending payment.'
          : `Order confirmed — $${o.total} · ${o.status}.`}
      </p>
      <p className="mt-2 text-sm opacity-60">Order ID: {o._id}</p>
      <div className="mt-8 flex gap-3 justify-center">
        <Link href="/account" className="bg-[#2e2e24] px-6 py-3 text-sm text-[#f5f0e8]">View orders</Link>
        <Link href="/shop" className="border border-[#2e2e24]/25 px-6 py-3 text-sm">Keep shopping</Link>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen">
      <SiteNav />
      <Suspense><Body /></Suspense>
    </div>
  );
}
