import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Niyamfin — Financial Planning Portal",
  description:
    "An open, private financial planning suite. Retirement, SIP/goal, and India income-tax calculators. No login, no storage — everything runs in your browser.",
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
