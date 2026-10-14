'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SiteNav from '../../components/SiteNav';
import { api } from '../../lib/api';
import { useShop } from '../../lib/store';

export default function AccountPage() {
  const { user, ready, setUser } = useShop();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [subs, setSubs] = useState([]);
  const [name, setName] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (ready && !user) router.push('/login');
    if (user) {
      setName(user.name);
      api('/api/orders').then((d) => setOrders(d.orders)).catch(() => {});
      api('/api/subscriptions').then((d) => setSubs(d.subscriptions)).catch(() => {});
    }
  }, [ready, user, router]);

  async function saveName(e) {
    e.preventDefault();
    try {
      const { user: me } = await api('/api/auth/profile', { method: 'PUT', body: { name } });
      setUser(me);
      setMsg('Saved ✓');
    } catch (err) {
      setMsg(err.message);
    }
  }

  async function updateSub(id, body) {
    try {
      const { subscription } = await api(`/api/subscriptions/${id}`, { method: 'PUT', body });
      setSubs(subs.map((s) => (s._id === id ? subscription : s)));
    } catch (err) {
      setMsg(err.message);
    }
  }

  if (!user) return <div className="min-h-screen"><SiteNav /><p className="px-6 pt-36">Loading…</p></div>;

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-4xl space-y-12 px-6 py-32">
        <div>
          <p className="eyebrow text-[#b89b5e]">Account</p>
          <h1 className="font-serif-d mt-3 text-5xl">Hi, {user.name}</h1>
          <form onSubmit={saveName} className="mt-4 flex max-w-md gap-3">
            <input value={name} onChange={(e) => setName(e.target.value)} className="flex-1 border border-[#2e2e24]/25 bg-transparent px-4 py-2.5 text-sm" />
            <button className="border border-[#2e2e24] px-5 py-2.5 text-sm">Save</button>
          </form>
          {msg && <p className="mt-2 text-sm">{msg}</p>}
        </div>

        <section>
          <h2 className="font-serif-d text-3xl">Orders</h2>
          <ul className="mt-4 space-y-3">
            {orders.map((o) => (
              <li key={o._id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#e3d9c4] bg-white/60 p-4 text-sm">
                <span className="font-mono text-xs opacity-60">{o._id.slice(-8)}</span>
                <span>{o.items.map((i) => `${i.name} ×${i.qty}`).join(', ')}</span>
                <span className="font-semibold">${o.total} · {o.status}</span>
              </li>
            ))}
            {orders.length === 0 && <p className="opacity-60">No orders yet.</p>}
          </ul>
        </section>

        <section>
          <h2 className="font-serif-d text-3xl">Subscriptions</h2>
          <ul className="mt-4 space-y-3">
            {subs.map((s) => (
              <li key={s._id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#e3d9c4] bg-white/60 p-4 text-sm">
                <span>{s.items.map((i) => i.product?.name || '').join(', ')} · {s.cadence} · <strong>{s.status}</strong></span>
                <span className="flex gap-2">
                  <button onClick={() => updateSub(s._id, { status: s.status === 'paused' ? 'active' : 'paused' })} className="underline">
                    {s.status === 'paused' ? 'Resume' : 'Pause'}
                  </button>
                  <button onClick={() => updateSub(s._id, { skip: true })} className="underline">Skip next</button>
                  <button onClick={() => updateSub(s._id, { status: 'cancelled' })} className="underline">Cancel</button>
                </span>
              </li>
            ))}
            {subs.length === 0 && <p className="opacity-60">No subscriptions. Build one from any product routine.</p>}
          </ul>
        </section>
      </main>
    </div>
  );
}
