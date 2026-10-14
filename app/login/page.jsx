'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SiteNav from '../../components/SiteNav';
import { useShop } from '../../lib/store';

export default function LoginPage() {
  const { login } = useShop();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const me = await login(email.trim(), password);
      router.push(me.role === 'admin' ? '/admin' : '/account');
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
        <p className="eyebrow text-[#b89b5e]">Welcome back</p>
        <h1 className="font-serif-d mt-3 text-5xl">Login</h1>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="li-email" className="sr-only">Email</label>
            <input
              id="li-email"
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-[#2e2e24]/25 bg-transparent px-4 py-3 text-sm focus:border-[#2e2e24] focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="li-pass" className="sr-only">Password</label>
            <input
              id="li-pass"
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-[#2e2e24]/25 bg-transparent px-4 py-3 text-sm focus:border-[#2e2e24] focus:outline-none"
            />
          </div>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button
            disabled={busy}
            className="w-full bg-[#2e2e24] py-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#f5f0e8] disabled:opacity-50"
          >
            {busy ? 'Logging in…' : 'Login'}
          </button>
        </form>
        <p className="mt-6 text-sm opacity-70">
          No account? <Link href="/signup" className="underline">Sign up</Link>
        </p>
        <p className="mt-2 text-xs opacity-50">Demo admin: admin@aurea.example / Admin123!</p>
      </main>
    </div>
  );
}
