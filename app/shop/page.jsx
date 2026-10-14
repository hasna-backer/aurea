'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SiteNav from '../../components/SiteNav';
import { api } from '../../lib/api';
import { useShop } from '../../lib/store';

const FALLBACK = [
  { slug: 'cloud-cleanser', name: 'Cloud Cleanser', tagline: 'Amino + oat · 120ml', price: 34 },
  { slug: 'halo-serum', name: 'Halo Serum', tagline: '15% vitamin C · 30ml', price: 58 },
  { slug: 'dune-moisture', name: 'Dune Moisture', tagline: 'Ceramide + squalane · 50ml', price: 46 },
];

export default function ShopPage() {
  const { addToCart } = useShop();
  const [products, setProducts] = useState(FALLBACK);
  const [added, setAdded] = useState('');

  useEffect(() => {
    api('/api/products')
      .then((d) => d.products.length && setProducts(d.products))
      .catch(() => {});
  }, []);

  async function add(slug) {
    try {
      await addToCart(slug, 1);
      setAdded(slug);
      setTimeout(() => setAdded(''), 1500);
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-6 pt-32">
        <p className="eyebrow text-[#b89b5e]">Shop</p>
        <h1 className="font-serif-d mt-3 text-5xl md:text-6xl">The trio</h1>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {products.map((p) => (
            <article key={p.slug} className="rounded-3xl border border-[#e3d9c4] bg-white/60 p-7">
              <Link href={`/product/${p.slug}`}>
                <div className="flex h-44 items-center justify-center rounded-2xl bg-gradient-to-br from-white to-[#e9dfc8] font-serif-d text-6xl italic opacity-80">
                  A.
                </div>
              </Link>
              <Link href={`/product/${p.slug}`}>
                <h2 className="font-serif-d mt-5 text-3xl hover:underline">{p.name}</h2>
              </Link>
              <p className="text-sm opacity-60">{p.tagline || p.detail}</p>
              {!!p.ratingCount && (
                <p className="mt-1 text-sm opacity-60">★ {p.ratingAvg} ({p.ratingCount})</p>
              )}
              <div className="mt-5 flex items-center justify-between border-t border-[#e3d9c4] pt-5">
                <span className="font-serif-d text-2xl">${p.price}</span>
                <button
                  onClick={() => add(p.slug)}
                  className="rounded-full bg-[#2e2e24] px-5 py-2.5 text-sm text-[#f5f0e8]"
                >
                  {added === p.slug ? 'Added ✓' : 'Add —'}
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
