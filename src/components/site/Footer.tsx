import Image from "next/image";
import Link from "next/link";

import { IntroReplay } from "@/components/site/IntroReplay";
import { brandMark, site } from "@/data";

/**
 * The copyright year reads the clock, which Next cannot prerender on
 * its own. Caching it pins the value at build time and keeps the
 * footer static.
 */
async function currentYear() {
  "use cache";
  return new Date().getFullYear();
}

export async function Footer() {
  const year = await currentYear();

  return (
    <footer className="border-t border-rule-soft">
      <div className="shell flex flex-col gap-10 py-12 md:flex-row md:items-end md:justify-between md:py-16">
        <div>
          <Image
            src={brandMark.src}
            alt=""
            width={brandMark.width}
            height={brandMark.height}
            className="h-10 w-auto"
          />
          <p className="meta mt-5 text-ash">{site.footerNote}</p>
        </div>

        <div className="flex flex-col gap-6 md:items-end">
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-8 gap-y-3">
              {[
                { label: "Work", href: "/#work" },
                { label: "About", href: "/#about" },
                { label: "Contact", href: "/#contact" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="meta link-underline text-bone">
                    {item.label}
                  </Link>
                </li>
              ))}
              {site.socials.map((social) => (
                <li key={social.href}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="meta link-underline text-bone"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
              <li>
                <IntroReplay />
              </li>
            </ul>
          </nav>

          <p className="meta text-ash">
            © {year} {site.legalName}. {site.location}.
          </p>
        </div>
      </div>
    </footer>
  );
}
