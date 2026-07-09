// TopBar — fixed mobile top bar that replaces the sidebar at <768px (Section 6.5).
// 56px tall. Hamburger left, current module label centered, theme toggle right.

import { useLocation } from 'react-router-dom';
import { MODULES } from '../../data/program';
import { themeToggleMeta, useTheme } from '../../hooks/useTheme';
import { Icon } from './Icon';

interface TopBarProps {
  onOpenMenu: () => void;
  /** Hamburger ref — PlatformShell restores focus here on drawer close. */
  menuButtonRef?: React.RefObject<HTMLButtonElement> | undefined;
}

function currentModuleLabel(pathname: string): { seq: string; label: string } | null {
  const m = pathname.match(/^\/module\/(\d+)/);
  if (!m) return null;
  const id = Number.parseInt(m[1] ?? '', 10);
  const mod = MODULES.find((x) => x.id === id);
  return mod ? { seq: mod.seq, label: mod.label.toUpperCase() } : null;
}

// Extract the section number from a /module/X/section/Y route, or null
// for the module landing page (/module/X with no section). Used to
// append a small "· S3" cue to the TopBar so mobile learners can see
// which section they're on without opening the sidebar tray.
function currentSectionId(pathname: string): number | null {
  const m = pathname.match(/^\/module\/\d+\/section\/(\d+)/);
  if (!m) return null;
  const id = Number.parseInt(m[1] ?? '', 10);
  return Number.isFinite(id) ? id : null;
}

export function TopBar({ onOpenMenu, menuButtonRef }: TopBarProps): JSX.Element {
  // Theme *preference* (not resolved) — drives the toggle's icon +
  // label so system / light / dark are all distinguishable. Read from
  // the shared theme store directly.
  const { preference: themePreference, cycle: onCycleTheme } = useTheme();
  const location = useLocation();
  const current = currentModuleLabel(location.pathname);
  const currentSection = currentSectionId(location.pathname);
  const themeMeta = themeToggleMeta(themePreference);

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-border bg-[rgb(var(--sidebar-bg))]"
      style={{ height: 56, padding: '0 16px' }}
    >
      <button
        ref={menuButtonRef}
        type="button"
        onClick={onOpenMenu}
        aria-label="Open program menu"
        className="flex h-11 w-11 items-center justify-center rounded-md text-ink hover:bg-surface"
      >
        <Icon name="menu" size={22} />
      </button>

      <div
        className="flex min-w-0 items-center gap-2 truncate font-mono text-[12px] font-bold uppercase"
        style={{ color: 'rgb(var(--ink))', letterSpacing: '0.08em' }}
      >
        {current ? (
          <>
            <span>{current.seq}</span>
            <span className="font-medium" style={{ color: 'rgb(var(--muted))' }}>
              —
            </span>
            <span className="truncate">{current.label}</span>
            {currentSection !== null && (
              <>
                <span className="font-medium" style={{ color: 'rgb(var(--muted))' }}>
                  ·
                </span>
                <span>S{currentSection}</span>
              </>
            )}
          </>
        ) : (
          <span className="font-sans text-[14px] font-bold normal-case tracking-normal">
            AI Literacy
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={onCycleTheme}
        aria-label={themeMeta.label}
        title={themeMeta.label}
        className="flex h-11 w-11 items-center justify-center rounded-md text-ink hover:bg-surface"
      >
        <Icon name={themeMeta.icon} size={20} />
      </button>
    </header>
  );
}
