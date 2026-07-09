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
  // Hamburger button — the focus-restore target for every drawer-close
  // path (a ref, not a selector lookup, so a label change can't silently
  // break the restore).
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  // Wraps the overlay + drawer; the Tab trap scopes its focusable query
  // to this subtree.
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    menuButtonRef.current?.focus();
  };

  // Close the mobile overlay if the viewport grows past mobile.
  useEffect(() => {
    if (viewport !== 'mobile') setMobileMenuOpen(false);
  }, [viewport]);

  // Mobile drawer keyboard contract (modal dialog pattern): Escape
  // closes it and returns focus to the hamburger; Tab wraps within the
  // overlay + drawer so keyboard focus can't land on the page content
  // behind the modal surface (WCAG 2.4.3). The drawer's close button
  // takes focus on open (see Sidebar); the focusable list is re-queried
  // per keystroke, mirroring ReferencePanel's trap.
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
        return;
      }
      if (e.key !== 'Tab') return;
      const root = drawerRef.current;
      if (!root) return;
      const focusables = root.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0]!;
      const last = focusables[focusables.length - 1]!;
      const active = document.activeElement;
      const inside = active instanceof Node && root.contains(active);
      if (e.shiftKey && (active === first || !inside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !inside)) {
        e.preventDefault();
        first.focus();
      }
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
          <TopBar onOpenMenu={() => setMobileMenuOpen(true)} menuButtonRef={menuButtonRef} />
          {mobileMenuOpen && (
            // Layout-neutral wrapper (children are position:fixed) that
            // scopes the Tab trap to the overlay + drawer subtree.
            <div ref={drawerRef}>
              <button
                type="button"
                aria-label="Close menu overlay"
                onClick={closeMobileMenu}
                className="fixed inset-0 z-40"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
              />
              <Sidebar
                collapsed={false}
                isMobile
                onToggleCollapse={closeMobileMenu}
                onCloseMobile={closeMobileMenu}
              />
            </div>
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
