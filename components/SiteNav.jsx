'use client';

import Link from 'next/link';
import { useShop } from '../lib/store';

export default function SiteNav() {
  const { user, logout, cartCount } = useShop();
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#e3d9c4] bg-[#f5f0e8]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-serif-d text-3xl tracking-tight">
          Aurea
        </Link>
        <nav className="flex items-center gap-5 text-[13px] font-medium uppercase tracking-[0.14em]">
          <Link href="/shop" className="hidden opacity-70 hover:opacity-100 sm:block">
            Shop
          </Link>
          <Link href="/quiz" className="hidden opacity-70 hover:opacity-100 sm:block">
            Quiz
          </Link>
          <Link href="/contact" className="hidden opacity-70 hover:opacity-100 sm:block">
            Contact
          </Link>
          <Link href="/cart" className="opacity-70 hover:opacity-100">
            Cart ({cartCount})
          </Link>
          {user ? (
            <>
              <Link
                href={user.role === 'admin' ? '/admin' : '/account'}
                className="opacity-70 hover:opacity-100"
              >
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
      </div>
    </header>
  );
}
