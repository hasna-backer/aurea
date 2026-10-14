'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SiteNav from '../../components/SiteNav';
import { useShop } from '../../lib/store';

export default function SignupPage() {
  const { signup } = useShop();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await signup(name.trim(), email.trim(), password);
      router.push('/account');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-md px-6 pt-36">
        <p className="eyebrow text-[#b89b5e]">Three steps, four minutes</p>
        <h1 className="font-serif-d mt-3 text-5xl">Create account</h1>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <input
            required
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-[#2e2e24]/25 bg-transparent px-4 py-3 text-sm focus:border-[#2e2e24] focus:outline-none"
          />
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-[#2e2e24]/25 bg-transparent px-4 py-3 text-sm focus:border-[#2e2e24] focus:outline-none"
          />
          <input
            type="password"
            required
            minLength={8}
            placeholder="Password (8+ chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-[#2e2e24]/25 bg-transparent px-4 py-3 text-sm focus:border-[#2e2e24] focus:outline-none"
          />
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button
            disabled={busy}
            className="w-full bg-[#2e2e24] py-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#f5f0e8] disabled:opacity-50"
          >
            {busy ? 'Creating…' : 'Sign up'}
          </button>
        </form>
        <p className="mt-6 text-sm opacity-70">
          Have an account? <Link href="/login" className="underline">Log in</Link>
        </p>
      </main>
    </div>
  );
}
