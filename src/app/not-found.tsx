import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative z-10 mx-auto flex min-h-[70vh] max-w-5xl flex-col items-center justify-center px-5 pb-24 pt-12 text-center">
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sage-100 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-sage-700">
        <span className="h-1.5 w-1.5 rounded-full bg-clay" aria-hidden="true" /> Page not found
      </div>

      <h1 className="font-display text-7xl font-700 leading-none tracking-tight text-ink sm:text-9xl">
        4<span className="text-sage-600">0</span>4
      </h1>

      <p className="mt-4 max-w-md text-lg leading-relaxed text-sage-700">
        This page doesn&apos;t exist. You may have followed a broken link, or the address may have changed.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-xl bg-sage-900 px-6 py-3 text-sm font-semibold text-paper shadow-card transition hover:bg-sage-700"
        >
          Go to Niyamfin →
        </Link>
        <Link
          href="/methodology"
          className="rounded-xl border border-sage-100 bg-white/70 px-6 py-3 text-sm font-semibold text-sage-700 transition hover:border-sage-400"
        >
          Methodology
        </Link>
      </div>

      <p className="mt-10 text-xs text-sage-500">
        If you believe this is an error, please{" "}
        <Link href="/contact" className="underline underline-offset-2 hover:text-sage-700">
          contact us
        </Link>
        .
      </p>
    </main>
  );
}
