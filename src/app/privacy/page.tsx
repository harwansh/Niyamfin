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
        Niyamfin does not use cookies, local storage, or any browser storage to save your inputs. We do not build a
        profile of you and we have nothing to sell, share, or lose in a breach because we hold none of your data.
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
