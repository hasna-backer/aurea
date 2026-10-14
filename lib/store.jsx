'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from './api';

const ShopCtx = createContext(null);
const GUEST_KEY = 'aurea_guest_cart';

function readGuest() {
  try {
    return JSON.parse(localStorage.getItem(GUEST_KEY) || '[]');
  } catch {
    return [];
  }
}

export function ShopProvider({ children }) {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState({ items: [], totals: null, couponCode: null });
  const [ready, setReady] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart({ items: readGuest(), totals: null, couponCode: null });
      return;
    }
    try {
      const data = await api('/api/cart');
      setCart({ items: data.items, totals: data.totals, couponCode: data.couponCode });
    } catch {
      setCart({ items: [], totals: null, couponCode: null });
    }
  }, [user]);

  useEffect(() => {
    (async () => {
      try {
        const { user: me } = await api('/api/auth/me');
        setUser(me);
      } catch {
        setUser(null);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const mergeGuest = useCallback(async () => {
    const guest = readGuest();
    if (guest.length === 0) return;
    try {
      const data = await api('/api/cart/merge', { method: 'POST', body: { items: guest } });
      setCart({ items: data.items, totals: data.totals, couponCode: data.couponCode });
    } catch {
      /* keep server cart */
    }
    localStorage.removeItem(GUEST_KEY);
  }, []);

  const login = useCallback(
    async (email, password) => {
      const { user: me } = await api('/api/auth/login', { method: 'POST', body: { email, password } });
      setUser(me);
      await mergeGuest();
      await refreshCart();
      return me;
    },
    [mergeGuest, refreshCart]
  );

  const signup = useCallback(
    async (name, email, password) => {
      const { user: me } = await api('/api/auth/signup', {
        method: 'POST',
        body: { name, email, password },
      });
      setUser(me);
      await mergeGuest();
      await refreshCart();
      return me;
    },
    [mergeGuest, refreshCart]
  );

  const logout = useCallback(async () => {
    await api('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setCart({ items: readGuest(), totals: null, couponCode: null });
  }, []);

  const addToCart = useCallback(
    async (slug, qty = 1) => {
      if (!user) {
        const guest = readGuest();
        const line = guest.find((g) => g.slug === slug);
        if (line) line.qty = Math.min(99, line.qty + qty);
        else guest.push({ slug, qty });
        localStorage.setItem(GUEST_KEY, JSON.stringify(guest));
        setCart({ items: guest, totals: null, couponCode: null });
        return;
      }
      const data = await api('/api/cart/items', { method: 'POST', body: { slug, qty } });
      setCart({ items: data.items, totals: data.totals, couponCode: data.couponCode });
    },
    [user]
  );

  const setQty = useCallback(
    async (productId, qty) => {
      if (!user) return;
      const data = await api(`/api/cart/items/${productId}`, { method: 'PUT', body: { qty } });
      setCart({ items: data.items, totals: data.totals, couponCode: data.couponCode });
    },
    [user]
  );

  const removeItem = useCallback(
    async (productId) => {
      if (!user) {
        const guest = readGuest().filter((g) => g.slug !== productId);
        localStorage.setItem(GUEST_KEY, JSON.stringify(guest));
        setCart({ items: guest, totals: null, couponCode: null });
        return;
      }
      const data = await api(`/api/cart/items/${productId}`, { method: 'DELETE' });
      setCart({ items: data.items, totals: data.totals, couponCode: data.couponCode });
    },
    [user]
  );

  const applyCoupon = useCallback(async (code) => {
    const data = await api('/api/cart/coupon', { method: 'POST', body: { code } });
    setCart({ items: data.items, totals: data.totals, couponCode: data.couponCode });
    return data;
  }, []);

  const value = useMemo(
    () => ({
      user,
      setUser,
      cart,
      ready,
      login,
      signup,
      logout,
      addToCart,
      setQty,
      removeItem,
      applyCoupon,
      refreshCart,
      cartCount: cart.items.reduce((s, i) => s + (i.qty || 0), 0),
    }),
    [user, cart, ready, login, signup, logout, addToCart, setQty, removeItem, applyCoupon, refreshCart]
  );

  return <ShopCtx.Provider value={value}>{children}</ShopCtx.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopCtx);
  if (!ctx) throw new Error('useShop must be used inside ShopProvider');
  return ctx;
}
