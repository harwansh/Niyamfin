import PageShell, { H2 } from "@/components/PageShell";

export const metadata = { title: "Privacy Policy — Niyamfin" };

export default function Privacy() {
  return (
    <PageShell title="Privacy Policy" subtitle="The short version: we don't collect, store, or transmit your financial data.">
      <H2>Data you enter</H2>
      <p>
        Everything you type into Niyamfin — income, expenses, assets, debts, insurance, goals — is processed entirely in
        your own browser to compute your report. It is never sent to a server, never written to a database, and never
        retained. When you refresh or close the page, the data is gone. There is no account and no login.
      </p>
      <H2>Storage</H2>
      <p>
        Niyamfin does not use cookies and does not send your financial inputs to any server or database. To improve your
        experience, your in-progress form inputs are saved as a temporary draft in your own browser&apos;s local storage
        (on your device only). This draft is never transmitted anywhere and is automatically cleared when you start over.
        If you sign up for product updates, only your email address is sent to our mailing-list provider — your financial
        inputs are never linked to it. We do not build a profile of you.
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
    </PageShell>
  );
}
