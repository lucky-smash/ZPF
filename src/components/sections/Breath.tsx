import { Figure } from "@/components/ui/Figure";
import { Parallax } from "@/components/ui/Parallax";
import { Reveal } from "@/components/ui/Reveal";
import { breath } from "@/data";

/**
 * SECTION 09 — A VISUAL BREATH
 *
 * One full-width frame between the testimonials and the invitation to
 * get in touch. A pause, not a filler panel.
 */
export function Breath() {
  return (
    <section
      aria-label="Look closer"
      className="relative flex min-h-[70svh] items-end overflow-hidden md:min-h-[85svh]"
    >
      <div className="absolute inset-0 -z-10">
        <Parallax className="h-full w-full" distance={14}>
          <Figure
            asset={breath.image}
            ratio="auto"
            sizes="100vw"
            quality={70}
            className="h-[115%] w-full"
            position="50% 45%"
          />
        </Parallax>
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/60"
        />
      </div>

      <div className="shell pb-14 pt-32 md:pb-20">
        <Reveal y={30}>
          <p className="display max-w-[16ch] text-[clamp(2rem,5.5vw,4.5rem)]">
            {breath.headline}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
