"use client";

import { useState } from "react";

// Wire SIGNUP_ENDPOINT to your email service (Mailchimp, ConvertKit, Resend, etc.)
// e.g. "https://app.us1.list-manage.com/subscribe/post?u=..." or a Next.js API route.
// When undefined the form logs locally — replace before launch.
const SIGNUP_ENDPOINT = process.env.NEXT_PUBLIC_SIGNUP_ENDPOINT;

export default function UpgradeSignup() {
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && agreed;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setStatus("loading");
    try {
      if (SIGNUP_ENDPOINT) {
        const res = await fetch(SIGNUP_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (!res.ok) throw new Error("Server error");
      }
      // No endpoint configured — treat as success (dev/preview mode)
      setStatus("done");
    } catch {
      setErrorMsg("Something went wrong. Please try again or email us at Hello@niyamfin.com.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-sage-400 bg-sage-50/60 px-6 py-8 text-center">
        <div className="font-display text-2xl font-600 text-sage-700">You&apos;re on the list ✦</div>
        <p className="mt-2 text-sm text-sage-600">
          We&apos;ll reach out when new tools and features launch. Your financial inputs are not linked to this email.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-sage-100 bg-white/60 px-6 py-7">
      <h3 className="font-display text-xl font-600 text-ink">Get future Niyamfin upgrades</h3>
      <p className="mt-1 text-sm leading-relaxed text-sage-700">
        We&apos;re building more tools for financial health — retirement planning, insurance checks, goal tracking, and
        more. Add your email to receive product updates, new calculator launches, and early access to future features.
      </p>
      <p className="mt-2 text-xs font-semibold text-sage-600">
        Your financial inputs are not stored with your email.
      </p>

      <form onSubmit={submit} className="mt-5 space-y-4" noValidate>
        <div>
          <label htmlFor="signup-email" className="field-label">Email address</label>
          <input
            id="signup-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setStatus("idle"); setErrorMsg(""); }}
            className="field-input"
            aria-required="true"
          />
        </div>

        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 h-4 w-4 flex-none cursor-pointer accent-sage-600"
            aria-required="true"
          />
          <span className="text-xs leading-relaxed text-sage-600">
            I agree to receive emails from Niyamfin about product updates, educational content, and future services.
            I can unsubscribe anytime.
          </span>
        </label>

        {status === "error" && (
          <p role="alert" className="text-xs font-medium text-clay">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={!valid || status === "loading"}
          className="rounded-xl bg-sage-900 px-6 py-2.5 text-sm font-semibold text-paper shadow-card transition hover:bg-sage-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {status === "loading" ? "Sending…" : "Notify me about future upgrades"}
        </button>
      </form>
    </div>
  );
}
