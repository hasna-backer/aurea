'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SiteNav from '../../components/SiteNav';
import { api } from '../../lib/api';
import { useShop } from '../../lib/store';

const TABS = ['Stats', 'Orders', 'Products', 'Reviews', 'Messages', 'Coupons'];

export default function AdminPage() {
  const { user, ready } = useShop();
  const router = useRouter();
  const [tab, setTab] = useState('Stats');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', price: '', stock: '', slug: '' });

  useEffect(() => {
    if (ready && (!user || user.role !== 'admin')) router.push('/login');
  }, [ready, user, router]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    setError('');
    const loaders = {
      Stats: () => api('/api/admin/stats'),
      Orders: () => api('/api/orders/admin/all'),
      Products: () => api('/api/products?all=1'),
      Reviews: () => api('/api/reviews/admin/all'),
      Messages: () => api('/api/contact'),
      Coupons: () => api('/api/coupons'),
    };
    loaders[tab]().then(setData).catch((e) => setError(e.message));
  }, [tab, user]);

  async function setOrder(id, body) {
    try {
      await api(`/api/orders/admin/${id}`, { method: 'PUT', body });
      setData({ orders: data.orders.map((o) => (o._id === id ? { ...o, ...body } : o)) });
    } catch (e) {
      setError(e.message);
    }
  }

  async function setReview(id, status) {
    try {
      await api(`/api/reviews/admin/${id}`, { method: 'PUT', body: { status } });
      setData({ reviews: data.reviews.map((r) => (r._id === id ? { ...r, status } : r)) });
    } catch (e) {
      setError(e.message);
    }
  }

  async function saveProduct(e) {
    e.preventDefault();
    setError('');
    try {
      await api('/api/products', {
        method: 'POST',
        body: {
          slug: form.slug.toLowerCase().trim(),
          name: form.name,
          price: Number(form.price),
          stock: Number(form.stock),
          description: 'New product (edit me)',
          published: true,
        },
      });
      setForm({ name: '', price: '', stock: '', slug: '' });
      setData(await api('/api/products?all=1'));
    } catch (err) {
      setError(err.message);
    }
  }

  async function togglePublish(p) {
    try {
      const { product } = await api(`/api/products/${p._id}`, {
        method: 'PUT',
        body: { published: !p.published },
      });
      setData({ products: data.products.map((x) => (x._id === p._id ? product : x)) });
    } catch (e) {
      setError(e.message);
    }
  }

  async function createCoupon(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await api('/api/coupons', {
        method: 'POST',
        body: { code: fd.get('code'), type: fd.get('type'), value: Number(fd.get('value')) },
      });
      setData(await api('/api/coupons'));
      e.target.reset();
    } catch (err) {
      setError(err.message);
    }
  }

  if (!user || user.role !== 'admin')
    return <div className="min-h-screen"><SiteNav /><p className="px-6 pt-36">Checking access…</p></div>;

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-6 py-32">
        <p className="eyebrow text-[#b89b5e]">Admin</p>
        <h1 className="font-serif-d mt-3 text-5xl">Dashboard</h1>
        <div className="mt-6 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setData(null); }}
              className={`rounded-full px-5 py-2 text-sm ${tab === t ? 'bg-[#2e2e24] text-[#f5f0e8]' : 'border border-[#2e2e24]/25'}`}
            >
              {t}
            </button>
          ))}
        </div>
        {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
        {!data && !error && <p className="mt-8 opacity-60">Loading {tab}…</p>}

        {tab === 'Stats' && data?.stats && (
          <div className="mt-8">
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[#e3d9c4] bg-[#e3d9c4] md:grid-cols-4">
              {[
                [`$${data.stats.revenue}`, 'revenue'],
                [data.stats.paidOrders, 'paid orders'],
                [data.stats.customers, 'customers'],
                [data.stats.lowStock, 'low stock'],
              ].map(([a, b]) => (
                <div key={b} className="bg-[#f5f0e8] p-6 text-center">
                  <div className="font-serif-d text-4xl">{a}</div>
                  <div className="eyebrow mt-1 opacity-50">{b}</div>
                </div>
              ))}
            </div>
            <h3 className="font-serif-d mt-8 text-2xl">Recent orders</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {data.recentOrders.map((o) => (
                <li key={o._id} className="flex justify-between rounded-xl border border-[#e3d9c4] bg-white/60 p-3">
                  <span className="font-mono text-xs">{o._id.slice(-8)} · {o.email}</span>
                  <span>${o.total} · {o.status}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === 'Orders' && data?.orders && (
          <ul className="mt-8 space-y-3 text-sm">
            {data.orders.map((o) => (
              <li key={o._id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e3d9c4] bg-white/60 p-4">
                <span><span className="font-mono text-xs">{o._id.slice(-8)}</span> · {o.email} · ${o.total}</span>
                <span className="flex gap-2">
                  <select value={o.status} onChange={(e) => setOrder(o._id, { status: e.target.value })} className="border border-[#2e2e24]/25 bg-transparent px-2 py-1">
                    {['pending', 'paid', 'fulfilled', 'shipped', 'delivered', 'cancelled', 'refunded'].map((s) => <option key={s}>{s}</option>)}
                  </select>
                </span>
              </li>
            ))}
          </ul>
        )}

        {tab === 'Products' && data?.products && (
          <div className="mt-8">
            <form onSubmit={saveProduct} className="flex flex-wrap gap-2">
              <input required placeholder="slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="border border-[#2e2e24]/25 bg-transparent px-3 py-2 text-sm" />
              <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border border-[#2e2e24]/25 bg-transparent px-3 py-2 text-sm" />
              <input required type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-24 border border-[#2e2e24]/25 bg-transparent px-3 py-2 text-sm" />
              <input required type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="w-24 border border-[#2e2e24]/25 bg-transparent px-3 py-2 text-sm" />
              <button className="bg-[#2e2e24] px-5 py-2 text-sm text-[#f5f0e8]">Add</button>
            </form>
            <ul className="mt-4 space-y-2 text-sm">
              {data.products.map((p) => (
                <li key={p._id} className="flex items-center justify-between rounded-xl border border-[#e3d9c4] bg-white/60 p-3">
                  <span>{p.name} · ${p.price} · stock {p.stock} · {p.published ? 'live' : 'hidden'}</span>
                  <button onClick={() => togglePublish(p)} className="underline">{p.published ? 'Hide' : 'Publish'}</button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === 'Reviews' && data?.reviews && (
          <ul className="mt-8 space-y-2 text-sm">
            {data.reviews.map((r) => (
              <li key={r._id} className="flex items-center justify-between gap-3 rounded-xl border border-[#e3d9c4] bg-white/60 p-3">
                <span>★{r.rating} · {r.product?.name} · {r.text.slice(0, 80)} · <strong>{r.status}</strong></span>
                <span className="flex gap-2">
                  {['approved', 'hidden', 'pending'].map((s) => (
                    <button key={s} onClick={() => setReview(r._id, s)} className="underline">{s}</button>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        )}

        {tab === 'Messages' && data?.messages && (
          <ul className="mt-8 space-y-2 text-sm">
            {data.messages.map((m) => (
              <li key={m._id} className="rounded-xl border border-[#e3d9c4] bg-white/60 p-3">
                <strong>{m.name}</strong> · {m.email} · {m.topic} {m.read ? '' : '· NEW'}
                <p className="mt-1 opacity-70">{m.message}</p>
              </li>
            ))}
          </ul>
        )}

        {tab === 'Coupons' && data?.coupons && (
          <div className="mt-8">
            <form onSubmit={createCoupon} className="flex flex-wrap gap-2">
              <input name="code" required placeholder="CODE" className="border border-[#2e2e24]/25 bg-transparent px-3 py-2 text-sm" />
              <select name="type" className="border border-[#2e2e24]/25 bg-transparent px-3 py-2 text-sm">
                <option value="percent">percent</option>
                <option value="fixed">fixed $</option>
              </select>
              <input name="value" required type="number" placeholder="10" className="w-24 border border-[#2e2e24]/25 bg-transparent px-3 py-2 text-sm" />
              <button className="bg-[#2e2e24] px-5 py-2 text-sm text-[#f5f0e8]">Create</button>
            </form>
            <ul className="mt-4 space-y-2 text-sm">
              {data.coupons.map((c) => (
                <li key={c._id} className="rounded-xl border border-[#e3d9c4] bg-white/60 p-3">
                  {c.code} · {c.type} {c.value} · used {c.usedCount}/{c.maxUses || '∞'}
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
