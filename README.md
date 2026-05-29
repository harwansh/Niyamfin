# Niyamfin — Financial Health Portal

An **open, no-login, no-storage** financial health portal. A person answers a short guided questionnaire about their money and gets back one comprehensive **Financial Health Report**: net worth, the five key personal-finance ratios, asset/liability composition, retirement readiness, life and health insurance gaps, life-goal SIP planning, and a monthly budget reality check.

All numbers are computed by a **deterministic browser-side engine**. Nothing is stored by the app; inputs live in React memory and vanish on refresh.

## What it computes

| Area | Method | Source rule |
|------|--------|-------------|
| Net worth | Assets - liabilities | CFP IPS/PFM |
| Liquidity ratio | Liquid assets / total assets | ideal approx. 15% |
| Emergency cover | Liquid assets / monthly expenses | 3-6 months |
| Debt-to-asset | Liabilities / assets | below 50% |
| EMI-to-income | EMIs / income | below 35%, above 45% concern |
| Savings ratio | Surplus / income | at least 10%, healthy at 20%+ |
| Retirement corpus | Inflation-adjusted retirement expense PV + required monthly SIP | CFP Retirement Planning |
| Life cover | Income replacement + liabilities - liquid/retirement assets | CFP Risk / HLV-style method |
| Health cover | Tiered family-floater rule of thumb | app rule of thumb |
| Life goals | Inflate goal to target year, solve required monthly SIP | standard TVM |
| Monthly budget | EMI ceiling, savings target, living expense headroom | CFP ratio thresholds |

> Educational estimates only. CFP study material and planning rules seeded the model, but tax, insurance, investment, and regulatory assumptions change. Verify before acting.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** — custom sage/brass paper design system
- **Recharts** — gauges, pie composition, progress
- Engine: pure functions in `src/lib/finance.ts` (unit-testable, no side effects)
- Browser-first privacy model: no database, cookies, localStorage, or analytics in the app code

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Quality checks

```bash
npm run typecheck
npm test
npm run build
```

## Structure

```text
src/
  app/
    page.tsx                 # form -> report flow
    layout.tsx, globals.css  # fonts, design tokens, grain
  components/
    IntakeForm.tsx           # 6-step guided questionnaire
    ReportView.tsx           # report: gauges, charts, insights
    Fields.tsx               # money / number / choice inputs
  lib/
    finance.ts               # deterministic financial engine
    validation.ts            # input validation and clamping helpers
tests/
  finance.test.ts            # formula regression tests
```

## Privacy

No database, cookies, localStorage, or analytics are used by the app code. Inputs live only in React memory and vanish on refresh. The app does not send financial inputs to a server-side summary or AI endpoint.

Fonts are loaded through Next.js font optimization at build/runtime integration rather than hard-coded third-party font tags in the page template.

See [`PRIVACY.md`](./PRIVACY.md) for the full privacy note.

## Disclaimer

Educational estimates grounded in financial-planning principles — not financial, investment, insurance, or tax advice. Tax and regulatory rules change. Verify with a SEBI-registered advisor before acting.
