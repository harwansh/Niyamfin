import PageShell, { H2 } from "@/components/PageShell";

export const metadata = { title: "Terms of Use — Niyamfin" };

export default function Terms() {
  return (
    <PageShell title="Terms of Use" subtitle="Please read these before relying on anything Niyamfin shows you.">
      <p>
        Niyamfin is operated by Niyam Finance. In this policy, &ldquo;Niyamfin,&rdquo; &ldquo;Niyam Finance,&rdquo;
        &ldquo;we,&rdquo; &ldquo;us,&rdquo; and &ldquo;our&rdquo; refer to the operator of this website and calculator.
      </p>
      <H2>Educational purpose only</H2>
      <p>
        Niyamfin is provided for general educational and informational purposes. It performs calculations using standard
        formulas and the inputs you supply. It does <strong>not</strong> provide financial, investment, insurance, tax,
        legal, or accounting advice, and it does not recommend any specific security, mutual fund, insurance policy,
        lender, or course of action.
      </p>
      <H2>No advisory relationship</H2>
      <p>
        Using Niyamfin does not create an adviser–client or fiduciary relationship. Niyamfin is not a SEBI-registered
        investment adviser, research analyst, insurance intermediary, or distributor. Outputs are generic illustrations,
        not personalised recommendations tailored to your full circumstances.
      </p>
      <H2>Estimates, not guarantees</H2>
      <p>
        All results are estimates based on assumptions (such as inflation and return rates) that may not hold. Investment
        returns are uncertain and past performance does not indicate future results. Actual outcomes will differ. You are
        solely responsible for any decisions you make.
      </p>
      <H2>Verify before acting</H2>
      <p>
        Before acting on anything you see here, consult a SEBI-registered investment adviser, a licensed insurance
        professional, or a qualified chartered accountant who can assess your complete situation.
      </p>
      <H2>No liability</H2>
      <p>
        To the maximum extent permitted by law, Niyamfin and its creators are not liable for any loss or damage arising
        from use of, or reliance on, this tool. The tool is provided &ldquo;as is&rdquo; without warranties of any kind.
      </p>
      <H2>Accuracy</H2>
      <p>
        Formulas, benchmarks, and tax-related rules change over time and may contain errors or become outdated. No
        guarantee is made as to accuracy, completeness, or current validity.
      </p>
      <p className="mt-8 text-xs text-sage-500">Last updated: 31 May 2026</p>
    </PageShell>
  );
}
