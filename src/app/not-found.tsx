import Link from "next/link";

import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";

export default function NotFound() {
  return (
    <>
      <Header />
      <main
        id="main"
        className="shell flex min-h-[70svh] flex-col justify-center py-32"
      >
        <p className="meta text-signal">404</p>
        <h1 className="display mt-6 text-[clamp(2.5rem,7vw,6rem)]">
          This frame is missing.
        </h1>
        <p className="mt-6 max-w-md text-base leading-relaxed text-ash">
          The page you were looking for is not here. The work is one click
          away.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/"
            className="meta inline-flex items-center gap-4 bg-bone px-6 py-4 text-ink transition-colors duration-500 hover:bg-signal hover:text-bone"
          >
            Back to the opening frame <span aria-hidden>→</span>
          </Link>
          <Link
            href="/#work"
            className="meta inline-flex items-center gap-4 border border-rule px-6 py-4 text-bone transition-colors duration-500 hover:border-bone"
          >
            Selected work <span aria-hidden>→</span>
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
