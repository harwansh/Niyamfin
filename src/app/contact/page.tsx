import PageShell from "@/components/PageShell";

export const metadata = { title: "Contact — Niyamfin" };

export default function Contact() {
  return (
    <PageShell title="Contact Niyam Finance" subtitle="Questions, corrections, or feedback about Niyamfin.">
      <p>
        For questions about Niyamfin, email{" "}
        <a href="mailto:hello@niyamfin.com" className="text-sage-700 underline">
          hello@niyamfin.com
        </a>
        . Please do not send sensitive financial details by email.
      </p>
      <p className="mt-8 text-xs text-sage-500">Last updated: 31 May 2026</p>
    </PageShell>
  );
}
