// Reduced-motion-aware scroll behavior. The CSS reduced-motion rule in
// styles/index.css only zeroes CSS animation/transition durations —
// JS-initiated smooth scrolling (scrollIntoView / scrollTo / scrollBy)
// has to consult the media query itself. Query is evaluated per call so
// a mid-session OS-setting change is respected.
export function scrollBehavior(): ScrollBehavior {
  return typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'auto'
    : 'smooth';
}
