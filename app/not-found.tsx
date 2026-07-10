import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[1600px] px-5 sm:px-8 py-24 text-center">
      <p className="text-sm font-mono-tag uppercase text-ink-dim">404</p>
      <h1 className="mt-2 text-2xl font-semibold">Nothing archived here.</h1>
      <Link
        href="/"
        className="mt-6 inline-block text-sm underline decoration-line underline-offset-4 hover:text-accent hover:decoration-accent transition"
      >
        Back to the archive
      </Link>
    </div>
  );
}
