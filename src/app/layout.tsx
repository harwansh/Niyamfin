import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Niyamfin — Private Financial Health Calculator for India",
  description:
    "Estimate your net worth, emergency fund, debt ratios, insurance gap, and retirement readiness privately in your browser. No login. No financial inputs stored on our servers. Not financial advice.",
  openGraph: {
    title: "Niyamfin — Private Financial Health Calculator for India",
    description:
      "Get a private, browser-only snapshot of your financial health — net worth, emergency cover, retirement gap, insurance, and goals. No login. Nothing saved.",
    url: "https://niyamfin.com",
    siteName: "Niyamfin",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Niyamfin — Free Financial Health Check",
    description:
      "Private, browser-only financial health snapshot. Net worth, retirement gap, insurance check, goals — computed instantly. No login. Nothing stored.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Spline+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="grain font-sans antialiased">{children}</body>
    </html>
  );
}
