'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import SiteNav from '../../../components/SiteNav';

function Body() {
  const q = useSearchParams();
  return (
    <main className="mx-auto max-w-md px-6 pt-36 text-center">
      <h1 className="font-serif-d text-5xl">Thank you ✓</h1>
      <p className="mt-4 opacity-70">
        {q.get('pending')
          ? 'Order received and pending payment.'
          : 'Order confirmed and paid (demo mode).'}
      </p>
      {q.get('id') && <p className="mt-2 text-sm opacity-60">Order ID: {q.get('id')}</p>}
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
