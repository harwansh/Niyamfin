# Niyamfin — Financial Planning Portal

An **open, no-login, no-storage** financial planning suite. Users fill in their details and instantly get computed results. Every calculation runs **client-side in the browser** — no backend, no database, no data ever leaves the device.

## Tools

1. **Retirement Planner** — corpus needed at retirement (inflation-adjusted growing annuity), future value of current savings, and the monthly SIP required to close the gap.
2. **SIP / Goal Calculator** — maturity value of monthly investing with optional annual step-up; invested vs. value breakdown.
3. **Income Tax Estimator** — India **New Tax Regime, FY 2025-26 (AY 2026-27)**: slab-wise tax, ₹75,000 standard deduction, Section 87A rebate (nil tax up to ₹12 L taxable), and 4% cess.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** with a custom sage/brass design system
- **Recharts** for visualizations
- Pure, unit-testable finance logic in `src/lib/finance.ts`

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start
```

## Architecture

```
src/
  app/
    layout.tsx       # fonts (Fraunces + Spline Sans), metadata
    page.tsx         # tabbed shell
    globals.css      # design tokens, grain texture
  components/
    Fields.tsx       # reusable inputs + stat cards
    RetirementCalculator.tsx
    SipCalculator.tsx
    TaxCalculator.tsx
  lib/
    finance.ts       # all math — pure functions, no side effects
```

## Privacy by design

No `localStorage`, no cookies, no analytics, no network calls for computation. State lives only in React memory and is gone on refresh. Because there is no persistence layer, there is no data-at-rest to secure or breach.

## Disclaimer

Estimates only — not financial, investment, or tax advice. Tax rules and assumptions change; verify with a SEBI-registered advisor or chartered accountant before acting.
