'use client';

import { useState } from 'react';
import SiteNav from '../../components/SiteNav';
import { api } from '../../lib/api';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', topic: 'General', message: '' });
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      await api('/api/contact', { method: 'POST', body: form });
      setDone(true);
    } catch (err) {
      setError(err.message);
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
              <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border border-[#2e2e24]/25 bg-transparent px-4 py-3 text-sm" />
              <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="border border-[#2e2e24]/25 bg-transparent px-4 py-3 text-sm" />
            </div>
            <select value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} className="w-full border border-[#2e2e24]/25 bg-transparent px-4 py-3 text-sm">
              {['General', 'Orders', 'Routine help', 'Press'].map((t) => <option key={t}>{t}</option>)}
            </select>
            <textarea required rows={5} placeholder="How can we help?" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full border border-[#2e2e24]/25 bg-transparent px-4 py-3 text-sm" />
            {error && <p className="text-sm text-red-700">{error}</p>}
            <button className="w-full bg-[#2e2e24] py-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#f5f0e8]">Send message</button>
          </form>
        )}
      </main>
    </div>
  );
}
