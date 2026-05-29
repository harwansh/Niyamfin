# Niyamfin — Financial Health Portal

An **open, no-login, no-storage** portal. A person answers a short guided questionnaire about their money, and gets back one comprehensive **Financial Health Report**: net worth, the five key personal-finance ratios, asset/liability composition, retirement readiness, and life & health insurance gaps — shown as graphs and plain-language insights.

All numbers are computed by a **deterministic engine** whose rules come from the CFP (Certified Financial Planner) study material that seeded this project. Nothing is stored; everything runs in the browser. An **optional** AI summary can turn the numbers into a plain-language action plan if a server API key is configured.

## What it computes

| Area | Method | Source rule |
|------|--------|-------------|
| Net worth | Assets − liabilities | CFP IPS/PFM |
| Liquidity ratio | Liquid assets ÷ total assets | ideal ≈ 15% |
| Emergency cover | Liquid assets ÷ monthly expenses | 3–6 months |
| Debt-to-asset | Liabilities ÷ assets | below 50% |
| EMI-to-income | EMIs ÷ income | below 35% (>45% concern) |
| Savings ratio | Surplus ÷ income | at least 10% |
| Retirement corpus | Inflation-adjusted growing-annuity PV + required SIP | CFP Retirement Planning |
| Life cover | Income replacement (HLV) + liabilities − liquid assets | CFP Risk, HLV / L.I.F.E. method |
| Health cover | Tiered family-floater rule of thumb | — |

> The CFP source PDFs are the knowledge base; the ratio thresholds above are quoted directly from that material.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** — custom sage/brass "paper" design system
- **Recharts** — gauges, pie composition, progress
- Engine: pure functions in `src/lib/finance.ts` (unit-testable, no side effects)
- Optional AI: `src/app/api/summary/route.ts` (server route; reads `ANTHROPIC_API_KEY`)

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

To enable the optional AI summary, copy `.env.example` to `.env.local` and add your key:

```bash
cp .env.example .env.local
# set ANTHROPIC_API_KEY=sk-ant-...
```

## Structure

```
src/
  app/
    page.tsx                 # form → report flow
    layout.tsx, globals.css  # fonts, design tokens, grain
    api/summary/route.ts     # optional AI narrative
  components/
    IntakeForm.tsx           # 6-step guided questionnaire
    ReportView.tsx           # report: gauges, charts, insights
    Fields.tsx               # money / number / choice inputs
  lib/
    finance.ts               # the deterministic engine
```

## Privacy

No database, no cookies, no localStorage, no analytics. Inputs live only in React memory and vanish on refresh. The optional AI call sends only the computed summary figures (not stored) and only when the user clicks the button.

## Disclaimer

Educational estimates grounded in CFP planning principles — not financial, investment, insurance, or tax advice. Tax and regulatory rules change. Verify with a SEBI-registered advisor before acting.
