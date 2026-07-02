// PlatformShell — Component 4E. Wraps every route with the sidebar (or
// mobile top bar + overlay), provides a <main> landmark, and renders the
// matched child route via <Outlet/>. Sidebar default state per viewport is
// resolved from architecture Section 6.2.

import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
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
    'ail.sidebar-collapsed',
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
        className="min-w-0 flex-1"
        style={{
          paddingTop: viewport === 'mobile' ? 56 : 0,
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
