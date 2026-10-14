'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SiteNav from '../../components/SiteNav';
import { api } from '../../lib/api';
import { useShop } from '../../lib/store';

const inputCls = 'border border-[#2e2e24]/25 bg-transparent px-4 py-2.5 text-sm focus:border-[#2e2e24] focus:outline-none';

export default function AccountPage() {
  const { user, ready, setUser } = useShop();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [subs, setSubs] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [name, setName] = useState('');
  const [addr, setAddr] = useState({ label: 'Home', name: '', line1: '', city: '', zip: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (ready && !user) router.push('/login');
    if (user) {
      setName(user.name);
      api('/api/orders').then((d) => setOrders(d.orders)).catch(() => {});
      api('/api/subscriptions').then((d) => setSubs(d.subscriptions)).catch(() => {});
      api('/api/auth/me').then((d) => setWishlist(d.user?.wishlist || [])).catch(() => {});
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

  async function toggleWish(id) {
    try {
      const { wishlisted } = await api(`/api/auth/wishlist/${id}`, { method: 'POST' });
      setWishlist(wishlisted ? [...wishlist] : wishlist.filter((w) => (w._id || w) !== id));
      const { user: me } = await api('/api/auth/me');
      setWishlist(me?.wishlist || []);
    } catch (err) {
      setMsg(err.message);
    }
  }

  async function addAddress(e) {
    e.preventDefault();
    try {
      const { user: me } = await api('/api/auth/addresses', { method: 'POST', body: addr });
      setUser(me);
      setAddr({ label: 'Home', name: '', line1: '', city: '', zip: '' });
      setMsg('Address saved ✓');
    } catch (err) {
      setMsg(err.message);
    }
  }

  async function removeAddress(id) {
    try {
      const { addresses } = await api(`/api/auth/addresses/${id}`, { method: 'DELETE' });
      setUser({ ...user, addresses });
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
            <div className="flex-1">
              <label htmlFor="ac-name" className="sr-only">Display name</label>
              <input id="ac-name" value={name} onChange={(e) => setName(e.target.value)} className={`w-full ${inputCls}`} />
            </div>
            <button className="border border-[#2e2e24] px-5 py-2.5 text-sm">Save</button>
          </form>
          {msg && <p className="mt-2 text-sm">{msg}</p>}
        </div>

        <section>
          <h2 className="font-serif-d text-3xl">Orders</h2>
          <p className="mt-1 text-sm opacity-60">Select an order to see quantities, prices and tracking.</p>
          <OrderList orders={orders} />
        </section>

        <section>
          <h2 className="font-serif-d text-3xl">Wishlist</h2>
          {wishlist.length === 0 ? (
            <p className="mt-3 text-sm opacity-60">Empty. Tap ♡ on any product page (coming to product cards soon).</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {wishlist.map((w) => {
                const id = w._id || w;
                return (
                  <li key={id} className="flex items-center justify-between gap-3 rounded-2xl border border-[#e3d9c4] bg-white/60 p-4 text-sm">
                    <Link href={`/product/${w.slug || ''}`} className="font-serif-d text-xl hover:underline">
                      {w.name || 'Product'}
                    </Link>
                    <button onClick={() => toggleWish(id)} className="underline opacity-60">Remove</button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section>
          <h2 className="font-serif-d text-3xl">Address book</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {(user.addresses || []).map((a) => (
              <li key={a._id} className="flex items-center justify-between gap-3 rounded-xl border border-[#e3d9c4] bg-white/60 p-3">
                <span><strong>{a.label}</strong> — {a.name}, {a.line1}, {a.city} {a.zip}</span>
                <button onClick={() => removeAddress(a._id)} className="underline opacity-60">Remove</button>
              </li>
            ))}
            {(user.addresses || []).length === 0 && <p className="opacity-60">No saved addresses.</p>}
          </ul>
          <form onSubmit={addAddress} className="mt-4 grid grid-cols-2 gap-2">
            {[
              ['label', 'Label (Home)'], ['name', 'Full name'], ['line1', 'Street'], ['city', 'City'], ['zip', 'ZIP'],
            ].map(([k, ph]) => (
              <div key={k}>
                <label htmlFor={`ac-addr-${k}`} className="sr-only">{ph}</label>
                <input
                  id={`ac-addr-${k}`}
                  required={['line1', 'city', 'zip'].includes(k)}
                  placeholder={ph}
                  value={addr[k]}
                  onChange={(e) => setAddr({ ...addr, [k]: e.target.value })}
                  className={`w-full ${inputCls}`}
                />
              </div>
            ))}
            <button className="col-span-2 border border-[#2e2e24] py-2.5 text-sm">Add address</button>
          </form>
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

const STATUS_DOT = {
  paid: 'bg-emerald-600',
  fulfilled: 'bg-teal-600',
  shipped: 'bg-sky-700',
  delivered: 'bg-[#2e2e24]',
  pending: 'bg-amber-500',
  cancelled: 'bg-stone-400',
  refunded: 'bg-red-700',
};

function Thumb({ item, size = 44 }) {
  if (item.image)
    return (
      <Image
        src={item.image}
        alt={item.name}
        width={size}
        height={size}
        className="rounded-full border border-[#e3d9c4] bg-white object-cover"
        style={{ width: size, height: size }}
      />
    );
  return (
    <span
      className="flex items-center justify-center rounded-full border border-[#e3d9c4] bg-gradient-to-br from-white to-[#e9dfc8] font-serif-d italic"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      A.
    </span>
  );
}

function OrderList({ orders }) {
  const [openId, setOpenId] = useState(null);
  if (orders.length === 0) return <p className="mt-3 opacity-60">No orders yet.</p>;
  return (
    <ul className="mt-4 space-y-3">
      {orders.map((o) => {
        const open = openId === o._id;
        const date = new Date(o.createdAt).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        return (
          <li key={o._id} className="overflow-hidden rounded-2xl border border-[#e3d9c4] bg-white/60 text-sm">
            <button
              onClick={() => setOpenId(open ? null : o._id)}
              className="flex w-full items-center gap-4 p-4 text-left"
              aria-expanded={open}
            >
              <span className="flex -space-x-3">
                {o.items.slice(0, 4).map((i, idx) => (
                  <Thumb key={idx} item={i} />
                ))}
                {o.items.length > 4 && (
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#e3d9c4] bg-[#f5f0e8] text-xs font-semibold">
                    +{o.items.length - 4}
                  </span>
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-mono text-xs opacity-50">#{o._id.slice(-8)} · {date}</span>
                <span className="mt-1 flex items-center gap-2 font-medium capitalize">
                  <span className={`inline-block h-2 w-2 rounded-full ${STATUS_DOT[o.status] || 'bg-stone-400'}`} />
                  {o.status}
                </span>
              </span>
              <span className="font-serif-d text-2xl">${o.total}</span>
              <span className={`transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
            </button>
            {open && (
              <div className="border-t border-[#e3d9c4] p-4">
                <ul className="space-y-3">
                  {o.items.map((i, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <Thumb item={i} size={40} />
                      <span className="flex-1">{i.name}</span>
                      <span className="opacity-60">× {i.qty}</span>
                      <span className="w-20 text-right font-medium">${i.price * i.qty}</span>
                    </li>
                  ))}
                </ul>
                <dl className="mt-4 space-y-1 border-t border-[#e3d9c4] pt-3 text-[13px]">
                  <div className="flex justify-between"><dt className="opacity-60">Subtotal</dt><dd>${o.subtotal}</dd></div>
                  <div className="flex justify-between"><dt className="opacity-60">Discount{o.couponCode ? ` (${o.couponCode})` : ''}</dt><dd>−${o.discount}</dd></div>
                  <div className="flex justify-between"><dt className="opacity-60">Shipping</dt><dd>${o.shipping}</dd></div>
                  <div className="flex justify-between font-semibold"><dt>Total</dt><dd>${o.total}</dd></div>
                </dl>
                <div className="mt-3 grid gap-1 text-[13px] opacity-70 sm:grid-cols-2">
                  <p>
                    Ship to: {o.shippingAddress?.name}, {o.shippingAddress?.line1},{' '}
                    {o.shippingAddress?.city} {o.shippingAddress?.zip}
                  </p>
                  <p className="sm:text-right">
                    {o.trackingNumber ? `Tracking: ${o.trackingNumber}` : 'Tracking: —'}
                    {o.paidAt ? ` · Paid ${new Date(o.paidAt).toLocaleDateString()}` : ''}
                  </p>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
