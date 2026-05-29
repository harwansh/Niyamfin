"use client";

import { useState } from "react";
import RetirementCalculator from "@/components/RetirementCalculator";
import SipCalculator from "@/components/SipCalculator";
import TaxCalculator from "@/components/TaxCalculator";

const TABS = [
  { id: "retire", label: "Retirement", desc: "Build a corpus that outlives you", el: <RetirementCalculator /> },
  { id: "sip", label: "SIP / Goal", desc: "Project wealth from monthly investing", el: <SipCalculator /> },
  { id: "tax", label: "Income Tax", desc: "Estimate tax under the new regime", el: <TaxCalculator /> },
] as const;

export default function Page() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("retire");
  const active = TABS.find((t) => t.id === tab)!;

  return (
    <main className="relative z-10 mx-auto max-w-5xl px-5 pb-24 pt-12 sm:pt-16">
      <header className="mb-10">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-sage-100 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-sage-700">
          <span className="h-1.5 w-1.5 rounded-full bg-brass" /> No login · No storage · Private
        </div>
        <h1 className="font-display text-5xl font-700 leading-[0.95] tracking-tight text-ink sm:text-7xl">
          Niyam<span className="text-sage-600">fin</span>
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-sage-700">
          A quiet, private corner to plan your money. Fill in your details, see your numbers — nothing is saved, nothing leaves your browser.
        </p>
      </header>

      <nav className="mb-8 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`group flex flex-col items-start rounded-2xl border px-5 py-3 text-left transition ${
              tab === t.id
                ? "border-sage-600 bg-sage-900 text-paper shadow-card"
                : "border-sage-100 bg-white/60 text-ink hover:border-sage-400"
            }`}
          >
            <span className="font-display text-lg font-600">{t.label}</span>
            <span className={`text-xs ${tab === t.id ? "text-sage-100/80" : "text-sage-600"}`}>{t.desc}</span>
          </button>
        ))}
      </nav>

      <section className="rounded-3xl border border-sage-100 bg-white/50 p-6 shadow-card backdrop-blur-sm sm:p-9">
        <div key={tab} className="rise">{active.el}</div>
      </section>

      <footer className="mt-10 text-center text-xs leading-relaxed text-sage-600">
        Estimates only — not financial, investment, or tax advice. Verify with a SEBI-registered advisor or
        chartered accountant before acting. All calculations run locally in your browser.
      </footer>
    </main>
  );
}
