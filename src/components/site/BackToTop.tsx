"use client";

import { useEffect, useState } from "react";

import { scrollTo } from "@/lib/smooth-scroll";

/** Appears once the visitor is well past the opening frame. */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 1.5);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => scrollTo(0)}
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      className={`fixed bottom-6 right-[var(--gutter)] z-50 flex size-12 items-center justify-center border border-rule bg-ink/80 text-bone backdrop-blur-sm transition-all duration-500 hover:border-bone ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <span aria-hidden>↑</span>
    </button>
  );
}
