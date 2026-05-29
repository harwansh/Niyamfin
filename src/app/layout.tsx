import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Niyamfin - Financial Planning Portal",
  description: "An open, private financial planning suite. No login, no storage.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="grain font-sans antialiased">{children}</body>
    </html>
  );
}
