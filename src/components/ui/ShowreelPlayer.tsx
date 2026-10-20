"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import type { ShowreelConfig } from "@/data";

/**
 * Plays the showreel.
 *
 * Three honest states, chosen by `showreel.provider` in src/data/site.ts:
 *
 *  youtube — the poster is a frame from the real film. Pressing play
 *            swaps in the YouTube player, which brings its own
 *            play/pause and mute controls. Nothing loads from YouTube
 *            until that click.
 *  file    — a self-hosted video with the site's own minimal controls.
 *  none    — a clearly marked placeholder. No fake player, no fake
 *            progress bar, and the play control is not rendered.
 */
export function ShowreelPlayer({ config }: { config: ShowreelConfig }) {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isPlayable = config.provider !== "none" && Boolean(config.source);

  /* The poster is a cinemascope frame from the film itself, so it fills
     its own ratio rather than sitting in a letterboxed 16:9 box. Once
     the YouTube player takes over, the frame opens out to 16:9. */
  const posterRatio = `${config.poster.width} / ${config.poster.height}`;

  /* ---------------------------------------------------------------- */
  /* Self-hosted file: real element, real controls.                   */
  /* ---------------------------------------------------------------- */
  if (config.provider === "file" && config.source) {
    const toggle = () => {
      const video = videoRef.current;
      if (!video) return;
      if (video.paused) {
        void video.play();
        setPlaying(true);
      } else {
        video.pause();
        setPlaying(false);
      }
    };

    const toggleMute = () => {
      const video = videoRef.current;
      if (!video) return;
      video.muted = !video.muted;
      setMuted(video.muted);
    };

    return (
      <div className="relative aspect-video w-full overflow-hidden bg-charcoal">
        <video
          ref={videoRef}
          poster={config.poster.src}
          preload="none"
          playsInline
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          className="h-full w-full object-cover"
        >
          <source src={config.source} />
          Your browser cannot play this video.{" "}
          {config.watchUrl ? <a href={config.watchUrl}>Watch it here.</a> : null}
        </video>

        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 bg-gradient-to-t from-ink/90 to-transparent p-4 md:p-6">
          <button
            type="button"
            onClick={toggle}
            className="meta flex items-center gap-3 text-bone"
          >
            <span
              aria-hidden
              className="flex size-10 items-center justify-center rounded-full border border-rule"
            >
              {playing ? "❚❚" : "▶"}
            </span>
            {playing ? "Pause" : "Play"}
          </button>
          <button type="button" onClick={toggleMute} className="meta text-bone">
            {muted ? "Unmute" : "Mute"}
          </button>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /* YouTube: poster first, player on demand.                         */
  /* ---------------------------------------------------------------- */
  return (
    <div
      className="relative w-full overflow-hidden bg-charcoal transition-[aspect-ratio] duration-700"
      style={{ aspectRatio: playing ? "16 / 9" : posterRatio }}
    >
      {playing && config.provider === "youtube" && config.source ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${config.source}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
          title={`${config.title} — ŹPF`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <>
          <Image
            src={config.poster.src}
            alt={config.poster.alt}
            fill
            sizes="(max-width: 48rem) 100vw, 90vw"
            placeholder={config.poster.blurDataURL ? "blur" : "empty"}
            blurDataURL={config.poster.blurDataURL}
            className="object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/30"
          />

          {isPlayable ? (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              data-cursor-label="PLAY"
              className="group absolute inset-0 flex items-end p-5 md:p-8"
            >
              <span className="sr-only">
                Play the ŹPF showreel in the YouTube player
              </span>
              <span className="flex items-center gap-4">
                <span
                  aria-hidden
                  className="flex size-14 items-center justify-center rounded-full border border-bone/50 bg-ink/40 text-bone backdrop-blur-sm transition-all duration-700 group-hover:scale-110 group-hover:border-signal group-hover:bg-signal md:size-20"
                >
                  <span className="ml-0.5 text-base md:text-lg">▶</span>
                </span>
                <span className="meta text-bone">Play showreel</span>
              </span>
            </button>
          ) : (
            /* provider: "none" — nothing to play, and we say so. */
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
              <p className="meta text-signal">Showreel not configured</p>
              <p className="max-w-sm text-sm text-ash">
                Add the film in{" "}
                <code className="text-bone">src/data/site.ts</code> by setting{" "}
                <code className="text-bone">showreel.provider</code> and{" "}
                <code className="text-bone">showreel.source</code>.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
