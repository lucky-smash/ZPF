import { EnquiryForm } from "@/components/ui/EnquiryForm";
import { Reveal } from "@/components/ui/Reveal";
import { SectionIntro } from "@/components/ui/SectionIntro";
import { contact, site } from "@/data";

/**
 * SECTION 10 — CONTACT
 *
 * Every route the company listed: phone, WhatsApp, email and social.
 * All of them real, all of them live links.
 */
export function Contact() {
  return (
    <section
      id="contact"
      className="shell scroll-mt-24 border-t border-rule-soft beat"
    >
      <SectionIntro index="10" eyebrow="Start a project" />

      <Reveal className="mt-10 md:mt-16">
        <h2 className="display text-[clamp(2.75rem,9vw,8rem)]">
          {contact.headline[0]}
          <br />
          <span className="text-signal">{contact.headline[1]}</span>
        </h2>
      </Reveal>

      <Reveal delay={0.1} className="mt-6">
        <p className="meta text-ash">{contact.supporting}</p>
      </Reveal>

      <div className="mt-14 grid grid-cols-1 gap-14 md:mt-20 md:grid-cols-12 md:gap-10">
        {/* Direct routes. Pinned alongside the form on desktop: the
           enquiry fields run some 400px past the end of this column,
           and letting it scroll away left a void down the left of the
           section. Sticky keeps the two balanced without forcing them
           to the same height. */}
        <div className="md:col-span-5 md:sticky md:top-28 md:self-start">
          <Reveal stagger={0.08}>
            <p className="meta contact-head">For work queries</p>

            {site.phones.map((phone) => (
              <div key={phone.e164} className="contact-row">
                <a
                  href={`tel:+${phone.e164}`}
                  className="link-underline text-lg text-bone md:text-xl"
                >
                  {phone.display}
                </a>
                <a
                  href={phone.whatsappUrl ?? `https://wa.me/${phone.e164}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="meta text-ash transition-colors duration-500 hover:text-signal"
                >
                  WhatsApp ↗
                </a>
              </div>
            ))}

            <div className="contact-row">
              <a
                href={`mailto:${site.email}`}
                className="link-underline break-all text-lg text-bone md:text-xl"
              >
                {site.email}
              </a>
            </div>

            <div className="contact-row contact-row-social">
              {site.socials.map((social) => (
                <a
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="meta link-underline text-bone"
                >
                  {social.label} ↗
                </a>
              ))}
            </div>

            <p className="contact-note">
              Based in {site.location}. Available for work on location.
            </p>
          </Reveal>
        </div>

        {/* Enquiry form. */}
        <div className="md:col-span-6 md:col-start-7">
          <Reveal y={30}>
            <p className="meta contact-head">Or tell us about the project</p>
            <EnquiryForm />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
