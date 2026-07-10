import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { InfoPanel } from "@/components/InfoPanel";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

const SITE_NAME = "studynewads";

export const metadata: Metadata = {
  title: `${SITE_NAME} — a living archive of ads from the last 2 years`,
  description:
    "A continuously updated archive of notable digital ad campaigns, researched and structured by an automated pipeline.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const year = new Date().getFullYear();

  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-full bg-bg text-ink antialiased">
        <div className="pointer-events-none fixed inset-0 z-40 text-xs font-mono-tag uppercase tracking-wide">
          <span className="pointer-events-auto absolute left-5 top-5 text-ink-dim sm:left-8 sm:top-8">
            © {year}
          </span>
          <Link
            href="/"
            className="pointer-events-auto absolute left-1/2 top-5 -translate-x-1/2 text-sm font-semibold normal-case tracking-tight text-ink sm:top-8"
          >
            studynewads
          </Link>
          <div className="pointer-events-auto absolute right-5 top-5 sm:right-8 sm:top-8">
            <InfoPanel />
          </div>
          <span className="pointer-events-auto absolute left-5 bottom-5 flex items-center gap-1.5 text-ink-dim sm:left-8 sm:bottom-8">
            <span className="h-1.5 w-1.5 rounded-full bg-ink pulse-dot" />
            <span className="hidden sm:inline">updated continuously</span>
          </span>
          <Link
            href="/"
            className="pointer-events-auto absolute right-5 bottom-5 text-ink-dim transition hover:text-ink sm:right-8 sm:bottom-8"
          >
            Index
          </Link>
        </div>

        <main className="min-h-screen pt-16 pb-16 sm:pt-20 sm:pb-20">
          {children}
        </main>
      </body>
    </html>
  );
}
