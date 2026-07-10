import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

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
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-bg text-ink antialiased">
        <header className="border-b border-line">
          <div className="mx-auto max-w-[1600px] px-5 sm:px-8 py-5 flex items-center justify-between">
            <Link href="/" className="flex items-baseline gap-2 group">
              <span className="text-lg font-semibold tracking-tight">
                study<span className="text-accent">new</span>ads
              </span>
              <span className="hidden sm:inline text-xs font-mono-tag text-ink-dim uppercase">
                / last 24 months
              </span>
            </Link>
            <div className="flex items-center gap-1.5 text-xs font-mono-tag uppercase text-ink-dim">
              <span className="h-1.5 w-1.5 rounded-full bg-accent pulse-dot" />
              updated continuously
            </div>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-line">
          <div className="mx-auto max-w-[1600px] px-5 sm:px-8 py-8 text-xs text-ink-dim flex flex-col sm:flex-row gap-2 sm:justify-between">
            <p>
              A non-commercial study archive. Creative belongs to the
              respective brands and is republished here for commentary and
              reference.
            </p>
            <p className="font-mono-tag uppercase">
              sourced by an automated research pipeline
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
