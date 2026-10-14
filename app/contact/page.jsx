'use client';

import { useState } from 'react';
import SiteNav from '../../components/SiteNav';
import { api } from '../../lib/api';

const inputCls = 'w-full border border-[#2e2e24]/25 bg-transparent px-4 py-3 text-sm focus:border-[#2e2e24] focus:outline-none';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', topic: 'General', message: '' });
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await api('/api/contact', { method: 'POST', body: form });
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-xl px-6 pt-32">
        <p className="eyebrow text-[#b89b5e]">We reply within a day</p>
        <h1 className="font-serif-d mt-3 text-5xl">Contact</h1>
        {done ? (
          <p className="mt-8 rounded-2xl border border-[#e3d9c4] bg-white/60 p-6">Thanks ✓ — your message is saved. (Demo: no email is actually sent.)</p>
        ) : (
          <form onSubmit={submit} className="mt-8 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="ct-name" className="sr-only">Name</label>
                <input id="ct-name" required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label htmlFor="ct-email" className="sr-only">Email</label>
                <input id="ct-email" required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
              </div>
            </div>
            <div>
              <label htmlFor="ct-topic" className="sr-only">Topic</label>
              <select id="ct-topic" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} className={inputCls}>
                {['General', 'Orders', 'Routine help', 'Press'].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="ct-msg" className="sr-only">Message</label>
              <textarea id="ct-msg" required rows={5} placeholder="How can we help?" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={inputCls} />
            </div>
            {error && <p className="text-sm text-red-700">{error}</p>}
            <button disabled={busy} className="w-full bg-[#2e2e24] py-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#f5f0e8] disabled:opacity-50">
              {busy ? 'Sending…' : 'Send message'}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
