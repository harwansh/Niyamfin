"use client";

import { useState } from "react";
import IntakeForm from "@/components/IntakeForm";
import ReportView from "@/components/ReportView";
import { buildReport, defaultProfile, ProfileInput, Report } from "@/lib/finance";

export default function Page() {
  const [profile, setProfile] = useState<ProfileInput>(defaultProfile);
  const [step, setStep] = useState(0);
  const [report, setReport] = useState<Report | null>(null);

  const set = <K extends keyof ProfileInput>(k: K, v: ProfileInput[K]) =>
    setProfile((s) => ({ ...s, [k]: v }));

  function generate() {
    setReport(buildReport(profile));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function restart() {
    setReport(null);
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
            ? "Your financial health, read end to end. Every figure is computed in your browser from the details you entered."
            : "Answer a few questions about your money. We'll read your complete financial health — net worth, debt, protection and retirement — in one report. Nothing is saved."}
        </p>
      </header>

      <section className="rounded-3xl border border-sage-100 bg-white/50 p-6 shadow-card backdrop-blur-sm sm:p-9">
        {report ? (
          <ReportView report={report} profile={profile} onRestart={restart} />
        ) : (
          <IntakeForm step={step} setStep={setStep} p={profile} set={set} onSubmit={generate} />
        )}
      </section>

      <footer className="mt-10 text-center text-xs leading-relaxed text-sage-600">
        Educational estimates grounded in CFP planning principles — not financial, investment, insurance, or tax advice.
        Verify with a SEBI-registered advisor before acting. All calculations run locally in your browser; nothing is stored.
      </footer>
    </main>
  );
}
