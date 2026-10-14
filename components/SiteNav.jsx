'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useShop } from '../lib/store';

const LINKS = [
  { href: '/shop', label: 'Shop' },
  { href: '/quiz', label: 'Quiz' },
  { href: '/contact', label: 'Contact' },
];

export default function SiteNav() {
  const { user, logout, cartCount } = useShop();
  const [open, setOpen] = useState(false);
  const accountHref = user?.role === 'admin' ? '/admin' : '/account';

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#e3d9c4] bg-[#f5f0e8]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-serif-d text-3xl tracking-tight">
          Aurea
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-5 text-[13px] font-medium uppercase tracking-[0.14em] sm:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="opacity-70 hover:opacity-100">
              {l.label}
            </Link>
          ))}
          <Link href="/cart" className="opacity-70 hover:opacity-100">
            Cart ({cartCount})
          </Link>
          {user ? (
            <>
              <Link href={accountHref} className="opacity-70 hover:opacity-100">
                {user.role === 'admin' ? 'Admin' : 'Account'}
              </Link>
              <button onClick={logout} className="opacity-70 hover:opacity-100">
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="bg-[#2e2e24] px-4 py-2 text-[#f5f0e8]">
              Login
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-4 sm:hidden">
          <Link href="/cart" className="text-[13px] font-medium uppercase tracking-[0.14em]">
            Cart ({cartCount})
          </Link>
          <button
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="flex h-11 w-11 items-center justify-center border border-[#2e2e24]/25 text-xl"
          >
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>
      {open && (
        <nav aria-label="Mobile" className="border-t border-[#e3d9c4] bg-[#f5f0e8] px-6 py-4 sm:hidden">
          <ul className="space-y-1 text-sm font-medium uppercase tracking-[0.14em]">
            {[...LINKS, { href: accountHref, label: user ? (user.role === 'admin' ? 'Admin' : 'Account') : 'Login' }].map((l) => (
              <li key={l.href + l.label}>
                <Link href={l.href} onClick={() => setOpen(false)} className="block py-3">
                  {l.label}
                </Link>
              </li>
            ))}
            {user && (
              <li>
                <button
                  onClick={() => { logout(); setOpen(false); }}
                  className="block py-3 uppercase tracking-[0.14em]"
                >
                  Logout
                </button>
              </li>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
}
