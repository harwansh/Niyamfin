import PageShell, { H2 } from "@/components/PageShell";

export const metadata = { title: "Privacy Policy — Niyamfin" };

export default function Privacy() {
  return (
    <PageShell title="Privacy Policy" subtitle="The short version: your financial inputs are never sent to our servers. Drafts may be saved locally on your device only.">
      <p>
        Niyamfin is operated by Niyam Finance. In this policy, &ldquo;Niyamfin,&rdquo; &ldquo;Niyam Finance,&rdquo;
        &ldquo;we,&rdquo; &ldquo;us,&rdquo; and &ldquo;our&rdquo; refer to the operator of this website and calculator.
      </p>
      <H2>Data you enter</H2>
      <p>
        Everything you type into Niyamfin — income, expenses, assets, debts, insurance, goals — is processed entirely in
        your own browser to compute your report. It is never sent to a server, never written to a database, and never
        retained on Niyamfin servers. In-progress drafts may be saved locally on your device for convenience (see Storage below). There is no account and no login.
      </p>
      <H2>Storage</H2>
      <p>
        Financial inputs are processed in your browser and are not stored on Niyamfin servers. Niyamfin does not use
        cookies. To improve your experience, your in-progress form inputs are saved as a temporary draft in your own
        browser&apos;s local storage (on your device only). This draft is never transmitted anywhere and is automatically
        cleared when you start over. If you sign up for product updates, only your email address is sent to our
        mailing-list provider — your financial inputs are never linked to it. We do not build a profile of you.
      </p>
      <H2>Analytics and tracking</H2>
      <p>
        The application itself does not run advertising trackers or collect personal analytics. Note that the hosting
        provider serving this site may record standard technical request logs (such as IP address and timestamp) for
        security and operational purposes, as is typical for any website; this is handled by the host, not by Niyamfin,
        and is not linked to the financial details you enter.
      </p>
      <H2>Third parties</H2>
      <p>
        Niyamfin does not sell, rent, or share data with third parties, because it does not collect any. Fonts may be
        loaded from a public font provider for display purposes only.
      </p>
      <H2>Children</H2>
      <p>The tool is intended for adults making personal-finance decisions and is not directed at children.</p>
      <H2>Changes</H2>
      <p>
        If this policy changes, the updated version will appear on this page. Questions? See the{" "}
        <a href="/contact" className="text-sage-700 underline">Contact</a> page.
      </p>
      <p className="mt-8 text-xs text-sage-500">Last updated: 31 May 2026</p>
    </PageShell>
  );
}
