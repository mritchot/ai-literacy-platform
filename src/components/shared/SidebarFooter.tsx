// SidebarFooter — the sidebar's bottom control cluster: the
// portfolio-mode indicator + Exit pill, the analytics-dashboard link,
// and the citation / theme / collapse buttons. Split from Sidebar.tsx
// (which keeps the module/section nav tree) — the two halves share
// nothing but the `collapsed` flag.

import { Link } from 'react-router-dom';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { useCitations } from '../../hooks/useCitations';
import { usePlatformMode } from '../../hooks/usePlatformMode';
import { themeToggleMeta, useTheme } from '../../hooks/useTheme';
import { Icon } from './Icon';

export function SidebarFooter({
  collapsed,
  onToggleCollapse,
  onCloseMobile,
  dashboardActive,
}: {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onCloseMobile?: (() => void) | undefined;
  dashboardActive: boolean;
}): JSX.Element {
  // Theme *preference* (not resolved) drives the toggle button so the
  // sun/moon/monitor icon reflects which of the three modes is active.
  // Read directly from the shared theme store — no prop threading.
  const { preference: themePreference, cycle: onCycleTheme } = useTheme();
  // Platform mode drives two footer concerns: the analytics-dashboard
  // link is shown in portfolio mode, and a mode indicator + exit
  // control surfaces whenever the mode is not the default `learner`.
  const { mode } = usePlatformMode();
  const dashboardVisible = mode === 'portfolio';

  return (
    <div className="border-t border-border-light">
      {/* Mode indicator — renders only in portfolio mode (learner
          is the default, no need to announce it). Carries the visible
          Exit control that resets back to learner mode. */}
      <ModeIndicator collapsed={collapsed} />

      <div
        className="flex items-center"
        style={{
          padding: collapsed ? '12px 8px' : '12px 16px',
          flexDirection: collapsed ? 'column' : 'row',
          gap: collapsed ? 6 : 8,
        }}
      >
        {/* Analytics dashboard link — shown in portfolio mode. Active
            state uses the same inset left-border accent as the module
            rows (4D §4.1). */}
        {dashboardVisible &&
          (collapsed ? (
            <Link
              to="/dashboard"
              onClick={onCloseMobile}
              aria-label="Analytics dashboard"
              aria-current={dashboardActive ? 'page' : undefined}
              className="flex h-8 w-8 items-center justify-center rounded-md no-underline hover:bg-surface"
              style={{
                color: dashboardActive ? 'rgb(var(--action))' : 'rgb(var(--tertiary))',
                background: dashboardActive ? 'rgb(var(--white))' : 'transparent',
                boxShadow: dashboardActive ? 'inset 3px 0 0 rgb(var(--action))' : 'none',
              }}
            >
              <Icon name="chart" size={16} />
            </Link>
          ) : (
            <Link
              to="/dashboard"
              onClick={onCloseMobile}
              aria-current={dashboardActive ? 'page' : undefined}
              className="flex flex-1 items-center gap-2.5 rounded-md no-underline hover:bg-surface"
              style={{
                padding: '8px 8px',
                background: dashboardActive ? 'rgb(var(--white))' : 'transparent',
                boxShadow: dashboardActive ? 'inset 3px 0 0 rgb(var(--action))' : 'none',
              }}
            >
              <Icon
                name="chart"
                size={15}
                style={{ color: dashboardActive ? 'rgb(var(--action))' : 'rgb(var(--tertiary))' }}
              />
              <span
                className="font-sans text-[12.5px] font-medium"
                style={{
                  color: dashboardActive ? 'rgb(var(--ink))' : 'rgb(var(--secondary))',
                  fontWeight: dashboardActive ? 600 : 500,
                }}
              >
                Analytics dashboard
              </span>
            </Link>
          ))}
        {!dashboardVisible && !collapsed && (
          // Spacer keeps the theme + collapse buttons right-aligned when the
          // dashboard link is hidden (learner mode).
          <div className="flex-1" />
        )}
        {/* Citation visibility toggle — icon-only in both sidebar
            states, sits beside the theme toggle as a sibling display
            preference. */}
        <CitationToggle />
        {(() => {
          const meta = themeToggleMeta(themePreference);
          return (
            <button
              type="button"
              onClick={onCycleTheme}
              aria-label={meta.label}
              title={meta.label}
              className="flex h-8 w-8 items-center justify-center rounded-md text-tertiary hover:bg-surface hover:text-ink"
            >
              <Icon name={meta.icon} size={16} />
            </button>
          );
        })()}
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="flex h-8 w-8 items-center justify-center rounded-md text-tertiary hover:bg-surface hover:text-ink"
        >
          <Icon name="panelLeft" size={16} />
        </button>
      </div>
    </div>
  );
}

/**
 * Citation visibility toggle. Reads `useCitations()` directly (the
 * hook is a self-contained module-level store — no prop threading or
 * context provider), so this component is self-sufficient.
 *
 * Icon-only in both sidebar states (`h-8 w-8`, identical styling to
 * the theme toggle), placed next to the theme toggle as a sibling
 * display preference. The icon reflects the *current state* (matching
 * the theme toggle's icon=state convention): an open book when
 * citations are visible, a closed book when they're hidden. The label
 * lives in `aria-label` + `title` rather than as visible text — same
 * pattern as the theme toggle.
 */
function CitationToggle(): JSX.Element {
  const { showCitations, toggleCitations } = useCitations();
  const { track } = useAnalytics();

  // Label mirrors the theme toggle's "Theme: light — switch to dark"
  // format: it states the current state, then what a click changes it
  // to. Drives both `aria-label` and the `title` hover tooltip.
  const label = showCitations
    ? 'Sources: visible — switch to hidden'
    : 'Sources: hidden — switch to visible';
  // Open book = sources currently visible, closed book = currently
  // hidden — the icon reflects the current state, not the pending
  // action (consistent with the theme toggle's sun/moon/monitor).
  const iconName = showCitations ? 'book' : 'bookClosed';

  const handleClick = () => {
    // Fire with the NEW state (post-toggle): showCitations is still the
    // pre-click value here, so the new visibility is its inverse.
    track({ type: 'citation_visibility_toggled', payload: { visible: !showCitations } });
    toggleCitations();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      title={label}
      className="flex h-8 w-8 items-center justify-center rounded-md text-tertiary hover:bg-surface hover:text-ink"
    >
      <Icon name={iconName} size={16} />
    </button>
  );
}

/**
 * Mode indicator + exit control. Renders nothing in `learner` mode (the
 * default — no need to announce it). In `portfolio` mode it shows a
 * small pill naming the active mode with an Exit control that calls
 * `resetMode()` to drop back to learner mode.
 *
 * Collapsed sidebar: a compact letter badge (P) that is itself the
 * exit button — clicking it resets to learner mode (the `title` tooltip
 * explains). Expanded sidebar: the full "Portfolio Mode" label + an
 * explicit "Exit" button. Each variant sits in its own lane with a
 * bottom border, separating it from the footer's control row.
 */
function ModeIndicator({ collapsed }: { collapsed: boolean }): JSX.Element | null {
  const { mode, resetMode } = usePlatformMode();
  if (mode === 'learner') return null;

  const label = 'Portfolio Mode';
  const short = 'P';

  if (collapsed) {
    return (
      <div
        className="flex justify-center border-b border-border-light"
        style={{ padding: '8px' }}
      >
        <button
          type="button"
          onClick={resetMode}
          aria-label={`${label} active — exit to learner mode`}
          title={`${label} — click to exit`}
          className="flex h-7 w-7 items-center justify-center rounded-md font-mono text-[11px] font-bold text-secondary hover:bg-[rgb(var(--white))] hover:text-ink"
          style={{ background: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))' }}
        >
          {short}
        </button>
      </div>
    );
  }

  return (
    <div className="border-b border-border-light" style={{ padding: '8px 12px' }}>
      <div
        className="flex items-center justify-between gap-2 rounded-md"
        style={{
          background: 'rgb(var(--surface))',
          border: '1px solid rgb(var(--border))',
          padding: '5px 6px 5px 10px',
        }}
      >
        <span
          className="font-mono text-[10.5px] font-bold uppercase text-secondary"
          style={{ letterSpacing: '0.08em' }}
        >
          {label}
        </span>
        <button
          type="button"
          onClick={resetMode}
          aria-label={`Exit ${label}`}
          title={`Exit ${label}`}
          className="inline-flex items-center gap-1 rounded font-mono text-[10px] font-semibold uppercase text-tertiary hover:bg-[rgb(var(--white))] hover:text-ink"
          style={{ padding: '3px 6px', letterSpacing: '0.06em' }}
        >
          <Icon name="close" size={11} />
          Exit
        </button>
      </div>
    </div>
  );
}
