import PageShell, { H2 } from "@/components/PageShell";

export const metadata = { title: "About — Niyamfin" };

export default function About() {
  return (
    <PageShell title="About Niyamfin" subtitle="A private, no-login space to understand your money — not to be sold anything.">
      <p>
        Niyamfin is a financial-health calculator created by Niyam Finance. The website uses the shorter name
        &ldquo;Niyamfin&rdquo; because the domain is niyamfin.com, while the broader company/operator name is Niyam Finance.
      </p>
      <p>
        You answer a few questions about your income, spending, assets, debts, and protection, and the tool shows you
        widely-used indicators — net worth, key financial ratios, retirement readiness, illustrative protection gap, a
        benchmark-based monthly budget snapshot, and goal planning.
      </p>
      <H2>What it is</H2>
      <p>
        Niyamfin is an educational calculator. Every number is computed in your browser using standard, publicly-documented
        personal-finance formulas. You can read exactly how each
        figure is derived on the <a href="/methodology" className="text-sage-700 underline">Methodology</a> page.
      </p>
      <H2>What it is not</H2>
      <p>
        It is not financial, investment, insurance, or tax advice, and it does not recommend any specific product, fund,
        policy, or transaction. It does not know your full circumstances, and it cannot replace a conversation with a
        qualified, registered professional who can account for your complete situation.
      </p>
      <H2>Privacy by design</H2>
      <p>
        Your financial details are sensitive. Financial inputs are processed in your browser and are not stored on
        Niyamfin servers. In-progress drafts may be saved locally on your device for convenience; they are not
        transmitted anywhere.
      </p>
      <H2>Who operates Niyamfin</H2>
      <p>Operated by: Niyam Finance</p>
      <p>Founder: Harwansh Tiwari</p>
      <p>Location: India</p>
      <p>Contact: <a href="mailto:hello@niyamfin.com" className="text-sage-700 underline">hello@niyamfin.com</a></p>
      <p className="text-sm text-sage-600 italic">Niyam Finance is a brand/project name. It is not a SEBI-registered investment adviser, research analyst, insurance intermediary, or distributor.</p>
      <p className="mt-8 text-xs text-sage-500">Last updated: 31 May 2026</p>
    </PageShell>
  );
}
