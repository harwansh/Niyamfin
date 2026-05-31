import PageShell, { H2 } from "@/components/PageShell";

export const metadata = { title: "Methodology — Niyamfin" };

export default function Methodology() {
  return (
    <PageShell
      title="Methodology"
      subtitle="Exactly how every number in your report is calculated, and the assumptions behind each one."
    >
      <p className="text-xs text-sage-500">Methodology version: v1.0 · Assumptions last reviewed: 31 May 2026</p>

      <p>
        Niyamfin uses standard personal-finance formulas. Nothing is proprietary or hidden. All figures are estimates
        based on the inputs you provide and the assumptions listed below. Real outcomes depend on markets, taxes,
        interest rates, and personal circumstances, which no calculator can predict.
      </p>

      <H2>Exact formulas</H2>
      <ul className="space-y-1 text-sm">
        <li><strong>Net worth</strong> = Total assets − Total liabilities</li>
        <li><strong>Liquidity ratio</strong> = Liquid assets ÷ Total assets</li>
        <li><strong>Emergency cover</strong> = Liquid assets ÷ Monthly essential expenses</li>
        <li><strong>Debt-to-asset ratio</strong> = Total liabilities ÷ Total assets</li>
        <li><strong>EMI-to-income ratio</strong> = Monthly EMIs ÷ Monthly income</li>
        <li><strong>Savings ratio</strong> = Monthly surplus ÷ Monthly income</li>
      </ul>

      <H2>Net worth</H2>
      <p>Total assets (cash, investments, retirement savings, property, other) minus total liabilities (home loan, other loans, credit-card dues).</p>

      <H2>The five financial ratios</H2>
      <p>
        These follow commonly-taught personal-finance benchmarks: <strong>Liquidity ratio</strong> (liquid assets ÷ total
        assets, commonly cited around 15%); <strong>Emergency cover</strong> (liquid assets ÷ monthly outflow, commonly
        3–6 months); <strong>Debt-to-asset</strong> (liabilities ÷ assets, commonly kept below 50%); <strong>EMI-to-income ratio</strong> (EMIs ÷ income, commonly kept below 35%); and <strong>Savings ratio</strong> (monthly surplus ÷ income, commonly
        at least 10%). These are simplified educational rules of thumb, not regulatory or professional standards, and not limits that apply to everyone.
      </p>

      <H2>Retirement corpus</H2>
      <p>
        Your current annual expenses are grown by the assumed inflation rate to your retirement age, then the corpus
        needed to fund them through life expectancy is estimated using the present value of an inflation-adjusted
        annuity (a &ldquo;real return&rdquo; based on your post-retirement return and inflation assumptions). The monthly
        contribution shown is the level SIP that, at your assumed pre-retirement return, would close the gap between that
        corpus and the projected future value of your existing retirement savings.
      </p>
      <ul className="space-y-1 text-sm">
        <li><strong>Future annual expense at retirement</strong> = Current annual expense × (1 + inflation rate) ^ years to retirement</li>
        <li><strong>Real post-retirement return</strong> = ((1 + post-retirement return) / (1 + inflation rate)) − 1</li>
        <li>Retirement corpus is calculated as the present value of inflation-adjusted retirement expenses during retirement years.</li>
      </ul>

      <H2>Life insurance estimate</H2>
      <p>
        Based on an income-replacement (Human Life Value style) approach: the present value of the share of income that
        supports dependents over your remaining working years, plus outstanding liabilities, minus existing liquid assets
        and retirement savings. If you have no dependents, the estimate focuses on clearing liabilities. This is a
        starting point for discussion, not a recommended policy amount.
      </p>

      <H2>Health insurance estimate</H2>
      <p>
        A tiered rule-of-thumb floater amount scaled by your city type and number of dependents. Actual adequate cover
        depends on local medical costs, family health history, and the specific policy — all outside this tool.
      </p>

      <H2>Benchmark-based monthly budget snapshot</H2>
      <p>
        Anchored to the ratio benchmarks above: EMIs shown against a 35% ceiling, savings against a 10% floor and a 20%
        healthy target, and the remainder allocated to living expenses. The &ldquo;you now&rdquo; figures come straight
        from your inputs so you can see where you stand versus the benchmark.
      </p>

      <H2>Goal planning</H2>
      <p>
        Each goal&apos;s present cost is grown by inflation to its target year, and the monthly SIP to reach that future
        cost is computed using a standard future-value-of-annuity formula at your assumed growth rate.
      </p>
      <ul className="space-y-1 text-sm">
        <li><strong>Future goal cost</strong> = Current goal cost × (1 + inflation rate) ^ years to goal</li>
        <li>Required monthly contribution is estimated using a future-value-of-annuity calculation.</li>
      </ul>

      <H2>Assumptions</H2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-sage-100">
              <th className="py-2 pr-4 text-left font-semibold text-ink">Assumption</th>
              <th className="py-2 text-left font-semibold text-ink">Default</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sage-100">
            <tr><td className="py-2 pr-4">Inflation</td><td className="py-2">6%</td></tr>
            <tr><td className="py-2 pr-4">Pre-retirement return</td><td className="py-2">11%</td></tr>
            <tr><td className="py-2 pr-4">Post-retirement return</td><td className="py-2">7%</td></tr>
            <tr><td className="py-2 pr-4">Emergency fund benchmark</td><td className="py-2">6 months of essential expenses</td></tr>
            <tr><td className="py-2 pr-4">Life expectancy</td><td className="py-2">User input / default assumption</td></tr>
            <tr><td className="py-2 pr-4">Retirement age</td><td className="py-2">User input</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        You can adjust inflation, return rates, retirement age, and life expectancy in the form. These are illustrative and not forecasts.
        Tax-related figures, where shown, reflect general rules and may not match your actual liability.
      </p>

      <p className="rounded-xl border border-sage-100 bg-sage-50/60 px-4 py-3 text-sm text-sage-700">
        These formulas are educational estimates only. They are not financial, investment, insurance, tax, or legal advice.
      </p>

      <p className="text-sm text-sage-600">
        <strong>Basis:</strong> These benchmarks are commonly cited in personal-finance education and planning literature. They are not mandated by any regulator and may not suit every individual situation. Always verify with a qualified professional.
      </p>

      <p className="mt-8 text-xs text-sage-500">Last updated: 31 May 2026</p>
    </PageShell>
  );
}
