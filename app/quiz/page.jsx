'use client';

import { useEffect, useState } from 'react';
import SiteNav from '../../components/SiteNav';
import { api } from '../../lib/api';
import { useShop } from '../../lib/store';

const LABELS = {
  skinType: { dry: 'Dry', oily: 'Oily', combo: 'Combination', sensitive: 'Sensitive' },
  concern: { dullness: 'Dullness', breakouts: 'Breakouts', redness: 'Redness', aging: 'Fine lines', 'dark-spots': 'Dark spots' },
  sensitivity: { never: 'Rarely', sometimes: 'Sometimes', often: 'Often' },
  routine: { minimal: 'As few steps as possible', full: 'Full routine, I enjoy it' },
};
const STEPS = ['skinType', 'concern', 'sensitivity', 'routine'];

export default function QuizPage() {
  const { addToCart } = useShop();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [email, setEmail] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api('/api/quiz/meta').catch(() => {});
  }, []);

  async function submit() {
    setBusy(true);
    setError('');
    try {
      const { result: r } = await api('/api/quiz/submit', {
        method: 'POST',
        body: { answers, email: email || undefined },
      });
      setResult(r);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function addAll() {
    for (const p of result.recommended) {
      try {
        await addToCart(p.slug, 1);
      } catch (e) {
        setError(e.message);
        return;
      }
    }
    window.location.href = '/cart';
  }

  if (result) {
    const hero = result.heroProduct;
    return (
      <div className="min-h-screen">
        <SiteNav />
        <main className="mx-auto max-w-2xl px-6 pt-32">
          <p className="eyebrow text-[#b89b5e]">Your routine</p>
          <h1 className="font-serif-d mt-3 text-5xl">Meet your hero: {hero?.name}</h1>
          <ul className="mt-6 space-y-2">
            {result.reasons.map((r) => <li key={r} className="flex gap-3 text-[15px]"><span>✓</span>{r}</li>)}
          </ul>
          <ol className="mt-6 space-y-3">
            {result.recommended.map((p, i) => (
              <li key={p._id} className="flex justify-between rounded-2xl border border-[#e3d9c4] bg-white/60 p-4">
                <span>Step {i + 1} — {p.name} <span className="opacity-60">({p.tagline})</span></span>
                <span className="font-serif-d text-xl">${p.price}</span>
              </li>
            ))}
          </ol>
          {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
          <button onClick={addAll} className="mt-6 w-full bg-[#2e2e24] py-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#f5f0e8]">
            Add full routine to cart
          </button>
        </main>
      </div>
    );
  }

  const key = STEPS[step];
  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-xl px-6 pt-32">
        <p className="eyebrow text-[#b89b5e]">60-second quiz — step {step + 1} of 4</p>
        <h1 className="font-serif-d mt-3 text-5xl capitalize">{key.replace('-', ' ')}</h1>
        <div className="mt-8 grid gap-3">
          {Object.entries(LABELS[key]).map(([value, label]) => (
            <button
              key={value}
              onClick={() => {
                setAnswers({ ...answers, [key]: value });
                if (step < 3) setStep(step + 1);
              }}
              className={`rounded-2xl border p-5 text-left ${answers[key] === value ? 'border-[#2e2e24] bg-white' : 'border-[#e3d9c4] bg-white/60'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="mt-6 flex gap-3">
          {step > 0 && <button onClick={() => setStep(step - 1)} className="text-sm underline opacity-60">Back</button>}
        </div>
        {step === 3 && answers.routine && (
          <div className="mt-6 space-y-3">
            <input type="email" placeholder="Email for results (optional)" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-[#2e2e24]/25 bg-transparent px-4 py-3 text-sm" />
            {error && <p className="text-sm text-red-700">{error}</p>}
            <button onClick={submit} disabled={busy} className="w-full bg-[#2e2e24] py-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#f5f0e8] disabled:opacity-50">
              {busy ? 'Matching…' : 'See my routine'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
