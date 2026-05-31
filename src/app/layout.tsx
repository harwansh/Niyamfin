import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Niyamfin — Financial Health Portal",
  description:
    "A free, private, no-login educational tool that reads your overall financial health — net worth, ratios, retirement, insurance gaps, budget, and goals. Nothing is stored. Not financial advice.",
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
