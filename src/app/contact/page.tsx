import PageShell, { H2 } from "@/components/PageShell";

export const metadata = { title: "Contact — Niyamfin" };

export default function Contact() {
  return (
    <PageShell title="Contact" subtitle="Questions, corrections, or feedback about the tool.">
      <p>
        Niyamfin is an educational project. If you have feedback, spot an error in a calculation, or have a question
        about how something works, we&apos;d like to hear it.
      </p>
      <H2>Get in touch</H2>
      <p>
        Email:{" "}
        <a href="mailto:Hello@niyamfin.com" className="text-sage-700 underline">
          Hello@niyamfin.com
        </a>
      </p>
      <H2>Please note</H2>
      <p>
        We cannot provide personalised financial, investment, insurance, or tax advice over email — for that, please
        consult a SEBI-registered investment adviser or a qualified professional. Do not send sensitive personal or
        financial details; we don&apos;t need them and don&apos;t store them.
      </p>
    </PageShell>
  );
}
