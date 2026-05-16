// SectionContainer — wraps a single module section with a content-width
// constraint, breadcrumb, section title, scroll sentinel (90% of section
// content per 4E §10.1), and previous/next navigation. Sections at "reading"
// width (680px) hold body text and inline charts; sections at "interactive"
// width (960px) hold dashboards.
//
// **Completion model (4E §11.5):** A section is complete when BOTH the
// scroll sentinel has fired (`scrolled`) AND the section's interaction
// condition has been met (`interactionComplete`). For sections with no
// interaction (`autoComplete`), the interaction half is fired automatically
// on mount, so scrolling alone completes them.
//
// **Continue button gate (4E §10.7):** The Next button is rendered as
// `<button disabled>` (not hidden) when `isSectionComplete` is false. The
// learner sees where they're going but cannot advance until the current
// section's required scroll AND interaction are satisfied. Sidebar still
// allows non-linear navigation to any section.

import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { getModule, MODULES, type ModuleMeta } from '../../data/program';
import { useLearnerProgress } from '../../contexts/LearnerProgressContext';
import { usePlatformMode } from '../../hooks/usePlatformMode';
import { Icon } from './Icon';
import { Overline } from './Overline';

type SectionWidth = 'reading' | 'interactive';

interface SectionContainerProps {
  module: ModuleMeta;
  sectionId: number;
  sectionTitle: string;
  sectionLabel?: string; // e.g., "Section 3 · Interactive"
  width?: SectionWidth;
  children: React.ReactNode;
  // When true, the section auto-marks its interaction half complete on first
  // render — for explanatory/transition sections that have no learner
  // interaction. Scroll-to-90% remains required.
  autoComplete?: boolean;
}

export function SectionContainer({
  module,
  sectionId,
  sectionTitle,
  sectionLabel,
  width = 'reading',
  children,
  autoComplete = false,
}: SectionContainerProps): JSX.Element {
  const {
    markInteractionComplete,
    markScrolled,
    setCurrentSection,
    isSectionComplete,
  } = useLearnerProgress();
  // Platform mode gates the Next button: learner mode requires the
  // section to be complete before advancing; portfolio + admin modes
  // allow free navigation.
  const { mode } = usePlatformMode();
  const navigate = useNavigate();

  // Refs for the scroll sentinel and the section heading (focus target on
  // navigation). Sentinel is positioned 10% above the bottom of the section
  // children container so it reveals at ~90% scroll progress (4E §10.1).
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Two effects with stable setters only — the reactive `isSectionComplete`
  // getter would otherwise change identity on every state update and cause
  // an effect-loop. The setters are idempotent (each performs an early-return
  // when the requested change is a no-op), so unconditional invocation is safe.
  useEffect(() => {
    setCurrentSection(module.id, sectionId);
  }, [module.id, sectionId, setCurrentSection]);

  useEffect(() => {
    if (autoComplete) markInteractionComplete(module.id, sectionId);
  }, [autoComplete, module.id, sectionId, markInteractionComplete]);

  // Scroll sentinel — primary mechanism is an IntersectionObserver that
  // fires when the sentinel reaches the viewport (4E §10.1). Two
  // supplementary paths handle edge cases:
  //   (1) On mount, if the sentinel is already in the viewport (short
  //       section that fits on screen — common for transition/closing
  //       sections), mark scrolled synchronously. The user has nothing
  //       to scroll to.
  //   (2) Background-tab fallback — IO can be throttled when the tab is
  //       hidden, so a windowed scroll listener also checks.
  // The bit is monotonic; once fired we tear all of it down.
  useEffect(() => {
    const target = sentinelRef.current;
    if (!target) return;

    // Synchronous initial check — handles short sections and any case
    // where the sentinel renders inside the viewport on mount.
    const inViewport = (): boolean => {
      const rect = target.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      return rect.top <= vh && rect.bottom >= 0;
    };
    if (inViewport()) {
      markScrolled(module.id, sectionId);
      return;
    }

    let fired = false;
    const fire = () => {
      if (fired) return;
      fired = true;
      markScrolled(module.id, sectionId);
    };

    // IntersectionObserver — primary path for tall sections that require
    // scrolling. threshold: 0 fires as soon as any portion enters the
    // viewport (1px sentinels can have sub-pixel issues with positive
    // thresholds).
    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              fire();
              observer?.disconnect();
              break;
            }
          }
        },
        { threshold: 0 },
      );
      observer.observe(target);
    }

    // Scroll listener fallback — runs if IO is throttled (background tab)
    // or unavailable. Cheap rect check on each scroll tick.
    const onScroll = () => {
      if (inViewport()) {
        fire();
        window.removeEventListener('scroll', onScroll);
        observer?.disconnect();
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      observer?.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, [module.id, sectionId, markScrolled]);

  // Focus management (4E §17.1): on section change move keyboard focus to the
  // section heading so screen readers announce the new section context. We
  // use `tabIndex={-1}` on the heading so it can receive focus programmatically
  // without being part of the natural tab order.
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: false });
  }, [module.id, sectionId]);

  const totalSections = module.sections.length;
  const prevSection = sectionId > 1 ? module.sections[sectionId - 2] : null;
  const nextSection = sectionId < totalSections ? module.sections[sectionId] : null;

  // When the learner reaches the last section of a module, surface a link
  // to the first section of the next unlocked module so the cross-module
  // continuation is one click away.
  const nextModule =
    !nextSection
      ? MODULES.find((m) => m.id === module.id + 1 && !m.locked)
      : undefined;
  const nextModuleFirstSection = nextModule?.sections[0];

  const innerMaxWidth = width === 'interactive' ? 'max-w-interactive' : 'max-w-reading';
  // Learner mode gates advancement on completion; portfolio + admin
  // modes allow free navigation (the helper text below also hides,
  // since it's keyed off `!canAdvance`).
  const canAdvance =
    mode !== 'learner' || isSectionComplete(module.id, sectionId);

  // Continue button click — gated by canAdvance. The Link variant is rendered
  // when enabled; a disabled <button> when not. This keeps the destination
  // visible (4E §10.7 rationale) without allowing advancement.
  const handleAdvance = (target: string) => () => {
    if (!canAdvance) return;
    navigate(target);
  };

  return (
    // `section-enter` — subtle opacity + 4px-rise fade on mount. Each
    // section is a distinct component, so React remounts this article
    // on every section navigation and the animation re-triggers
    // naturally (no JS keying needed). See index.css for the keyframe;
    // it's reduced-motion-safe via the global rule.
    <article className="section-enter mx-auto w-full px-4 py-12 sm:px-8 lg:px-16">
      {/* Module header / breadcrumb — uses the same `innerMaxWidth` as the
          section content column below so the H1 module title, the section
          breadcrumb, and the section H2 + body all share the same left
          edge. (Previously the header was hard-coded to `max-w-interactive`
          which created a 140px+ visual offset between the H1 and the
          section H2 / body on reading-width sections.) */}
      <div className={`mx-auto ${innerMaxWidth}`}>
        <div className="mb-3 flex flex-wrap items-center gap-2.5">
          <span
            className="font-mono text-[11px] font-bold uppercase"
            style={{ letterSpacing: '0.14em' }}
          >
            <span className="text-ink">{module.seq}</span>
            <span className="mx-2 text-muted">—</span>
            <span style={{ color: 'rgb(var(--ink))' }}>{module.label}</span>
          </span>
          <span aria-hidden="true" className="h-1 w-1 rounded-full bg-ghost" />
          <Overline style={{ fontSize: 11 }}>Module {module.id}</Overline>
          <span aria-hidden="true" className="h-1 w-1 rounded-full bg-ghost" />
          <Overline style={{ fontSize: 11 }}>
            Section {sectionId} of {totalSections}
          </Overline>
        </div>

        <h1
          className="m-0 mb-2 font-display text-title font-normal text-ink"
          style={{ letterSpacing: '-0.005em' }}
        >
          {module.title}
        </h1>
      </div>

      {/* Section content column */}
      <div className={`mx-auto mt-8 ${innerMaxWidth}`}>
        {sectionLabel && (
          <Overline className="mb-2" style={{ fontSize: 11 }}>
            {sectionLabel}
          </Overline>
        )}
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="m-0 mb-5 font-display text-title font-normal text-ink focus:outline-none"
          style={{ letterSpacing: '-0.005em' }}
        >
          {sectionTitle}
        </h2>
        {children}
        {/* Scroll sentinel — positioned at the end of the section content
            inside the same width column, so its top edge intersects the
            viewport when ~90% of the section has been scrolled past.
            `aria-hidden` because it's purely a structural marker. */}
        <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
      </div>

      {/* Section navigation — matches the section's content width so a
          reading-width section gets a 680px-wide nav and an interactive
          dashboard section gets a 960px-wide nav. Each link uses min-w-0
          + truncate so even the longest neighboring titles stay on one
          row at any breakpoint. The Next button is a real <button> when
          gated (per 4E §10.7) so it can be `disabled`, and a styled Link
          when navigable. */}
      <nav
        aria-label="Section navigation"
        // `w-full` is load-bearing here: a flex container with only one
        // `flex-1 min-w-0 truncate` child shrinks its block to zero width
        // because the child has no intrinsic content size. Anchoring to
        // the parent's available width keeps the link visible even when
        // there's nothing to balance it on the right.
        className={`mx-auto mt-12 flex w-full flex-nowrap items-center justify-between gap-4 border-t border-border-light pt-5 ${innerMaxWidth}`}
      >
        {prevSection ? (
          <Link
            to={`/module/${module.id}/section/${prevSection.id}`}
            className="group flex min-w-0 flex-1 items-center gap-2 font-sans text-[13.5px] font-semibold text-tertiary no-underline hover:text-secondary"
          >
            <Icon name="arrowLeft" size={14} />
            <span className="truncate">
              Previous · {prevSection.title}
            </span>
          </Link>
        ) : (
          <Link
            to="/"
            className="flex min-w-0 flex-1 items-center gap-2 font-sans text-[13.5px] font-semibold text-tertiary no-underline hover:text-secondary"
          >
            <Icon name="arrowLeft" size={14} />
            <span className="truncate">Back to program home</span>
          </Link>
        )}
        {nextSection && (
          <ContinueButton
            label={`Next · ${nextSection.title}`}
            disabled={!canAdvance}
            onClick={handleAdvance(`/module/${module.id}/section/${nextSection.id}`)}
          />
        )}
        {!nextSection && nextModule && nextModuleFirstSection && (
          <ContinueButton
            label={`Continue to Module ${nextModule.id} · ${nextModule.title}`}
            disabled={!canAdvance}
            onClick={handleAdvance(
              `/module/${nextModule.id}/section/${nextModuleFirstSection.id}`,
            )}
          />
        )}
        {!nextSection && !nextModule && (
          <ContinueButton
            label="Return to program overview"
            disabled={!canAdvance}
            onClick={handleAdvance('/')}
          />
        )}
      </nav>
      {/* Helper text under the nav when the button is gated — lets the
          learner know what to do to unlock advancement. Visible only when
          the section is incomplete; once complete, this disappears so the
          finished state is uncluttered. */}
      {!canAdvance && (
        <div
          className={`mx-auto mt-2 ${innerMaxWidth} text-right font-mono text-[11px] text-muted`}
          style={{ letterSpacing: '0.02em' }}
          aria-live="polite"
        >
          Complete this section to advance
        </div>
      )}
    </article>
  );
}

/**
 * Continue button — disabled when section is incomplete (4E §10.7).
 * When enabled, behaves like a primary navigation link. When disabled,
 * still rendered (not hidden) but cannot be activated.
 */
function ContinueButton({
  label,
  disabled,
  onClick,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
}): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
      className={[
        'group flex min-w-0 flex-1 items-center justify-end gap-2',
        'font-sans text-[13.5px] font-semibold no-underline',
        'transition-colors duration-150',
        disabled
          ? 'cursor-not-allowed text-muted'
          : 'cursor-pointer text-action hover:text-action-hover',
        'border-0 bg-transparent p-0 text-right',
      ].join(' ')}
      style={{
        // Reset native button visual residue.
        appearance: 'none',
      }}
    >
      <span className="truncate">{label}</span>
      <Icon name="arrowRight" size={14} />
    </button>
  );
}

export function getModuleOrThrow(id: number): ModuleMeta {
  const m = getModule(id);
  if (!m) throw new Error(`Module ${id} not found`);
  return m;
}
