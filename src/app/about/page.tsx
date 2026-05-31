import PageShell, { H2 } from "@/components/PageShell";

export const metadata = { title: "About — Niyamfin" };

export default function About() {
  return (
    <PageShell title="About Niyamfin" subtitle="A private, no-login space to understand your money — not to be sold anything.">
      <p>
        Niyamfin is a free educational tool that reads your overall financial picture and explains it in plain language.
        You answer a few questions about your income, spending, assets, debts, and protection, and the tool shows you
        widely-used indicators — net worth, key financial ratios, retirement readiness, insurance gaps, a suggested
        monthly budget, and goal planning.
      </p>
      <H2>What it is</H2>
      <p>
        An educational calculator. Every number is computed in your browser using standard, publicly-documented
        personal-finance formulas (the same kind taught in financial-planning curricula). You can read exactly how each
        figure is derived on the <a href="/methodology" className="text-sage-700 underline">Methodology</a> page.
      </p>
      <H2>What it is not</H2>
      <p>
        It is not financial, investment, insurance, or tax advice, and it does not recommend any specific product, fund,
        policy, or transaction. It does not know your full circumstances, and it cannot replace a conversation with a
        qualified, registered professional who can account for your complete situation.
      </p>
      <H2>Why &ldquo;no storage&rdquo;</H2>
      <p>
        Your financial details are sensitive. Niyamfin is built so that nothing you type is saved, transmitted, or
        logged — the moment you close or refresh the page, it is gone. There is no account, no database, and no tracking.
      </p>
    </PageShell>
  );
}
