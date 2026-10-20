/**
 * ------------------------------------------------------------------
 * THE OPENING SEQUENCE — one source of truth for its state
 * ------------------------------------------------------------------
 * The sequence is armed by a blocking script in the document head,
 * before the first paint, which sets two attributes on <html>:
 *
 *   data-intro="armed"  the overlay is displayed
 *   data-intro-lock     the page behind it is held still
 *
 * Everything else — the overlay, the hero's entrance, the header —
 * reads those attributes rather than keeping its own copy of the
 * state. Both default to absent, so the page is the website unless
 * something actively arms the intro: if the script never runs, if
 * storage is unavailable, or if React never hydrates, nobody is held
 * on a screen that cannot proceed.
 *
 * Once armed, the sequence needs nothing from the visitor — the
 * shutter fires on its own a beat after the camera lands, and the
 * press and the skip are there for people who would rather not wait.
 * See ONCE_PER_SESSION below for how often it is armed at all.
 * ------------------------------------------------------------------
 */

/**
 * Does the opening play on every load, or once per browsing session?
 *
 * Every load. It is the company's handshake, it is short, and it is
 * skippable — and a reload is the one gesture that asks to see the
 * page from the top again.
 *
 * This is the only line that decides it. Set it to `true` and a
 * visitor gets the sequence once per tab instead: the storage below
 * is written either way, so nothing else has to change.
 *
 * Note that neither setting replays it on an in-page navigation.
 * Coming back to the home page from a project is a client-side route
 * change, the boot script below does not run again, and the overlay
 * stands down — so the sequence is tied to actually loading the site,
 * which is what it is for.
 */
const ONCE_PER_SESSION = false;

/** Where that "already seen" mark is kept, when it is consulted. */
const SESSION_KEY = "zpf:intro";

/** Fired when the website takes over, so held-back entrances can play. */
export const INTRO_DONE_EVENT = "zpf:intro-done";

/** Asks the mounted sequence to play again — see <IntroReplay />. */
export const INTRO_REPLAY_EVENT = "zpf:intro-replay";

/** How long the script waits for the sequence to take over before it
 *  hands the page back. Generous: a slow phone may still be hydrating. */
const WATCHDOG_MS = 8000;

/** What <CameraIntro /> writes to say it is alive. A real value, not an
 *  empty one: `dataset.introReady` of "" is falsy, and a watchdog that
 *  tests it for truth would tear the sequence down while it played. */
export const READY = "1";

/** Compiled out entirely when the sequence plays on every load. */
const SESSION_GATE = ONCE_PER_SESSION
  ? `try{if(sessionStorage.getItem(${JSON.stringify(
      SESSION_KEY,
    )})==="done")return}catch(e){}`
  : "";

/**
 * Runs before the first paint, inline. Deliberately tiny and
 * defensive — every failure path ends with the plain website.
 *
 * It arms nothing anywhere but the home page. The script is in the root
 * layout, because that is the only place guaranteed to be parsed before
 * anything paints, but <CameraIntro /> lives on the home page alone —
 * so arming it on a project page would lock the scroll with nothing
 * there to unlock it. Anyone arriving straight at /work/… from a search
 * result or a shared link gets the page, immediately.
 */
export const INTRO_BOOT_SCRIPT = `(function(){try{var p=location.pathname;if(p!=="/"&&p!=="")return;var d=document.documentElement;${SESSION_GATE}d.dataset.intro="armed";d.dataset.introLock="1";setTimeout(function(){if(d.dataset.introReady!==${JSON.stringify(
  READY,
)}){delete d.dataset.intro;delete d.dataset.introLock}},${WATCHDOG_MS})}catch(e){}})();`;

/** True while the opening sequence owns the screen. */
export function introPending() {
  return (
    typeof document !== "undefined" &&
    document.documentElement.dataset.intro === "armed"
  );
}

export function markIntroSeen() {
  try {
    sessionStorage.setItem(SESSION_KEY, "done");
  } catch {
    /* Private browsing can refuse storage. The sequence simply plays
       again next time, which is a far smaller problem than throwing. */
  }
}

export function clearIntroSeen() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* As above. */
  }
}

export function requestIntroReplay() {
  window.dispatchEvent(new Event(INTRO_REPLAY_EVENT));
}

/**
 * Holds an entrance back until the opening sequence has handed over,
 * and runs it immediately when there is no sequence playing.
 *
 * It is what makes the headline, the navigation and the hero buttons
 * arrive *after* the film opens out rather than behind it.
 *
 * Returns its own teardown. A long stop-gap timer plays the entrance
 * regardless if the sequence never finishes, so nothing on the page can
 * be stranded invisible by a failed animation.
 */
export function afterIntro(play: () => void): () => void {
  if (!introPending()) {
    play();
    return () => {};
  }

  let spent = false;
  let timer = 0;

  const clear = () => {
    window.clearTimeout(timer);
    window.removeEventListener(INTRO_DONE_EVENT, run);
  };

  function run() {
    if (spent) return;
    spent = true;
    clear();
    play();
  }

  timer = window.setTimeout(run, 15000);
  window.addEventListener(INTRO_DONE_EVENT, run);

  return () => {
    spent = true;
    clear();
  };
}
