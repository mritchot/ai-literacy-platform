// Platform sidebar — primary nav for desktop and tablet (Section 6).
// Expanded state shows the full module list with sections nested under
// the active module. Collapsed state shows sequence-letter chips only.

import { Link, useLocation } from 'react-router-dom';
import { type ModuleMeta } from '../../data/program';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { useResolvedModules } from '../../contexts/LearnerProgressContext';
import { useCitations } from '../../hooks/useCitations';
import { usePlatformMode } from '../../hooks/usePlatformMode';
import { themeToggleMeta, type ThemePreference } from '../../hooks/useTheme';
import { computeGating, type ModuleGating } from '../../utils/module-gating';
import { Icon } from './Icon';
import { Overline } from './Overline';
import { ProgressBar } from './ProgressBar';
import { SectionIndicator } from './SectionIndicator';

interface SidebarProps {
  collapsed: boolean;
  // Theme *preference* (not resolved) drives the toggle button's
  // icon + label so all three modes — system / light / dark — are
  // distinguishable at a glance.
  themePreference: ThemePreference;
  onToggleCollapse: () => void;
  onCycleTheme: () => void;
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

function isActiveModule(pathname: string, moduleId: number): boolean {
  return new RegExp(`^/module/${moduleId}(/|$)`).test(pathname);
}

export function Sidebar({
  collapsed,
  themePreference,
  onToggleCollapse,
  onCycleTheme,
  isMobile = false,
  onCloseMobile,
}: SidebarProps): JSX.Element {
  const location = useLocation();
  const modules = useResolvedModules();
  // Sequential-progression lock state. In learner mode, modules and
  // sections lock until their prerequisites are complete; in portfolio
  // and admin modes nothing is locked (free navigation).
  const { mode } = usePlatformMode();
  const gating = computeGating(modules, mode);
  const sidebarStyle = {
    width: collapsed ? 64 : 280,
    backgroundColor: 'rgb(var(--sidebar-bg))',
  };

  return (
    <aside
      aria-label="Program navigation"
      className="flex flex-shrink-0 flex-col border-r border-border transition-[width] duration-[250ms]"
      style={{
        ...sidebarStyle,
        height: '100vh',
        position: isMobile ? 'fixed' : 'sticky',
        top: 0,
        left: 0,
        zIndex: isMobile ? 50 : 40,
        overflow: 'hidden',
        boxShadow: isMobile ? '0 2px 8px rgba(0, 0, 0, 0.07)' : 'none',
      }}
    >
      <SidebarHeader collapsed={collapsed} onCloseMobile={onCloseMobile} isMobile={isMobile} />

      <nav
        aria-label="Modules"
        className="flex-1 overflow-y-auto"
        style={{ padding: collapsed ? '14px 10px' : '18px 14px' }}
      >
        {!collapsed && (
          <Overline className="px-1.5 pb-3" style={{ fontSize: 10 }}>
            Modules
          </Overline>
        )}
        <ul className="m-0 list-none p-0">
          {modules.map((m) => (
            <ModuleItem
              key={m.id}
              module={m}
              collapsed={collapsed}
              active={isActiveModule(location.pathname, m.id)}
              gating={gating}
              onCloseMobile={onCloseMobile}
            />
          ))}
        </ul>
      </nav>

      <SidebarFooter
        collapsed={collapsed}
        themePreference={themePreference}
        onToggleCollapse={onToggleCollapse}
        onCycleTheme={onCycleTheme}
        onCloseMobile={onCloseMobile}
        adminActive={location.pathname.startsWith('/admin')}
      />
    </aside>
  );
}

function SidebarHeader({
  collapsed,
  isMobile,
  onCloseMobile,
}: {
  collapsed: boolean;
  isMobile: boolean;
  onCloseMobile?: () => void;
}): JSX.Element {
  return (
    <div
      className="border-b border-border-light"
      style={{ padding: collapsed ? '18px 12px' : '22px 22px 20px' }}
    >
      {collapsed ? (
        <div className="flex justify-center">
          <Link
            to="/"
            aria-label="AI Literacy program — home"
            className="flex h-9 w-9 items-center justify-center rounded-md bg-action font-mono text-[13px] font-bold tracking-wider text-[rgb(var(--white))]"
          >
            AI
          </Link>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-3">
          <Link to="/" className="block no-underline">
            <Overline className="mb-2" style={{ fontSize: 10 }}>
              Program
            </Overline>
            <div
              className="font-sans text-[14px] font-bold leading-[1.35] text-ink"
              style={{ letterSpacing: '-0.005em' }}
            >
              AI Literacy for the
              <br />
              Modern Workforce
            </div>
          </Link>
          {isMobile && onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close menu"
              className="flex h-8 w-8 items-center justify-center rounded-md text-tertiary hover:bg-surface hover:text-ink"
            >
              <Icon name="close" size={18} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

interface ModuleItemProps {
  module: ModuleMeta;
  collapsed: boolean;
  active: boolean;
  gating: ModuleGating;
  onCloseMobile?: () => void;
}

function ModuleItem({
  module,
  collapsed,
  active,
  gating,
  onCloseMobile,
}: ModuleItemProps): JSX.Element {
  // Lock state is computed from the current platform mode + completion
  // progress (see module-gating.ts) — not the static `module.locked`
  // field, which is always false in the current program metadata.
  const locked = gating.isModuleLocked(module.id);
  const linkTo = locked ? undefined : `/module/${module.id}`;

  if (collapsed) {
    return (
      <li style={{ marginBottom: 6 }}>
        <ConditionalLink to={linkTo} disabled={locked} onNavigate={onCloseMobile}>
          <span
            className="flex h-9 w-9 items-center justify-center rounded-md font-mono text-[14px] font-bold"
            style={{
              backgroundColor: active ? 'rgb(var(--action))' : 'rgb(var(--white))',
              color: active
                ? 'rgb(var(--white))'
                : locked
                  ? 'rgb(var(--muted))'
                  : 'rgb(var(--ink))',
              border: active ? 'none' : '1px solid rgb(var(--border))',
            }}
            title={`Module ${module.id}: ${module.title} — ${module.label}`}
          >
            {locked ? <Icon name="lock" size={14} /> : module.seq}
          </span>
          <span className="sr-only">
            Module {module.id}: {module.title}
            {locked ? ', locked' : ''}
          </span>
        </ConditionalLink>
      </li>
    );
  }

  return (
    <li style={{ marginBottom: active ? 8 : 14 }}>
      <ConditionalLink
        to={linkTo}
        disabled={locked}
        onNavigate={onCloseMobile}
        className={[
          'group flex w-full items-start gap-2.5 rounded-md transition-colors duration-150',
          active ? 'bg-[rgb(var(--white))]' : 'hover:bg-surface',
          locked ? 'cursor-not-allowed opacity-60' : '',
        ].join(' ')}
        style={{
          padding: '10px 12px',
          boxShadow: active ? 'inset 3px 0 0 rgb(var(--action))' : 'none',
        }}
      >
        <span
          className="font-mono text-[14px] font-bold"
          style={{
            color: locked ? 'rgb(var(--muted))' : 'rgb(var(--ink))',
            minWidth: 16,
            marginTop: 1,
          }}
        >
          {module.seq}
        </span>
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex items-center gap-1.5">
            <span
              className="font-mono text-[11px] font-semibold uppercase"
              style={{
                color: locked ? 'rgb(var(--muted))' : 'rgb(var(--secondary))',
                letterSpacing: '0.06em',
              }}
            >
              {module.label}
            </span>
            {locked && <Icon name="lock" size={11} />}
          </div>
          <div
            className="font-sans text-[13px] leading-[1.4]"
            style={{
              fontWeight: active ? 500 : 400,
              color: locked
                ? 'rgb(var(--muted))'
                : active
                  ? 'rgb(var(--ink))'
                  : 'rgb(var(--body))',
              marginBottom: 10,
            }}
          >
            {module.title}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <ProgressBar value={module.progress} height={3} label={`${module.title} progress`} />
            </div>
            <span
              className="font-mono text-[10px] font-semibold"
              style={{
                color: module.progress > 0 ? 'rgb(var(--secondary))' : 'rgb(var(--muted))',
                minWidth: 22,
                textAlign: 'right',
              }}
            >
              {Math.round(module.progress * 100)}%
            </span>
          </div>
        </div>
      </ConditionalLink>

      {active && module.sections.length > 0 && (
        <ul
          className="m-0 list-none p-0"
          style={{
            marginTop: 8,
            marginLeft: 28,
            paddingLeft: 14,
            borderLeft: '1px solid rgb(var(--border-light))',
          }}
        >
          {module.sections.map((s) => (
            <li key={s.id}>
              <SectionRow
                moduleId={module.id}
                section={s}
                locked={gating.isSectionLocked(module.id, s.id)}
                onCloseMobile={onCloseMobile}
              />
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

// A single section row in the active module's sidebar sub-list. When
// `locked` (learner mode, prerequisites not met), it renders as a
// non-interactive span — title still visible so the learner can see
// what's ahead, but greyed out, not clickable, with a lock glyph.
function SectionRow({
  moduleId,
  section: s,
  locked,
  onCloseMobile,
}: {
  moduleId: number;
  section: ModuleMeta['sections'][number];
  locked: boolean;
  onCloseMobile?: () => void;
}): JSX.Element {
  const stateSuffix =
    s.state === 'done'
      ? ' (complete)'
      : s.state === 'current'
        ? ' (current)'
        : ' (not started)';

  const body = (
    <div className="min-w-0 flex-1">
      <div
        className="mb-px flex items-center gap-1 font-mono text-[10px] font-semibold uppercase"
        style={{ color: 'rgb(var(--muted))', letterSpacing: '0.04em' }}
      >
        Section {s.id}
        {locked && <Icon name="lock" size={10} />}
      </div>
      <div
        className="font-sans text-[12.5px] leading-[1.45]"
        style={{
          color: locked
            ? 'rgb(var(--muted))'
            : s.state === 'done'
              ? 'rgb(var(--tertiary))'
              : s.state === 'current'
                ? 'rgb(var(--ink))'
                : 'rgb(var(--body))',
        }}
      >
        {s.title}
      </div>
    </div>
  );

  if (locked) {
    return (
      <span
        aria-disabled="true"
        aria-label={`Module ${moduleId}, Section ${s.id}: ${s.title} (locked)`}
        className="flex cursor-not-allowed items-start gap-2.5 rounded-[6px] opacity-40"
        style={{ padding: '6px 10px', marginBottom: 1, pointerEvents: 'none' }}
      >
        <SectionIndicator state={s.state} />
        {body}
      </span>
    );
  }

  return (
    <Link
      to={`/module/${moduleId}/section/${s.id}`}
      onClick={onCloseMobile}
      aria-current={s.state === 'current' ? 'step' : undefined}
      aria-label={`Module ${moduleId}, Section ${s.id}: ${s.title}${stateSuffix}`}
      className="flex items-start gap-2.5 rounded-[6px] no-underline transition-colors duration-150 hover:bg-surface"
      style={{
        padding: '6px 10px',
        marginBottom: 1,
        backgroundColor: s.state === 'current' ? 'rgb(var(--white))' : 'transparent',
        fontWeight: s.state === 'current' ? 500 : 400,
      }}
    >
      <SectionIndicator state={s.state} />
      {body}
    </Link>
  );
}

function ConditionalLink({
  to,
  disabled,
  onNavigate,
  className,
  style,
  children,
}: {
  to?: string;
  disabled: boolean;
  onNavigate?: () => void;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}): JSX.Element {
  if (disabled || !to) {
    return (
      <span
        className={`flex w-full items-start gap-2.5 ${className ?? ''}`}
        style={{ ...style, padding: style?.padding ?? '8px 0' }}
        aria-disabled="true"
      >
        {children}
      </span>
    );
  }
  return (
    <Link
      to={to}
      onClick={onNavigate}
      className={`flex w-full items-start gap-2.5 no-underline ${className ?? ''}`}
      style={style}
    >
      {children}
    </Link>
  );
}

function SidebarFooter({
  collapsed,
  themePreference,
  onToggleCollapse,
  onCycleTheme,
  onCloseMobile,
  adminActive,
}: {
  collapsed: boolean;
  themePreference: ThemePreference;
  onToggleCollapse: () => void;
  onCycleTheme: () => void;
  onCloseMobile?: () => void;
  adminActive: boolean;
}): JSX.Element {
  // Platform mode drives two footer concerns: the admin-dashboard link
  // is shown in portfolio + admin modes, and a mode indicator + exit
  // control surfaces whenever the mode is not the default `learner`.
  const { mode } = usePlatformMode();
  const dashboardVisible = mode === 'admin' || mode === 'portfolio';

  return (
    <div className="border-t border-border-light">
      {/* Mode indicator — renders only in portfolio/admin mode (learner
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
        {/* Admin dashboard link — shown in portfolio + admin modes
            (both can reach the dashboard). Active state uses the same
            inset left-border accent as the module rows (4D §4.1). */}
        {dashboardVisible &&
          (collapsed ? (
            <Link
              to="/admin"
              onClick={onCloseMobile}
              aria-label="Admin dashboard"
              aria-current={adminActive ? 'page' : undefined}
              className="flex h-8 w-8 items-center justify-center rounded-md no-underline hover:bg-surface"
              style={{
                color: adminActive ? 'rgb(var(--action))' : 'rgb(var(--tertiary))',
                background: adminActive ? 'rgb(var(--white))' : 'transparent',
                boxShadow: adminActive ? 'inset 3px 0 0 rgb(var(--action))' : 'none',
              }}
            >
              <Icon name="chart" size={16} />
            </Link>
          ) : (
            <Link
              to="/admin"
              onClick={onCloseMobile}
              aria-current={adminActive ? 'page' : undefined}
              className="flex flex-1 items-center gap-2.5 rounded-md no-underline hover:bg-surface"
              style={{
                padding: '8px 8px',
                background: adminActive ? 'rgb(var(--white))' : 'transparent',
                boxShadow: adminActive ? 'inset 3px 0 0 rgb(var(--action))' : 'none',
              }}
            >
              <Icon
                name="chart"
                size={15}
                style={{ color: adminActive ? 'rgb(var(--action))' : 'rgb(var(--tertiary))' }}
              />
              <span
                className="font-sans text-[12.5px] font-medium"
                style={{
                  color: adminActive ? 'rgb(var(--ink))' : 'rgb(var(--secondary))',
                  fontWeight: adminActive ? 600 : 500,
                }}
              >
                Admin dashboard
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
 * default — no need to announce it). In `portfolio` / `admin` mode it
 * shows a small pill naming the active mode with an Exit control that
 * calls `resetMode()` to drop back to learner mode.
 *
 * Collapsed sidebar: a compact letter badge (P / A) that is itself the
 * exit button — clicking it resets to learner mode (the `title` tooltip
 * explains). Expanded sidebar: the full "Portfolio Mode" / "Admin Mode"
 * label + an explicit "Exit" button. Each variant sits in its own lane
 * with a bottom border, separating it from the footer's control row.
 */
function ModeIndicator({ collapsed }: { collapsed: boolean }): JSX.Element | null {
  const { mode, resetMode } = usePlatformMode();
  if (mode === 'learner') return null;

  const label = mode === 'admin' ? 'Admin Mode' : 'Portfolio Mode';
  const short = mode === 'admin' ? 'A' : 'P';

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
