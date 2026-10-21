"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { brandMark, site } from "@/data";
import { MOTION_OK, gsap, useIsomorphicLayoutEffect } from "@/lib/gsap";
import { afterIntro } from "@/lib/intro";

/**
 * The links, and which of them is the action.
 *
 * Three is the whole navigation and it stays three. The reference's
 * own menu is four words and nothing else, and the discipline that
 * buys is that every one of them is legible at 11px over a
 * photograph — which is where this navigation actually lives.
 */
const NAV = [
  { label: "Work", href: "/#work" },
  { label: "About", href: "/#about" },
];

const ACTION = { label: "Start a project", href: "/#contact" };

export function Header() {
  const [open, setOpen] = useState(false);
  const [lifted, setLifted] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  /* Swap to the solid header once the hero is behind us. */
  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Restrained entrance: the navigation settles in after the hero type.
     This animates the inner bar, never the <header> itself — a transform
     on the header would turn it into the containing block for the
     fixed-position menu panel below, and the panel would collapse to the
     height of the bar. clearProps removes the inline transform once the
     entrance is done. */
  useIsomorphicLayoutEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      const entrance = gsap.from(el, {
        opacity: 0,
        y: -16,
        duration: 1,
        delay: 0.5,
        clearProps: "transform,opacity",
        paused: true,
      });
      /* Behind the opening sequence there is nothing to see, so the
         navigation arrives with the hero it belongs to. */
      return afterIntro(() => entrance.play());
    });
    return () => mm.revert();
  }, []);

  const close = useCallback(() => setOpen(false), []);

  /* While the menu is open: lock the page, close on Escape, and keep
     focus inside the panel so keyboard users do not fall behind it. */
  useEffect(() => {
    if (!open) return;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        toggleRef.current?.focus();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    panelRef.current?.querySelector<HTMLElement>("a")?.focus();

    return () => {
      body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        lifted && !open
          ? "border-b border-rule-soft bg-ink/75 backdrop-blur-xl"
          : "border-b border-transparent"
      }`}
    >
      <div
        ref={barRef}
        className="shell relative z-50 flex h-16 items-center justify-between md:h-20"
      >
        <Link
          href="/"
          onClick={close}
          aria-label={`${site.name} — ${site.legalName}, home`}
          className="flex items-center gap-3"
        >
          <Image
            src={brandMark.src}
            alt=""
            width={brandMark.width}
            height={brandMark.height}
            priority
            className="h-7 w-auto md:h-8"
          />
          {/* The company name beside the monogram, in the widest
              setting the type system has. One phrase, standing on its
              own, which is the only place meta-wide belongs. */}
          <span className="meta meta-wide hidden text-ash sm:block">
            {site.legalName}
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-9">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="meta link-underline text-bone">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={ACTION.href}
                className="pill meta h-10 min-h-0 px-5"
              >
                {ACTION.label}
              </Link>
            </li>
          </ul>
        </nav>

        <button
          ref={toggleRef}
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="meta -mr-1 flex items-center gap-3 px-1 py-2 text-bone md:hidden"
        >
          {open ? "Close" : "Menu"}
          <span aria-hidden className="relative block h-3 w-5">
            <span
              className={`absolute left-0 block h-px w-full bg-current transition-transform duration-300 ${
                open ? "top-1.5 rotate-45" : "top-0"
              }`}
            />
            <span
              className={`absolute left-0 block h-px w-full bg-current transition-transform duration-300 ${
                open ? "top-1.5 -rotate-45" : "top-3"
              }`}
            />
          </span>
        </button>
      </div>

      {/* Full-screen menu, phones only. */}
      <div
        id="mobile-menu"
        ref={panelRef}
        hidden={!open}
        className="fixed inset-0 z-40 flex flex-col justify-between overflow-y-auto bg-ink px-[var(--gutter)] pb-12 pt-28 md:hidden"
      >
        <nav aria-label="Mobile">
          <ul className="flex flex-col gap-2">
            {[...NAV, ACTION].map((item, index) => (
              <li key={item.href} className="border-b border-rule-soft py-4">
                <Link
                  href={item.href}
                  onClick={close}
                  className="display flex items-baseline gap-5 text-[clamp(2rem,10vw,2.75rem)]"
                >
                  <span className="meta meta-wide text-signal">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-12 flex flex-col gap-4">
          <a href={`mailto:${site.email}`} className="text-base text-bone">
            {site.email}
          </a>
          <div className="flex gap-7">
            {site.socials.map((social) => (
              <a
                key={social.href}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="meta text-ash"
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
