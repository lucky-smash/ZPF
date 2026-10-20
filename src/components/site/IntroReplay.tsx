"use client";

import { intro } from "@/data";
import { requestIntroReplay } from "@/lib/intro";

/**
 * Plays the opening sequence again, from the footer.
 *
 * Reloading would play it too, but this plays it without throwing the
 * page away: it asks the mounted <CameraIntro /> to run again from
 * where the visitor already is. Like a fresh load, the replay fires its
 * own shutter — nothing has to be pressed. It is only
 * useful on the home page — where that component exists — so it keeps
 * itself out of the way elsewhere by going nowhere when nothing answers.
 */
export function IntroReplay() {
  return (
    <button
      type="button"
      onClick={requestIntroReplay}
      data-cursor-label="Replay"
      className="meta link-underline text-ash transition-colors duration-500 hover:text-bone"
    >
      {intro.replay}
    </button>
  );
}
