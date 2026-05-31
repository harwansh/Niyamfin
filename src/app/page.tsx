"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import IntakeForm from "@/components/IntakeForm";
import ReportView from "@/components/ReportView";
import { buildReport, defaultProfile, ProfileInput, Report, sampleProfile } from "@/lib/finance";
import { hasValidationErrors, sanitizeProfile, validateProfile } from "@/lib/validation";

const DRAFT_KEY = "niyamfin-draft";

function encodeProfile(p: ProfileInput): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(p))));
}

function decodeProfile(s: string): ProfileInput | null {
  try {
    return sanitizeProfile({ ...defaultProfile, ...JSON.parse(decodeURIComponent(escape(atob(s)))) });
  } catch {
    return null;
  }
}

function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // fallback for browsers without clipboard API
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-2 rounded-xl border border-sage-100 bg-white/70 px-4 py-2 text-sm font-semibold text-sage-700 transition hover:border-sage-400"
    >
      {copied ? "✓ Copied!" : "🔗 Copy shareable link"}
    </button>
  );
}

export default function Page() {
  const [profile, setProfile] = useState<ProfileInput>(defaultProfile);
  const [step, setStep] = useState(0);
  const [report, setReport] = useState<Report | null>(null);
  const [isSample, setIsSample] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const skipSave = useRef(true); // don't overwrite localStorage on the initial mount restore

  // On mount: load from URL hash (shared link) or localStorage (draft)
  useEffect(() => {
    try {
      const hash = window.location.hash.slice(1);
      if (hash) {
        const p = decodeProfile(hash);
        if (p) {
          setProfile(p);
          skipSave.current = false;
          const errors = validateProfile(p);
          if (!hasValidationErrors(errors)) {
            setReport(buildReport(p));
            setShareUrl(`${window.location.origin}${window.location.pathname}#${hash}`);
          }
          return;
        }
      }
    } catch {}

    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const p = sanitizeProfile({ ...defaultProfile, ...JSON.parse(saved) });
        setProfile(p);
        setDraftRestored(true);
      }
    } catch {}

    skipSave.current = false;
  }, []);

  // Auto-save profile to localStorage on every change (after initial load)
  useEffect(() => {
    if (skipSave.current) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(profile));
    } catch {}
  }, [profile]);

  const set = <K extends keyof ProfileInput>(k: K, v: ProfileInput[K]) =>
    setProfile((s) => ({ ...s, [k]: v }));

  function generate() {
    const cleanProfile = sanitizeProfile(profile);
    const errors = validateProfile(cleanProfile);
    if (hasValidationErrors(errors)) return;
    setProfile(cleanProfile);
    setReport(buildReport(cleanProfile));
    setIsSample(false);
    setDraftRestored(false);
    try {
      const encoded = encodeProfile(cleanProfile);
      setShareUrl(`${window.location.origin}${window.location.pathname}#${encoded}`);
      window.history.replaceState(null, "", `#${encoded}`);
    } catch {}
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function showSample() {
    setProfile(sampleProfile);
    setReport(buildReport(sampleProfile));
    setIsSample(true);
    setShareUrl("");
    window.history.replaceState(null, "", window.location.pathname);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function restart() {
    setReport(null);
    setIsSample(false);
    setShareUrl("");
    setDraftRestored(false);
    setProfile(defaultProfile);
    setStep(0);
    try { localStorage.removeItem(DRAFT_KEY); } catch {}
    window.history.replaceState(null, "", window.location.pathname);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function clearDraft() {
    try { localStorage.removeItem(DRAFT_KEY); } catch {}
    setDraftRestored(false);
    setProfile(defaultProfile);
    setStep(0);
  }

  return (
    <main className="relative z-10 mx-auto max-w-5xl px-5 pb-24 pt-12 sm:pt-16">
      <header className="mb-9">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-sage-100 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-sage-700">
          <span className="h-1.5 w-1.5 rounded-full bg-brass" aria-hidden="true" /> No login · No server storage · Private by design
        </div>
        <h1 className="font-display text-5xl font-700 leading-[0.95] tracking-tight text-ink sm:text-7xl">
          Niyam<span className="text-sage-600">fin</span>
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-sage-700">
          {report
            ? "An educational read of your financial health, computed in your browser from the details entered. Estimates only — not financial advice."
            : "A private financial-health calculator from Niyam Finance."}
        </p>
        {!report && (
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => document.getElementById("intake-form")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center gap-2 rounded-xl bg-sage-900 px-6 py-3 text-sm font-bold text-paper shadow-card transition hover:bg-sage-700"
            >
              Start private checkup →
            </button>
            <button
              type="button"
              onClick={showSample}
              className="inline-flex items-center gap-2 rounded-xl border border-sage-100 bg-white/70 px-4 py-2.5 text-sm font-semibold text-sage-700 transition hover:border-sage-400"
            >
              View sample report
            </button>
          </div>
        )}
      </header>

      {/* Draft restored notice */}
      {draftRestored && !report && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sage-100 bg-white/60 px-5 py-3" role="status">
          <p className="text-sm text-sage-700">
            <strong>Draft restored.</strong> Your previously entered figures have been loaded from this device.
          </p>
          <button
            type="button"
            onClick={clearDraft}
            className="text-xs font-semibold text-sage-500 underline underline-offset-2 transition hover:text-clay"
          >
            Clear saved draft
          </button>
        </div>
      )}

      {/* Sample report notice */}
      {isSample && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brass/40 bg-[#f6efd9]/60 px-5 py-3">
          <p className="text-sm font-medium text-[#8a6d1f]">
            This is a <strong>sample report</strong> using made-up figures, so you can see what you&apos;ll get. None of these numbers are yours.
          </p>
          <button type="button" onClick={restart} className="rounded-lg bg-sage-900 px-4 py-2 text-sm font-semibold text-paper transition hover:bg-sage-700">
            Start mine →
          </button>
        </div>
      )}

      {/* Share link banner (only for user's own report) */}
      {report && !isSample && shareUrl && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sage-100 bg-white/60 px-5 py-3">
          <div>
            <p className="text-sm font-semibold text-ink">Bookmark or share this scenario</p>
            <p className="text-xs text-sage-600">The link encodes your inputs — no data leaves your device or our servers.</p>
          </div>
          <CopyLinkButton url={shareUrl} />
        </div>
      )}

      {!report && (
        <p className="mb-4 text-xs text-sage-600">Your progress may be saved locally on this device. It is not sent to Niyamfin. Use &ldquo;Clear saved draft&rdquo; to remove it.</p>
      )}
      <section id="intake-form" className="rounded-3xl border border-sage-100 bg-white/50 p-6 shadow-card backdrop-blur-sm sm:p-9">
        {report ? (
          <ReportView report={report} profile={profile} onRestart={restart} />
        ) : (
          <IntakeForm step={step} setStep={setStep} p={profile} set={set} onSubmit={generate} />
        )}
      </section>

      {/* FAQ */}
      {!report && (
        <section className="mt-10" aria-labelledby="faq-heading">
          <h2 className="mb-4 font-display text-2xl font-600 text-ink" id="faq-heading">Common questions</h2>
          <div className="space-y-2">
            {[
              {
                q: "Is my data saved anywhere?",
                a: "Your financial inputs are not sent to our servers. In-progress drafts may be saved locally on your device.",
              },
              {
                q: "Is this financial advice?",
                a: "No. Niyamfin gives educational estimates based on standard personal-finance formulas (the same benchmarks taught in CFP courses). It does not know your full situation, tax position, goals, or risk tolerance. Always verify important decisions with a SEBI-registered investment adviser or a qualified financial professional.",
              },
              {
                q: "Who should use this?",
                a: "Anyone in India who wants a quick, private snapshot of their financial health — salaried professionals, self-employed individuals, or anyone starting to plan for retirement, insurance, or life goals. It works best if you have a rough sense of your income, expenses, assets, and outstanding loans.",
              },
              {
                q: "Can I rely on this for investment decisions?",
                a: "No. The numbers are illustrative estimates based on the figures you enter and the assumptions chosen (inflation, returns, retirement age). Real outcomes depend on market performance, taxes, life events, and many other factors. Use this as a starting-point conversation with yourself — then consult a professional before committing money.",
              },
            ].map(({ q, a }) => (
              <details key={q} className="group rounded-2xl border border-sage-100 bg-white/60">
                <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 font-semibold text-ink [&::-webkit-details-marker]:hidden">
                  {q}
                  <span className="ml-4 flex-none text-sage-400 transition group-open:rotate-45">+</span>
                </summary>
                <div className="border-t border-sage-100 px-5 pb-4 pt-3 text-sm leading-relaxed text-sage-700">
                  {a}
                </div>
              </details>
            ))}
          </div>
        </section>
      )}

      <footer className="mt-10 space-y-4 text-center">
        <nav aria-label="Site links" className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs font-medium text-sage-600">
          <Link href="/about" className="transition hover:text-sage-900">About</Link>
          <Link href="/methodology" className="transition hover:text-sage-900">Methodology</Link>
          <Link href="/privacy" className="transition hover:text-sage-900">Privacy</Link>
          <Link href="/terms" className="transition hover:text-sage-900">Terms</Link>
          <Link href="/contact" className="transition hover:text-sage-900">Contact</Link>
        </nav>
        <p className="mx-auto max-w-2xl text-xs leading-relaxed text-sage-600">
          © 2026 Niyam Finance. Niyamfin is an educational financial-health calculator. Not financial advice. All calculations run in your browser; financial inputs are processed in your browser and are not stored on Niyamfin servers.
        </p>
      </footer>
    </main>
  );
}
