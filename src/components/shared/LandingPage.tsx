// Landing page — program hero, 4D competency legend strip, 2x2 module grid,
// summary stats bar, footer note. Spatial composition follows the mockup;
// every color, font, radius, and spacing draws from design system tokens.

import { Link } from 'react-router-dom';
import {
  COMPETENCIES,
  MODULES,
  TOTAL_ACTIVITIES,
  TOTAL_OBJECTIVES,
  type CompetencyKey,
  type ModuleMeta,
} from '../../data/program';
import { useResolvedModules } from '../../contexts/LearnerProgressContext';
import { usePlatformMode } from '../../hooks/usePlatformMode';
import { computeGating, type ModuleGating } from '../../utils/module-gating';
import { CompetencyDot } from './CompetencyDot';
import { Icon } from './Icon';
import { Overline } from './Overline';
import { ProgressBar } from './ProgressBar';

const COMPETENCY_BG: Record<CompetencyKey, string> = {
  delegation: '#6B7F5E',
  description: '#8B7355',
  discernment: '#5E7080',
  diligence: '#7A6B80',
};

export function LandingPage(): JSX.Element {
  const modules = useResolvedModules();
  // Sequential-progression gating for the module cards. In learner mode
  // a module locks until the previous one is fully complete; in
  // portfolio + admin modes nothing locks.
  const { mode } = usePlatformMode();
  const gating = computeGating(modules, mode);
  const totalSections = modules.reduce((acc, m) => acc + m.sections.length, 0);
  const completedSections = modules.reduce(
    (acc, m) => acc + m.sections.filter((s) => s.state === 'done').length,
    0,
  );
  const hasStarted = completedSections > 0;
  // Resume target: first non-done section in the first module that still has
  // outstanding work, otherwise the first unlocked module's first section.
  const resumeTarget = (() => {
    for (const m of modules) {
      if (m.locked) continue;
      const next = m.sections.find((s) => s.state !== 'done');
      if (next) return { moduleId: m.id, sectionId: next.id };
    }
    const first = modules.find((m) => !m.locked);
    return first ? { moduleId: first.id, sectionId: first.sections[0]?.id ?? 1 } : null;
  })();

  return (
    <div className="mx-auto max-w-[1160px] px-4 py-14 sm:px-8 lg:px-16 lg:py-14">
      <Hero hasStarted={hasStarted} resumeTarget={resumeTarget} />
      <CompetencyLegend />
      <ModuleGrid modules={modules} gating={gating} />
      <SummaryBar completedSections={completedSections} totalSections={totalSections} />
      <Footer />
      <AttributionFooter />
    </div>
  );
}

function Hero({
  hasStarted,
  resumeTarget,
}: {
  hasStarted: boolean;
  resumeTarget: { moduleId: number; sectionId: number } | null;
}): JSX.Element {
  return (
    <section aria-labelledby="program-title" className="mb-14">
      <Overline className="mb-3.5" style={{ fontSize: 11 }}>
        Program · 4 modules · 80–120 min total
      </Overline>
      <h1
        id="program-title"
        className="m-0 mb-4 max-w-[780px] font-display text-display font-normal text-ink"
      >
        AI Literacy for the Modern Workforce
      </h1>
      <p className="m-0 mb-7 max-w-reading font-sans text-body text-body">
        A research-grounded program for mid-career professionals building judgment-level AI
        competency.
      </p>

      <div className="flex flex-wrap items-center gap-6">
        {resumeTarget && (
          <Link
            to={`/module/${resumeTarget.moduleId}/section/${resumeTarget.sectionId}`}
            className="inline-flex items-center gap-2.5 rounded-md bg-action px-5 py-3 font-sans text-[14px] font-semibold text-[rgb(var(--white))] no-underline transition-colors duration-150 hover:bg-action-hover"
            style={{ border: '1.5px solid rgb(var(--action))' }}
          >
            {hasStarted ? 'Resume program' : 'Begin program'}
            <Icon name="arrowRight" size={15} />
          </Link>
        )}
        {/* Secondary text link to the standalone creator page. Sits
            adjacent to the primary CTA in the same flex row so it's
            scannable from the hero, but rendered as a plain text link
            (not an outlined button) so the visual hierarchy keeps
            "Begin program" as the obvious primary action. */}
        <a
          href="#/thank-you"
          className="font-sans text-[14px] font-medium text-action no-underline hover:underline"
        >
          About this course →
        </a>
        <div
          className="font-mono text-[12px] font-medium leading-[1.55] text-tertiary"
          style={{ letterSpacing: '0.02em' }}
        >
          <div>Mechanics-first · research-grounded</div>
          <div className="mt-0.5 text-secondary">
            4D vocabulary throughout
          </div>
        </div>
      </div>
    </section>
  );
}

function CompetencyLegend(): JSX.Element {
  return (
    <section
      aria-label="The 4D competency framework"
      className="mb-10 overflow-hidden rounded-lg border border-border bg-[rgb(var(--white))]"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {COMPETENCIES.map((c, i) => (
          <div
            key={c.key}
            className="relative px-4 py-3.5"
            style={{
              borderRight:
                i < COMPETENCIES.length - 1 ? '1px solid rgb(var(--border-light))' : 'none',
            }}
          >
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-0 block"
              style={{ height: 3, backgroundColor: COMPETENCY_BG[c.key] }}
            />
            <div
              className="mb-1 mt-1 font-mono text-[10px] font-bold uppercase"
              style={{
                letterSpacing: '0.14em',
                color: `var(--competency-text-${c.key}, ${competencyTextHex(c.key)})`,
              }}
            >
              {c.label}
            </div>
            <div className="font-sans text-[12.5px] leading-[1.45] text-secondary">
              {c.description}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function competencyTextHex(key: CompetencyKey): string {
  return key === 'delegation'
    ? '#3D4A35'
    : key === 'description'
      ? '#5A4A37'
      : key === 'discernment'
        ? '#354A57'
        : '#4A3557';
}

function ModuleGrid({
  modules,
  gating,
}: {
  modules: ModuleMeta[];
  gating: ModuleGating;
}): JSX.Element {
  return (
    <section aria-labelledby="modules-heading" className="mb-10">
      {/* Stack on mobile, side-by-side on sm: — see KnowledgeCheck.tsx
          metadata-header comment for the rationale. The right-side
          subtitle ("Take in order · each self-contained") was wrapping
          mid-content with a dangling bullet on mobile. */}
      <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
        <h2 id="modules-heading" className="m-0">
          <Overline style={{ fontSize: 11 }}>The four modules</Overline>
        </h2>
        <div className="font-mono text-[11px] font-medium text-muted">
          Take in order · each self-contained
        </div>
      </div>
      <div
        className="grid grid-cols-1 gap-5 sm:grid-cols-2"
        style={{ gridAutoRows: '1fr' }}
      >
        {modules.map((m) => (
          <ModuleCard key={m.id} module={m} locked={gating.isModuleLocked(m.id)} />
        ))}
      </div>
    </section>
  );
}

function ModuleCard({ module, locked }: { module: ModuleMeta; locked: boolean }): JSX.Element {
  const cardClass = [
    'flex min-h-[268px] flex-col rounded-xl bg-[rgb(var(--white))] transition-all duration-200',
    locked ? 'opacity-60' : 'hover:bg-surface',
  ].join(' ');

  // Determine where the CTA should land. If there's an unfinished section,
  // deep-link to it (Resume); otherwise drop on the module landing.
  const doneCount = module.sections.filter((s) => s.state === 'done').length;
  const total = module.sections.length;
  const isComplete = total > 0 && doneCount === total;
  const isStarted = doneCount > 0;
  const nextSection = module.sections.find((s) => s.state !== 'done');
  const ctaTarget = nextSection
    ? `/module/${module.id}/section/${nextSection.id}`
    : `/module/${module.id}`;
  const ctaLabel = isComplete ? 'Review module' : isStarted ? 'Resume' : 'Start module';

  return (
    <article
      className={cardClass}
      style={{
        border: '1.5px solid rgb(var(--border))',
        padding: '24px 26px 22px',
      }}
    >
      {/* Stack on mobile, side-by-side on sm: — same pattern as the
          modules-grid header above. The multi-segment left side
          (`{seq} — {label}`) competing with the duration on the right
          left both wrapping mid-content with dangling separators on
          mobile module cards. */}
      <div className="mb-3.5 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
        <div
          className="font-mono text-[11px] font-bold uppercase"
          style={{ letterSpacing: '0.14em' }}
        >
          <span className="text-ink">{module.seq}</span>
          <span className="mx-2 text-muted">—</span>
          <span className="text-secondary">{module.label}</span>
        </div>
        <div className="font-mono text-[11px] font-medium text-tertiary">{module.duration}</div>
      </div>

      <h3
        className="m-0 mb-4 min-h-[49px] font-sans text-h3 font-semibold text-ink"
        style={{ letterSpacing: '-0.005em' }}
      >
        {module.title}
      </h3>

      <div className="mb-5 flex min-h-[24px] flex-wrap gap-1.5">
        {module.competencies.map((c) => (
          <CompetencyDot key={c} competency={c} />
        ))}
      </div>

      <div className="flex-1" />

      {!locked && (
        <div className="mb-3.5 flex items-center gap-3">
          <div className="flex-1">
            <ProgressBar
              value={module.progress}
              height={3}
              label={`${module.title} progress`}
            />
          </div>
          <span
            className="font-mono text-[11px] font-semibold"
            style={{
              color: isComplete
                ? 'rgb(var(--action))'
                : module.progress > 0
                  ? 'rgb(var(--secondary))'
                  : 'rgb(var(--muted))',
              minWidth: 56,
              textAlign: 'right',
            }}
          >
            {isComplete ? 'Complete' : `${doneCount} / ${total}`}
          </span>
        </div>
      )}

      <div className="-mx-[26px] mb-4 h-px bg-border-light" />

      <div className="flex items-center justify-between">
        <div className="font-mono text-[11.5px] font-medium text-tertiary">
          <span className="font-bold text-ink-secondary">{module.activities}</span>
          <span className="ml-1.5">
            practice {module.activities === 1 ? 'activity' : 'activities'}
          </span>
        </div>
        {locked ? (
          <span
            className="inline-flex items-center gap-2 rounded-md font-sans text-[13.5px] font-semibold text-muted"
            style={{
              padding: '9px 16px',
              border: '1.5px solid rgb(var(--border))',
            }}
          >
            <Icon name="lock" size={14} />
            Locked
          </span>
        ) : (
          <Link
            to={ctaTarget}
            className="inline-flex items-center gap-2 rounded-md font-sans text-[13.5px] font-semibold text-action no-underline transition-colors duration-150 hover:bg-[rgba(61,90,78,0.08)]"
            style={{ padding: '9px 16px', border: '1.5px solid rgb(var(--action))' }}
            aria-label={`${ctaLabel}: module ${module.id}, ${module.title}`}
          >
            {isComplete ? (
              <Icon name="check" size={14} />
            ) : null}
            {ctaLabel}
            {!isComplete && <Icon name="arrowRight" size={14} />}
          </Link>
        )}
      </div>
    </article>
  );
}

function SummaryBar({
  completedSections,
  totalSections,
}: {
  completedSections: number;
  totalSections: number;
}): JSX.Element {
  const items: { n: string | number; label: string; emphasized?: boolean }[] = [
    { n: MODULES.length, label: 'Modules' },
    { n: TOTAL_OBJECTIVES, label: 'Objectives' },
    { n: TOTAL_ACTIVITIES, label: 'Practice activities' },
    {
      n: `${completedSections}/${totalSections}`,
      label: 'Sections complete',
      emphasized: completedSections > 0,
    },
  ];
  // Responsive layout:
  //   • Mobile (< 768 CSS px, e.g. iPhone 13 Pro at 390 px): 2×2 grid.
  //     The original single-row layout intrinsically needed ~640 px and
  //     overflowed the viewport, which also caused page-wide horizontal
  //     scrolling. Dividers hide on mobile — they're only meaningful as
  //     separators between items in a single row.
  //   • Tablet/desktop (≥ 768 px): the original single flex row with
  //     vertical dividers between items.
  return (
    <section
      aria-label="Program summary"
      className="grid grid-cols-2 gap-y-3.5 rounded-xl border border-border bg-[rgb(var(--white))] p-4 sm:flex sm:items-center sm:gap-y-0 sm:px-7 sm:py-[18px]"
    >
      {items.map((it, i) => (
        <div key={it.label} className="flex items-center sm:flex-1">
          <div className="flex flex-1 items-baseline gap-2.5">
            <span
              className="font-display text-[22px] sm:text-[28px]"
              style={{
                lineHeight: 1,
                color: it.emphasized ? 'rgb(var(--action))' : 'rgb(var(--ink))',
              }}
              aria-hidden="true"
            >
              {it.n}
            </span>
            <span
              className="font-mono text-[10px] font-semibold uppercase text-tertiary sm:text-[11px]"
              style={{ letterSpacing: '0.12em' }}
            >
              {it.label}
            </span>
            <span className="sr-only">
              {it.n} {it.label}
            </span>
          </div>
          {i < items.length - 1 && (
            <div className="mx-4 hidden h-7 w-px bg-border-light sm:block" />
          )}
        </div>
      ))}
    </section>
  );
}

function Footer(): JSX.Element {
  return (
    <footer
      className="mt-12 flex items-center justify-between border-t border-border-light pt-6 font-mono text-[11px] font-medium text-muted"
      style={{ letterSpacing: '0.02em' }}
    >
      <div>AI Literacy · v0.9 · portfolio edition</div>
      <div>Last updated · May 2026</div>
    </footer>
  );
}

// Licensing + third-party attribution. Renders on the landing page (the
// platform's persistent root); doesn't need to repeat on section pages.
// Mirrors what LICENSE-CODE and LICENSE-CONTENT formalize: the project's
// code is MIT, the instructional content is CC BY-NC-SA 4.0, and the
// 4D taxonomy is adopted from Anthropic under the same CC license.
function AttributionFooter(): JSX.Element {
  return (
    <div
      className="mt-8 space-y-1 text-center font-sans text-caption text-tertiary"
      style={{ lineHeight: 1.6 }}
    >
      <p className="m-0">
        &copy; Michael Ritchot. Code licensed under the{' '}
        <a
          href="https://opensource.org/license/mit/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-tertiary underline hover:text-secondary"
        >
          MIT License
        </a>
        . Instructional content licensed under{' '}
        <a
          href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-tertiary underline hover:text-secondary"
        >
          CC BY-NC-SA 4.0
        </a>
        .
      </p>
      <p className="m-0">
        Competency taxonomy adapted from Anthropic&rsquo;s 4D AI Fluency Framework
        (Dakan, Feller &amp; Anthropic, 2025), licensed under{' '}
        <a
          href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-tertiary underline hover:text-secondary"
        >
          CC BY-NC-SA 4.0
        </a>
        .
      </p>
      <p className="m-0">
        Built with AI assistance. See the{' '}
        <a
          href="#/thank-you"
          className="text-tertiary underline hover:text-secondary"
        >
          AI Diligence Statement
        </a>
        .
      </p>
    </div>
  );
}
