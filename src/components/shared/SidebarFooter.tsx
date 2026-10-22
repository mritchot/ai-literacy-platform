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
  isMobile,
  onToggleCollapse,
  onCloseMobile,
  dashboardActive,
}: {
  collapsed: boolean;
  isMobile: boolean;
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

      {/* Expanded sidebar: the dashboard link gets its own row, so the
          control row below has room for the Sources toggle's visible
          label. Active state uses the same inset left-border accent as
          the module rows (4D §4.1). */}
      {dashboardVisible && !collapsed && (
        <div style={{ padding: '8px 16px 0' }}>
          <Link
            to="/dashboard"
            onClick={onCloseMobile}
            aria-current={dashboardActive ? 'page' : undefined}
            className="flex items-center gap-2.5 no-underline hover:bg-surface"
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
        </div>
      )}

      <div
        className="flex items-center"
        style={{
          padding: collapsed ? '12px 8px' : '12px 16px',
          flexDirection: collapsed ? 'column' : 'row',
          gap: collapsed ? 6 : 8,
        }}
      >
        {dashboardVisible && collapsed && (
          <Link
            to="/dashboard"
            onClick={onCloseMobile}
            aria-label="Analytics dashboard"
            aria-current={dashboardActive ? 'page' : undefined}
            className="flex h-8 w-8 items-center justify-center no-underline hover:bg-surface"
            style={{
              color: dashboardActive ? 'rgb(var(--action))' : 'rgb(var(--tertiary))',
              background: dashboardActive ? 'rgb(var(--white))' : 'transparent',
              boxShadow: dashboardActive ? 'inset 3px 0 0 rgb(var(--action))' : 'none',
            }}
          >
            <Icon name="chart" size={16} />
          </Link>
        )}
        {/* Citation visibility toggle — labelled and filling the row's
            free space in the expanded sidebar and the drawer; icon-only
            in the collapsed sidebar. */}
        <CitationToggle collapsed={collapsed} isMobile={isMobile} />
        {(() => {
          const meta = themeToggleMeta(themePreference);
          return (
            <button
              type="button"
              onClick={onCycleTheme}
              aria-label={meta.label}
              title={meta.label}
              className="flex h-8 w-8 items-center justify-center text-tertiary hover:bg-surface hover:text-ink"
            >
              <Icon name={meta.icon} size={16} />
            </button>
          );
        })()}
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="flex h-8 w-8 items-center justify-center text-tertiary hover:bg-surface hover:text-ink"
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
 * Expanded sidebar and mobile drawer: book icon plus a visible
 * "Sources: on" / "Sources: off" label, because the hover tooltip never
 * shows on touch devices. Collapsed sidebar: icon only, with the state
 * in the `title` tooltip. Either way it is a toggle button: the
 * accessible name stays "Sources" and `aria-pressed` carries the state.
 * The icon reflects the current state (open book = visible, closed
 * book = hidden), matching the theme toggle's icon=state convention.
 */
function CitationToggle({
  collapsed,
  isMobile,
}: {
  collapsed: boolean;
  isMobile: boolean;
}): JSX.Element {
  const { showCitations, toggleCitations } = useCitations();
  const { track } = useAnalytics();

  const stateLabel = showCitations ? 'on' : 'off';
  const iconName = showCitations ? 'book' : 'bookClosed';

  const handleClick = () => {
    // Fire with the NEW state (post-toggle): showCitations is still the
    // pre-click value here, so the new visibility is its inverse.
    track({ type: 'citation_visibility_toggled', payload: { visible: !showCitations } });
    toggleCitations();
  };

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={showCitations}
        aria-label="Sources"
        title={`Sources: ${stateLabel}`}
        className="flex h-8 w-8 items-center justify-center text-tertiary hover:bg-surface hover:text-ink"
      >
        <Icon name={iconName} size={16} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={showCitations}
      // The drawer is a touch surface, so it gets a 44px target.
      className={`flex flex-1 items-center gap-2.5 text-left font-sans text-[12.5px] font-medium text-secondary hover:bg-surface hover:text-ink ${isMobile ? 'min-h-[44px]' : 'h-8'}`}
      style={{ padding: '0 8px' }}
    >
      <Icon name={iconName} size={15} className="text-tertiary" />
      <span>
        Sources<span aria-hidden="true">: {stateLabel}</span>
      </span>
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
          aria-label={`${label} active. Exit to learner mode`}
          title={`${label}: click to exit`}
          className="flex h-7 w-7 items-center justify-center font-mono text-[11px] font-bold text-secondary hover:bg-[rgb(var(--white))] hover:text-ink"
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
        className="flex items-center justify-between gap-2"
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
          className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold uppercase text-tertiary hover:bg-[rgb(var(--white))] hover:text-ink"
          style={{ padding: '3px 6px', letterSpacing: '0.06em' }}
        >
          <Icon name="close" size={11} />
          Exit
        </button>
      </div>
    </div>
  );
}
