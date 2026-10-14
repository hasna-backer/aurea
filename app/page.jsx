'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const PRODUCTS = [
  { name: 'Cloud Cleanser', detail: 'Amino + oat · 120ml', price: '$34' },
  { name: 'Halo Serum', detail: '15% vitamin C · 30ml', price: '$58' },
  { name: 'Dune Moisture', detail: 'Ceramide + squalane · 50ml', price: '$46' },
];

export default function Page() {
  const root = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.hero-line', { yPercent: 110 }, { yPercent: 0, duration: 1.15, stagger: 0.1, ease: 'power4.out', delay: 0.15 });
      gsap.fromTo('.hero-fade', { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.1, delay: 0.6, ease: 'power3.out' });
      gsap.fromTo('.hero-card', { y: 40, opacity: 0, rotate: 2 }, { y: 0, opacity: 1, rotate: 0, duration: 1.2, ease: 'power3.out', delay: 0.5 });
      gsap.utils.toArray('.reveal').forEach((el) => {
        gsap.fromTo(el, { y: 32, opacity: 0 }, {
          y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 86%' },
        });
      });
      gsap.to('.float-slow', { y: -12, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className="min-h-screen">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[#e3d9c4] bg-[#f5f0e8]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="#top" className="font-serif-d text-3xl tracking-tight">Aurea</a>
          <nav className="hidden items-center gap-8 text-[13px] font-medium uppercase tracking-[0.18em] md:flex">
            <a href="#ritual" className="opacity-70 hover:opacity-100">Ritual</a>
            <a href="#shop" className="opacity-70 hover:opacity-100">Shop</a>
            <a href="#reviews" className="opacity-70 hover:opacity-100">Reviews</a>
            <a href="/quiz" className="bg-[#2e2e24] px-5 py-2.5 text-[#f5f0e8] hover:opacity-85 transition">Take the quiz</a>
          </nav>
        </div>
      </header>

      <section id="top" className="mx-auto grid max-w-6xl gap-12 px-6 pt-32 md:grid-cols-2 md:items-center md:pt-40">
        <div>
          <p className="hero-fade eyebrow text-[#b89b5e]">Fragrance-free · Vegan · Derm reviewed (fictional)</p>
          <h1 className="font-serif-d mt-6 text-6xl leading-[0.95] tracking-tight md:text-8xl">
            <span className="block overflow-hidden"><span className="hero-line block">Skin,</span></span>
            <span className="block overflow-hidden"><span className="hero-line block italic font-medium">simplified.</span></span>
          </h1>
          <p className="hero-fade mt-6 max-w-md text-[15px] leading-relaxed opacity-70">
            Aurea is a fictional three-step routine — cleanse, treat, seal.
            No 10-step shelf. No fragrance. Just barrier-first formulas with
            published concentrations.
          </p>
          <div className="hero-fade mt-8 flex gap-4">
            <a href="#shop" className="bg-[#2e2e24] px-7 py-3.5 text-sm font-medium text-[#f5f0e8]">Shop the routine — $118</a>
            <a href="#ritual" className="border border-[#2e2e24]/25 px-7 py-3.5 text-sm font-medium">How it works</a>
          </div>
          <div className="hero-fade mt-8 flex items-center gap-4 text-sm opacity-70">
            <div className="flex -space-x-2">
              {['AK', 'JM', 'RS'].map((i) => (
                <span key={i} className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e3d9c4] bg-white text-[11px] font-semibold">{i}</span>
              ))}
            </div>
            <span>4.8 from 3,200 fictional reviews</span>
          </div>
        </div>
        <div className="relative">
          <div className="hero-card relative h-[500px] overflow-hidden rounded-[2.5rem] border border-[#e3d9c4] md:h-[580px]">
            <Image src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1200&auto=format&fit=crop" alt="Minimal skincare bottle" fill priority className="object-cover" sizes="(max-width:768px) 100vw, 560px" />
          </div>
          <div className="float-slow absolute -left-4 top-10 rounded-2xl border border-[#e3d9c4] bg-[#f5f0e8] px-5 py-4 shadow-xl md:-left-10">
            <div className="eyebrow text-[#b89b5e]">Step 02</div>
            <div className="font-serif-d text-2xl">Halo Serum</div>
            <div className="text-sm opacity-60">15% vitamin C, no sting</div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-[#e3d9c4] bg-[#e3d9c4] md:grid-cols-4">
          {[['3', 'steps only'], ['0', 'fragrance'], ['100%', 'vegan'], ['30d', 'returns']].map(([a, b]) => (
            <div key={b} className="reveal bg-[#f5f0e8] px-6 py-8 text-center">
              <div className="font-serif-d text-5xl">{a}</div>
              <div className="eyebrow mt-2 opacity-50">{b}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="ritual" className="mx-auto max-w-6xl px-6 py-16">
        <p className="reveal eyebrow text-[#b89b5e]">The ritual</p>
        <h2 className="reveal font-serif-d mt-4 max-w-2xl text-5xl tracking-tight">Morning to night in four minutes.</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            ['01 — Cleanse', 'Cloud Cleanser lifts sunscreen and city without stripping. Skin stays at pH 5.5.'],
            ['02 — Treat', 'Halo Serum: 3-O-ethyl vitamin C plus niacinamide for tone, no tingling.'],
            ['03 — Seal', 'Dune Moisture locks it in with ceramides and squalane. Makeup-ready in 60s.'],
          ].map(([t, d]) => (
            <div key={t} className="reveal rounded-3xl border border-[#e3d9c4] bg-white/60 p-8">
              <h3 className="font-serif-d text-3xl">{t}</h3>
              <p className="mt-3 text-sm leading-relaxed opacity-70">{d}</p>
            </div>
          ))}
        </div>
        <div className="reveal relative mt-8 h-72 overflow-hidden rounded-3xl">
          <Image src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=1600&auto=format&fit=crop" alt="Cream texture" fill className="object-cover" sizes="100vw" />
        </div>
        <p className="mt-3 text-xs opacity-50">Photography: Unsplash (free to use under the Unsplash License).</p>
      </section>

      <section id="shop" className="border-y border-[#e3d9c4] bg-[#ece4d0]/60">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="reveal flex items-end justify-between">
            <h2 className="font-serif-d text-5xl tracking-tight">Shop the trio</h2>
            <span className="hidden text-sm opacity-50 md:block">Free shipping over $50</span>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {PRODUCTS.map((p) => (
              <article key={p.name} className="reveal pill rounded-3xl border border-[#e3d9c4] bg-[#f5f0e8] p-7">
                <div className="flex h-44 items-center justify-center rounded-2xl bg-gradient-to-br from-white to-[#e9dfc8] font-serif-d text-6xl italic opacity-80">A.</div>
                <h3 className="font-serif-d mt-5 text-3xl">{p.name}</h3>
                <p className="text-sm opacity-60">{p.detail}</p>
                <div className="mt-5 flex items-center justify-between border-t border-[#e3d9c4] pt-5">
                  <span className="font-serif-d text-2xl">{p.price}</span>
                  <button className="rounded-full bg-[#2e2e24] px-5 py-2.5 text-sm text-[#f5f0e8]">Add —</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="reviews" className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="reveal font-serif-d text-5xl tracking-tight">Quiet results.</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            ['“My redness calmed in a week. Nothing stings.”', 'Amara K. — fictional'],
            ['“Finally a routine I actually finish.”', 'June M. — fictional'],
            ['“Dune under makeup is perfect. No pilling.”', 'Rosa S. — fictional'],
          ].map(([q, a]) => (
            <figure key={a} className="reveal rounded-3xl border border-[#e3d9c4] bg-white/60 p-8">
              <blockquote className="font-serif-d text-2xl italic leading-snug">{q}</blockquote>
              <figcaption className="eyebrow mt-5 opacity-50">{a}</figcaption>
            </figure>
          ))}
        </div>
        <div className="reveal relative mt-8 h-64 overflow-hidden rounded-3xl">
          <Image src="https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1600&auto=format&fit=crop" alt="Skincare products" fill className="object-cover" sizes="100vw" />
        </div>
      </section>

      <section id="contact" className="bg-[#2e2e24] text-[#f5f0e8]">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-24 md:grid-cols-2 md:items-center">
          <div className="reveal">
            <p className="eyebrow text-[#d8bd84]">Find your routine</p>
            <h2 className="font-serif-d mt-4 text-5xl tracking-tight">Take the 60-second quiz.</h2>
            <p className="mt-4 opacity-70">Answer 4 questions, get your 3-step routine. Prefer email? <a href="/contact" className="underline">Contact us</a>.</p>
          </div>
          <form
            className="reveal flex flex-col gap-3 md:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              const value = new FormData(e.currentTarget).get('email');
              const q = value ? `?email=${encodeURIComponent(value)}` : '';
              window.location.href = `/quiz${q}`;
            }}
          >
            <input name="email" type="email" placeholder="you@email.com (optional)" className="flex-1 rounded-full border border-white/20 bg-transparent px-6 py-4 text-sm placeholder:text-white/40 focus:border-white/60 focus:outline-none" />
            <button className="rounded-full bg-[#f5f0e8] px-8 py-4 text-sm font-semibold text-[#2e2e24]">Start quiz</button>
          </form>
        </div>
        <footer className="border-t border-white/15">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-[13px] opacity-60 md:flex-row md:justify-between">
            <span>© 2026 Aurea Skincare (fictional demo). Next.js + GSAP + Tailwind.</span>
            <span>hello@aurea.example</span>
          </div>
        </footer>
      </section>
    </div>
  );
}
