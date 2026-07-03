// PlatformShell — Component 4E. Wraps every route with the sidebar (or
// mobile top bar + overlay), provides a <main> landmark, and renders the
// matched child route via <Outlet/>. Sidebar default state per viewport is
// resolved from architecture Section 6.2.

import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { STORAGE_KEYS } from '../../constants/storage-keys';
import { useViewport } from '../../hooks/useViewport';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { CompetencyDarkStyles } from './CompetencyDot';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function PlatformShell(): JSX.Element {
  const viewport = useViewport();

  // Persist user-driven collapse intent only — viewport default still wins
  // when the user hasn't expressed a preference.
  const [explicitCollapsed, setExplicitCollapsed] = useLocalStorage<boolean | null>(
    STORAGE_KEYS.SIDEBAR_COLLAPSED,
    null,
    { validate: (v): v is boolean | null => typeof v === 'boolean' || v === null },
  );

  const defaultCollapsed = viewport === 'tablet';
  const collapsed = explicitCollapsed ?? defaultCollapsed;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close the mobile overlay if the viewport grows past mobile.
  useEffect(() => {
    if (viewport !== 'mobile') setMobileMenuOpen(false);
  }, [viewport]);

  // Mobile drawer keyboard contract: Escape closes it, and focus
  // returns to the hamburger button so the keyboard user isn't dropped
  // behind the (now removed) overlay. The drawer's close button takes
  // focus on open (see Sidebar).
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      setMobileMenuOpen(false);
      (document.querySelector('[aria-label="Open program menu"]') as HTMLElement | null)?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileMenuOpen]);

  // Focus/scroll management on route change (WCAG 2.4.3): pages that
  // don't manage their own focus (landing, hubs, dashboard, thank-you,
  // reading artifacts) reset scroll and move focus to <main> so SR and
  // keyboard users get the new page announced from the top. Module
  // sections and assessment items move focus to their headings
  // themselves — skip those routes. Skipped on first render: initial
  // page load should keep the browser's default document focus.
  const location = useLocation();
  const isFirstRoute = useRef(true);
  useEffect(() => {
    if (isFirstRoute.current) {
      isFirstRoute.current = false;
      return;
    }
    if (/^\/module\/\d+\/section\//.test(location.pathname)) return;
    if (/^\/(pre|post)-assessment/.test(location.pathname)) return;
    window.scrollTo(0, 0);
    document.getElementById('main-content')?.focus({ preventScroll: true });
  }, [location.pathname]);

  // Ctrl/Cmd+B to toggle sidebar (Section 9.2).
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        if (viewport === 'mobile') setMobileMenuOpen((prev) => !prev);
        else setExplicitCollapsed(!collapsed);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [viewport, collapsed, setExplicitCollapsed]);

  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Skip link (WCAG 2.4.1) — first tab stop; visually hidden until
          focused. A plain href="#main-content" anchor would fight
          HashRouter, so it focuses programmatically. */}
      <button
        type="button"
        onClick={() => document.getElementById('main-content')?.focus()}
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-action focus:px-4 focus:py-2.5 focus:font-sans focus:text-[13px] focus:font-semibold focus:text-[rgb(var(--white))]"
      >
        Skip to main content
      </button>
      <CompetencyDarkStyles />

      {viewport === 'mobile' ? (
        <>
          <TopBar onOpenMenu={() => setMobileMenuOpen(true)} />
          {mobileMenuOpen && (
            <>
              <button
                type="button"
                aria-label="Close menu overlay"
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 z-40"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
              />
              <Sidebar
                collapsed={false}
                isMobile
                onToggleCollapse={() => setMobileMenuOpen(false)}
                onCloseMobile={() => setMobileMenuOpen(false)}
              />
            </>
          )}
        </>
      ) : (
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={() => setExplicitCollapsed(!collapsed)}
        />
      )}

      <main
        id="main-content"
        tabIndex={-1}
        className="min-w-0 flex-1 focus:outline-none"
        style={{
          paddingTop: viewport === 'mobile' ? 56 : 0,
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
