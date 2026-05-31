import PageShell, { H2 } from "@/components/PageShell";

export const metadata = { title: "Methodology — Niyamfin" };

export default function Methodology() {
  return (
    <PageShell
      title="Methodology"
      subtitle="Exactly how every number in your report is calculated, and the assumptions behind each one."
    >
      <p>
        Niyamfin uses standard personal-finance formulas. Nothing is proprietary or hidden. All figures are estimates
        based on the inputs you provide and the assumptions listed below. Real outcomes depend on markets, taxes,
        interest rates, and personal circumstances, which no calculator can predict.
      </p>

      <H2>Net worth</H2>
      <p>Total assets (cash, investments, retirement savings, property, other) minus total liabilities (home loan, other loans, credit-card dues).</p>

      <H2>The five financial ratios</H2>
      <p>
        These follow commonly-taught personal-finance benchmarks: <strong>Liquidity ratio</strong> (liquid assets ÷ total
        assets, commonly cited around 15%); <strong>Emergency cover</strong> (liquid assets ÷ monthly outflow, commonly
        3–6 months); <strong>Debt-to-asset</strong> (liabilities ÷ assets, commonly kept below 50%); <strong>EMI-to-income</strong>
        (EMIs ÷ income, commonly kept below 35%); and <strong>Savings ratio</strong> (monthly surplus ÷ income, commonly
        at least 10%). These are general rules of thumb, not limits that apply to everyone.
      </p>

      <H2>Retirement corpus</H2>
      <p>
        Your current annual expenses are grown by the assumed inflation rate to your retirement age, then the corpus
        needed to fund them through life expectancy is estimated using the present value of an inflation-adjusted
        annuity (a &ldquo;real return&rdquo; based on your post-retirement return and inflation assumptions). The monthly
        investment shown is the level SIP that, at your assumed pre-retirement return, would close the gap between that
        corpus and the projected future value of your existing retirement savings.
      </p>

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

      <H2>Suggested monthly budget</H2>
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

      <H2>Default assumptions</H2>
      <p>
        Unless you change them: inflation 6%, pre-retirement return 11%, post-retirement return 7%. You can adjust these
        in the form. They are illustrative and not forecasts. Tax-related figures, where shown, reflect general rules and
        may not match your actual liability.
      </p>
    </PageShell>
  );
}
