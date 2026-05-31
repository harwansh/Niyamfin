"use client";

import { useState } from "react";
import Link from "next/link";
import IntakeForm from "@/components/IntakeForm";
import ReportView from "@/components/ReportView";
import { buildReport, defaultProfile, ProfileInput, Report, sampleProfile } from "@/lib/finance";
import { hasValidationErrors, sanitizeProfile, validateProfile } from "@/lib/validation";

export default function Page() {
  const [profile, setProfile] = useState<ProfileInput>(defaultProfile);
  const [step, setStep] = useState(0);
  const [report, setReport] = useState<Report | null>(null);
  const [isSample, setIsSample] = useState(false);

  const set = <K extends keyof ProfileInput>(k: K, v: ProfileInput[K]) =>
    setProfile((s) => ({ ...s, [k]: v }));

  function generate() {
    const cleanProfile = sanitizeProfile(profile);
    const errors = validateProfile(cleanProfile);
    if (hasValidationErrors(errors)) return;
    setProfile(cleanProfile);
    setReport(buildReport(cleanProfile));
    setIsSample(false);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function showSample() {
    setProfile(sampleProfile);
    setReport(buildReport(sampleProfile));
    setIsSample(true);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function restart() {
    setReport(null);
    setIsSample(false);
    setProfile(defaultProfile);
    setStep(0);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="relative z-10 mx-auto max-w-5xl px-5 pb-24 pt-12 sm:pt-16">
      <header className="mb-9">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-sage-100 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-sage-700">
          <span className="h-1.5 w-1.5 rounded-full bg-brass" /> No login · No storage · Private
        </div>
        <h1 className="font-display text-5xl font-700 leading-[0.95] tracking-tight text-ink sm:text-7xl">
          Niyam<span className="text-sage-600">fin</span>
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-sage-700">
          {report
            ? "An educational read of your financial health, computed in your browser from the details entered. Estimates only — not financial advice."
            : "Answer a few questions about your money and see an educational snapshot of your financial health — net worth, ratios, retirement, protection, budget and goals. Nothing is saved, and it's not financial advice."}
        </p>
        {!report && (
          <button
            onClick={showSample}
            className="mt-5 inline-flex items-center gap-2 rounded-xl border border-sage-100 bg-white/70 px-4 py-2.5 text-sm font-semibold text-sage-700 transition hover:border-sage-400"
          >
            👀 See a sample report first
          </button>
        )}
      </header>

      {isSample && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brass/40 bg-[#f6efd9]/60 px-5 py-3">
          <p className="text-sm font-medium text-[#8a6d1f]">
            This is a <strong>sample report</strong> using made-up figures, so you can see what you&apos;ll get. None of these numbers are yours.
          </p>
          <button onClick={restart} className="rounded-lg bg-sage-900 px-4 py-2 text-sm font-semibold text-paper transition hover:bg-sage-700">
            Start mine →
          </button>
        </div>
      )}

      <section className="rounded-3xl border border-sage-100 bg-white/50 p-6 shadow-card backdrop-blur-sm sm:p-9">
        {report ? (
          <ReportView report={report} profile={profile} onRestart={restart} />
        ) : (
          <IntakeForm step={step} setStep={setStep} p={profile} set={set} onSubmit={generate} />
        )}
      </section>

      <footer className="mt-10 space-y-4 text-center">
        <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs font-medium text-sage-600">
          <Link href="/about" className="transition hover:text-sage-900">About</Link>
          <Link href="/methodology" className="transition hover:text-sage-900">Methodology</Link>
          <Link href="/privacy" className="transition hover:text-sage-900">Privacy</Link>
          <Link href="/terms" className="transition hover:text-sage-900">Terms</Link>
          <Link href="/contact" className="transition hover:text-sage-900">Contact</Link>
        </nav>
        <p className="mx-auto max-w-2xl text-xs leading-relaxed text-sage-600">
          Niyamfin gives educational estimates based on standard personal-finance formulas and the details you enter. It
          is not financial, investment, insurance, or tax advice, and does not recommend any product or action. Verify
          with a SEBI-registered investment adviser or qualified professional before acting. All calculations run in your
          browser; nothing is stored.
        </p>
      </footer>
    </main>
  );
}
