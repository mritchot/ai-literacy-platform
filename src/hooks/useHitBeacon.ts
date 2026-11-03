// The course's half of the ritchot.me page count. Reports each route to the
// website Worker's /hit endpoint once a person interacts with it, so course
// views meet the same test as site pages: a request alone counts for nothing.
// Sends the route and the external referrer; sets no cookie and stores nothing.

import { useEffect } from 'react';

// The app reaches /hit only when served under this path on ritchot.me. The dev
// server and the file:// build have no endpoint to report to.
const COURSE_PATH = '/courses/ai-literacy/';

// The site's beacon also listens for scroll. Here a route change scrolls the
// page itself (PlatformShell), and that would count a route nobody touched.
// Pointer, wheel, key, and touch events cover every way a person scrolls.
const EVENTS = ['pointermove', 'pointerdown', 'wheel', 'keydown', 'touchstart'] as const;

// document.referrer never changes in a single-page app, so only the first
// report of a visit carries it. Otherwise every route would credit the same
// external site.
let referrerSent = false;

function report(routePath: string): void {
  const route = routePath.replace(/\/+$/, '');
  const body = new URLSearchParams({
    p: route ? `${COURSE_PATH}#${route}` : COURSE_PATH,
    r: referrerSent ? '' : document.referrer,
  });
  referrerSent = true;
  if (!navigator.sendBeacon?.('/hit', body)) {
    fetch('/hit', { method: 'POST', body, keepalive: true }).catch(() => {
      // Counting never affects the page.
    });
  }
}

/** Reports `routePath` on the first interaction after it renders. A route left
 *  before any interaction goes unreported, which also skips redirects. */
export function useHitBeacon(routePath: string): void {
  useEffect(() => {
    if (navigator.webdriver || !window.location.pathname.startsWith(COURSE_PATH)) return;
    const stop = (): void => {
      for (const e of EVENTS) window.removeEventListener(e, send, true);
    };
    function send(): void {
      stop();
      report(routePath);
    }
    for (const e of EVENTS) window.addEventListener(e, send, { capture: true, passive: true });
    return stop;
  }, [routePath]);
}
