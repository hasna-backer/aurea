'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SiteNav from '../../components/SiteNav';
import { api } from '../../lib/api';
import { useShop } from '../../lib/store';

const FALLBACK = [
  { slug: 'cloud-cleanser', name: 'Cloud Cleanser', tagline: 'Amino + oat · 120ml', price: 34 },
  { slug: 'halo-serum', name: 'Halo Serum', tagline: '15% vitamin C · 30ml', price: 58 },
  { slug: 'dune-moisture', name: 'Dune Moisture', tagline: 'Ceramide + squalane · 50ml', price: 46 },
];

function CardImage({ p }) {
  if (p.images?.[0])
    return (
      <span className="relative block h-44 overflow-hidden rounded-2xl">
        <Image src={p.images[0]} alt={p.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 400px" />
      </span>
    );
  return (
    <span className="flex h-44 items-center justify-center rounded-2xl bg-gradient-to-br from-white to-[#e9dfc8] font-serif-d text-6xl italic opacity-80">
      A.
    </span>
  );
}

export default function ShopPage() {
  const { addToCart } = useShop();
  const [products, setProducts] = useState(FALLBACK);
  const [stale, setStale] = useState(false);
  const [added, setAdded] = useState('');
  const [q, setQ] = useState('');
  const [step, setStep] = useState('');

  async function load(query = '', stepFilter = '') {
    try {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (stepFilter) params.set('step', stepFilter);
      const d = await api(`/api/products?${params}`);
      if (d.products.length) {
        setProducts(d.products);
        setStale(false);
      }
    } catch {
      setStale(true); // live catalog unreachable: keep cached list, flag it
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => load(q, step), 350);
    return () => clearTimeout(t);
  }, [q, step]);

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
        <form className="mt-8 flex flex-col gap-3 sm:flex-row" onSubmit={(e) => e.preventDefault()} role="search">
          <div className="flex-1">
            <label htmlFor="shop-search" className="sr-only">Search products</label>
            <input
              id="shop-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products…"
              className="w-full rounded-full border border-[#2e2e24]/25 bg-transparent px-5 py-3 text-sm focus:border-[#2e2e24] focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="shop-step" className="sr-only">Filter by routine step</label>
            <select
              id="shop-step"
              value={step}
              onChange={(e) => setStep(e.target.value)}
              className="w-full rounded-full border border-[#2e2e24]/25 bg-transparent px-5 py-3 text-sm sm:w-auto"
            >
              <option value="">All steps</option>
              <option value="cleanse">Cleanse</option>
              <option value="treat">Treat</option>
              <option value="seal">Seal</option>
            </select>
          </div>
        </form>
        {stale && (
          <p className="mt-4 rounded-2xl border border-amber-500/40 bg-amber-50 p-4 text-sm">
            Live catalog unavailable — showing cached list. Prices may be out of date.
          </p>
        )}
        {products.length === 0 && !stale && <p className="mt-10 opacity-60">No products match.</p>}
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {products.map((p) => (
            <article key={p.slug} className="rounded-3xl border border-[#e3d9c4] bg-white/60 p-7">
              <Link href={`/product/${p.slug}`} aria-label={`View ${p.name}`}>
                <CardImage p={p} />
              </Link>
              <Link href={`/product/${p.slug}`}>
                <h2 className="font-serif-d mt-5 text-3xl hover:underline">{p.name}</h2>
              </Link>
              <p className="text-sm opacity-60">{p.tagline || p.detail}</p>
              {!!p.ratingCount && (
                <p className="mt-1 text-sm opacity-60">★ {p.ratingAvg} ({p.ratingCount})</p>
              )}
              {p.stock === 0 && <p className="mt-1 text-sm font-medium">Out of stock</p>}
              <div className="mt-5 flex items-center justify-between border-t border-[#e3d9c4] pt-5">
                <span className="font-serif-d text-2xl">${p.price}</span>
                <button
                  onClick={() => add(p.slug)}
                  disabled={p.stock === 0}
                  className="rounded-full bg-[#2e2e24] px-5 py-2.5 text-sm text-[#f5f0e8] disabled:opacity-40"
                >
                  {p.stock === 0 ? 'Sold out' : added === p.slug ? 'Added ✓' : 'Add —'}
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
