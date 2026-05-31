import Link from "next/link";

export default function PageShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <main className="relative z-10 mx-auto max-w-3xl px-5 pb-24 pt-10 sm:pt-14">
      <Link href="/" className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-sage-700 transition hover:text-sage-900">
        ← Back to Niyamfin
      </Link>
      <h1 className="font-display text-4xl font-700 leading-tight tracking-tight text-ink sm:text-5xl">{title}</h1>
      {subtitle && <p className="mt-3 text-lg leading-relaxed text-sage-700">{subtitle}</p>}
      <div className="prose-niyam mt-8 space-y-5 text-[15px] leading-relaxed text-sage-700">{children}</div>
      <SiteFooter />
    </main>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-sage-100 pt-6">
      <nav className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-sage-600">
        <Link href="/" className="transition hover:text-sage-900">Home</Link>
        <Link href="/about" className="transition hover:text-sage-900">About</Link>
        <Link href="/methodology" className="transition hover:text-sage-900">Methodology</Link>
        <Link href="/privacy" className="transition hover:text-sage-900">Privacy</Link>
        <Link href="/terms" className="transition hover:text-sage-900">Terms</Link>
        <Link href="/contact" className="transition hover:text-sage-900">Contact</Link>
      </nav>
      <p className="mt-4 text-xs leading-relaxed text-sage-600">
        Niyamfin provides educational estimates based on standard personal-finance principles. It is not financial,
        investment, insurance, or tax advice, and using it does not create an advisory relationship. Verify any decision
        with a SEBI-registered investment adviser or a qualified professional. All calculations run in your browser; no
        data is collected or stored.
      </p>
    </footer>
  );
}

export function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-xl font-600 text-ink">{children}</h2>;
}
