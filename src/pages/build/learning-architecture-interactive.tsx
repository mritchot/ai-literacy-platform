// Learning-architecture interactive diagram — the ported, in-app version of
// the Phase 2 prototype (03b_learning-architecture.jsx). Four expandable
// module cards, a 4D competency filter, the three-tier assessment
// architecture, the Kirkpatrick evaluation lane, and the practice-activity
// distribution.
//
// Changes from the prototype, all to fit the platform: every hardcoded
// neutral hex is replaced with a design-system token so the diagram themes in
// dark mode for free; the competency `bg`/`mid` fills (unchanged in dark) stay
// as literals and competency tags render through the shared CompetencyDot;
// the onClick <div> toggles become real <button>s with aria-expanded/controls
// and keyboard support; and inactive filter-pill / metadata text uses the
// AA-contrast competency `text` token (design system §9.1) rather than the
// mid-tone `bg`. Data lives in ./learning-architecture-data.

import { useId, useState } from 'react';
import { CompetencyDot } from '../../components/shared/CompetencyDot';
import { Overline } from '../../components/shared/Overline';
import {
  ARCH_MODULES,
  ASSESSMENT_TIERS,
  COMPETENCY_HEX,
  INFRA_COMPONENTS,
  KIRK_LEVELS,
  L3_COUNT,
  PLATFORMS,
  TIER3_COUNT,
  TOTAL_ACTIVITIES,
  TOTAL_OBJECTIVES,
  type ArchModule,
  type ArchObjective,
  type ArchPlatformCell,
  type AssessmentTier,
  type PlatformIdentity,
} from './learning-architecture-data';

// ─── Small shared pieces ───────────────────────────────────────────────

// Vertical flow connector between stacked cards — purely decorative.
function VConnector(): JSX.Element {
  return (
    <div aria-hidden="true" className="flex flex-col items-center py-0.5">
      <div className="h-4 w-0.5" style={{ background: 'rgb(var(--border))' }} />
      <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
        <path
          d="M7 0V7M7 7L3 3M7 7L11 3"
          stroke="rgb(var(--ghost))"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

// Section rule with a mono label on the left and an italic hint on the right.
function SectionRule({ label, hint }: { label: string; hint?: string }): JSX.Element {
  return (
    <div className="mb-3.5 flex items-center gap-2.5">
      <span
        className="font-mono text-overline font-bold uppercase text-tertiary"
        style={{ letterSpacing: '0.1em' }}
      >
        {label}
      </span>
      <span aria-hidden="true" className="h-px flex-1" style={{ background: 'rgb(var(--border-light))' }} />
      {hint && <span className="font-mono text-[10px] italic text-muted">{hint}</span>}
    </div>
  );
}

// Small assessment-tier tag: the fill glyph carries the tier (never
// color-only), the "T{n}" text stays in a neutral token for AA contrast.
function TierTag({ tier }: { tier: AssessmentTier }): JSX.Element {
  return (
    <span
      className="inline-flex items-center gap-1 rounded font-mono text-[9px] font-semibold text-secondary"
      style={{ padding: '1px 7px', border: `1px solid ${tier.color}`, background: `${tier.color}1F` }}
    >
      <span aria-hidden="true" style={{ color: tier.color }}>
        {tier.icon}
      </span>
      T{tier.tier}
    </span>
  );
}

// ─── Platform split ────────────────────────────────────────────────────

function PlatformCell({
  platform,
  cell,
  side,
  showDesc,
}: {
  platform: PlatformIdentity;
  cell: ArchPlatformCell;
  side: 'left' | 'right';
  showDesc: boolean;
}): JSX.Element {
  return (
    <div
      className="relative flex-1"
      style={{
        padding: '12px 18px',
        background: side === 'left' ? 'rgb(var(--surface))' : 'rgb(var(--surface-warm))',
        borderRight: side === 'left' ? '1px solid rgb(var(--border))' : undefined,
      }}
    >
      <span
        aria-hidden="true"
        className="absolute bottom-0 top-0 w-[3px]"
        style={{
          left: side === 'left' ? 0 : undefined,
          right: side === 'right' ? 0 : undefined,
          background: platform.color,
        }}
      />
      <div className="mb-1 flex items-center gap-1.5">
        <span aria-hidden="true" className="h-[7px] w-[7px] rounded-sm" style={{ background: platform.color }} />
        <span
          className="font-mono text-[9px] font-bold uppercase text-secondary"
          style={{ letterSpacing: '0.08em' }}
        >
          {cell.component} — {platform.label}
        </span>
      </div>
      <div className="font-sans text-[12.5px] font-semibold text-ink-secondary">{cell.label}</div>
      {showDesc && (
        <p className="m-0 mt-1.5 font-sans text-[11.5px] text-body" style={{ lineHeight: 1.55 }}>
          {cell.desc}
        </p>
      )}
    </div>
  );
}

// ─── Objective + activity rows ─────────────────────────────────────────

function ObjectiveRow({ objective }: { objective: ArchObjective }): JSX.Element {
  const primary = objective.dims[0]!;
  const tier = ASSESSMENT_TIERS.find((t) => t.tier === objective.tier)!;
  return (
    <div
      className="rounded-md"
      style={{
        background: 'rgb(var(--surface))',
        borderLeft: `3px solid ${COMPETENCY_HEX[primary].bg}`,
        padding: '8px 12px',
      }}
    >
      <div className="flex items-start gap-2">
        <span
          className="min-w-[26px] pt-0.5 font-mono text-[10px] font-bold"
          style={{ color: `rgb(var(--${primary}-text))` }}
        >
          {objective.id}
        </span>
        <div className="flex-1">
          <div className="font-sans text-[12px] font-medium text-ink-secondary" style={{ lineHeight: 1.4 }}>
            {objective.short}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {objective.dims.map((d) => (
              <CompetencyDot key={d} competency={d} size={7} />
            ))}
            <TierTag tier={tier} />
            <span className="font-mono text-[9.5px] text-muted">{objective.assessment}</span>
            {objective.feedsL3 && (
              <span
                className="rounded font-mono text-[9px] font-bold"
                style={{ padding: '1px 7px', background: '#6B7F5E1F', color: 'rgb(var(--delegation-text))' }}
              >
                → L3
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityRow({ activity }: { activity: { id: string; short: string; type: string } }): JSX.Element {
  return (
    <div className="rounded-md" style={{ background: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', padding: '8px 12px' }}>
      <div className="flex items-center gap-2">
        <span
          className="inline-flex h-[18px] min-w-[26px] items-center justify-center rounded font-mono text-[9px] font-bold text-[rgb(var(--white))]"
          style={{ background: '#5E7080' }}
        >
          {activity.id}
        </span>
        <span className="font-sans text-[12px] font-medium text-ink-secondary">{activity.short}</span>
      </div>
      <div className="mt-0.5 pl-[34px] font-sans text-[10.5px] italic text-muted">{activity.type}</div>
    </div>
  );
}

// ─── Module card ───────────────────────────────────────────────────────

function ModuleCard({
  module,
  expanded,
  onToggle,
}: {
  module: ArchModule;
  expanded: boolean;
  onToggle: () => void;
}): JSX.Element {
  const panelId = useId();
  const emph = module.emphasis.map((d) => COMPETENCY_HEX[d].bg);
  const gradBar =
    emph.length === 4
      ? `linear-gradient(90deg, ${emph.join(', ')})`
      : emph.length === 2
        ? `linear-gradient(90deg, ${emph[0]} 0%, ${emph[0]} 50%, ${emph[1]} 50%)`
        : emph[0];

  const fObj = module.objectives;
  const fAct = module.activities;

  return (
    <div
      className="overflow-hidden rounded-xl"
      style={{
        background: 'rgb(var(--white))',
        border: `1.5px solid ${expanded ? emph[0] : 'rgb(var(--border-light))'}`,
      }}
    >
      <div aria-hidden="true" className="h-1" style={{ background: gradBar }} />

      {/* Header toggle */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={panelId}
        className="flex w-full items-start gap-4 text-left transition-colors hover:bg-surface"
        style={{ padding: '18px 22px 16px' }}
      >
        <span className="flex min-w-[44px] flex-col items-center gap-1">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-full font-mono text-[18px] font-bold text-[rgb(var(--white))]"
            style={{ background: emph[0] }}
          >
            {module.id}
          </span>
          <span
            className="font-mono text-[9px] font-bold uppercase"
            style={{ color: `rgb(var(--${module.emphasis[0]}-text))`, letterSpacing: '0.08em' }}
          >
            {module.sequence}
          </span>
        </span>
        <span className="flex-1">
          <span className="mb-1.5 block font-display text-[17px] font-normal leading-tight text-ink">
            {module.title}
          </span>
          <span className="mb-2 block font-sans text-[12px] text-tertiary" style={{ lineHeight: 1.4 }}>
            {module.focus}
          </span>
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <span className="font-mono text-[11px] font-semibold text-secondary">{module.duration}</span>
            <span aria-hidden="true" className="text-subtle">
              |
            </span>
            {module.emphasis.map((d) => (
              <CompetencyDot key={d} competency={d} size={8} />
            ))}
            <span aria-hidden="true" className="text-subtle">
              |
            </span>
            <span className="font-mono text-[10.5px] text-muted">
              {module.activities.length} activities · {module.objectives.length} objectives
            </span>
          </span>
        </span>
        <span
          aria-hidden="true"
          className="pt-1 text-tertiary transition-transform"
          style={{ transform: expanded ? 'rotate(180deg)' : 'none' }}
        >
          ▾
        </span>
      </button>

      {/* Platform split — always visible */}
      <div className="flex" style={{ borderTop: '1px solid rgb(var(--border))' }}>
        <PlatformCell platform={PLATFORMS.custom} cell={module.custom} side="left" showDesc={expanded} />
        <PlatformCell platform={PLATFORMS.articulate} cell={module.articulate} side="right" showDesc={expanded} />
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div id={panelId} className="flex flex-wrap" style={{ borderTop: '1px solid rgb(var(--border))' }}>
          <div
            className="flex-[1_1_260px]"
            style={{ padding: '14px 18px', borderRight: '1px solid rgb(var(--border-light))' }}
          >
            <div className="mb-2.5 flex items-center gap-1.5">
              <span aria-hidden="true" className="h-2 w-2 rounded-sm" style={{ background: '#5E7080' }} />
              <span className="font-mono text-[9px] font-bold uppercase text-secondary" style={{ letterSpacing: '0.1em' }}>
                Practice Activities ({fAct.length})
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              {fAct.map((a) => (
                <ActivityRow key={a.id} activity={a} />
              ))}
            </div>
          </div>
          <div className="flex-[2_1_400px]" style={{ padding: '14px 18px' }}>
            <div className="mb-2.5 flex items-center gap-1.5">
              <span aria-hidden="true" className="h-2 w-2 rounded-sm" style={{ background: '#6B7F5E' }} />
              <span className="font-mono text-[9px] font-bold uppercase text-secondary" style={{ letterSpacing: '0.1em' }}>
                Performance Objectives ({fObj.length})
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              {fObj.map((o) => (
                <ObjectiveRow key={o.id} objective={o} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Kirkpatrick lane ──────────────────────────────────────────────────

function KirkpatrickLane({ expanded, onToggle }: { expanded: boolean; onToggle: () => void }): JSX.Element {
  const panelId = useId();
  return (
    <div className="overflow-hidden rounded-xl" style={{ background: 'rgb(var(--white))', border: '1.5px solid rgb(var(--border))' }}>
      <div
        aria-hidden="true"
        className="h-1"
        style={{ background: `linear-gradient(90deg, ${KIRK_LEVELS.map((k) => k.color).join(', ')})` }}
      />
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={panelId}
        className="flex w-full items-center justify-between text-left transition-colors hover:bg-surface"
        style={{ padding: '14px 22px' }}
      >
        <span className="font-mono text-overline font-bold uppercase text-tertiary" style={{ letterSpacing: '0.1em' }}>
          Kirkpatrick Evaluation Framework
        </span>
        <span aria-hidden="true" className="text-tertiary transition-transform" style={{ transform: expanded ? 'rotate(180deg)' : 'none' }}>
          ▾
        </span>
      </button>
      <div className="grid grid-cols-2 sm:grid-cols-4" style={{ borderTop: '1px solid rgb(var(--border-light))' }}>
        {KIRK_LEVELS.map((k, i) => (
          <div
            key={k.key}
            className="text-center"
            style={{
              padding: '14px 16px',
              borderRight: i < KIRK_LEVELS.length - 1 ? '1px solid rgb(var(--border-light))' : undefined,
            }}
          >
            <div
              className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full font-mono text-[11px] font-bold"
              style={{ background: `${k.color}1F`, border: `2px solid ${k.color}`, color: `rgb(var(--${kirkTextVar(k.key)}))` }}
            >
              {k.key}
            </div>
            <div className="font-sans text-[13px] font-semibold text-ink-secondary">{k.name}</div>
            <div className="mt-0.5 font-mono text-[10px] text-muted">{k.label}</div>
          </div>
        ))}
      </div>
      {expanded && (
        <div id={panelId} style={{ borderTop: '1px solid rgb(var(--border))' }}>
          {KIRK_LEVELS.map((k, i) => (
            <div
              key={k.key}
              className="flex items-start gap-3"
              style={{ padding: '12px 22px', borderBottom: i < KIRK_LEVELS.length - 1 ? '1px solid rgb(var(--border-light))' : undefined }}
            >
              <span
                className="inline-flex h-[22px] min-w-[30px] items-center justify-center rounded font-mono text-[10px] font-bold text-[rgb(var(--white))]"
                style={{ background: k.color }}
              >
                {k.key}
              </span>
              <div>
                <div className="mb-1 font-sans text-[13px] font-semibold text-ink-secondary">{k.name}</div>
                <div className="font-sans text-[11.5px] text-body" style={{ lineHeight: 1.55 }}>
                  {k.detail}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Kirkpatrick badge label color: the four levels reuse the 4D hues, so each
// maps to that competency's AA-contrast text token (which flips for dark).
function kirkTextVar(key: string): string {
  const map: Record<string, string> = { L1: 'description-text', L2: 'discernment-text', L3: 'delegation-text', L4: 'diligence-text' };
  return map[key] ?? 'ink';
}

// ─── Assessment tiers, L3 callout, infra, density ──────────────────────

function AssessmentTiers(): JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {ASSESSMENT_TIERS.map((t) => {
        const count = ARCH_MODULES.reduce((s, m) => s + m.objectives.filter((o) => o.tier === t.tier).length, 0);
        return (
          <div
            key={t.tier}
            className="rounded-lg"
            style={{ background: 'rgb(var(--white))', border: `1px solid ${t.color}55`, borderTop: `3px solid ${t.color}`, padding: '14px 16px' }}
          >
            <div className="mb-1.5 flex items-center gap-1.5">
              <span aria-hidden="true" style={{ color: t.color }}>
                {t.icon}
              </span>
              <span className="font-mono text-[11px] font-bold text-secondary">{t.label}</span>
            </div>
            <p className="m-0 mb-1.5 font-sans text-[11.5px] text-body" style={{ lineHeight: 1.5 }}>
              {t.desc}
            </p>
            <span className="font-mono text-[10px] text-muted">
              {count} objective{count !== 1 ? 's' : ''}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function L3Callout(): JSX.Element {
  return (
    <div
      className="flex items-start gap-3.5 rounded-lg"
      style={{ background: 'rgb(var(--white))', border: '1.5px solid #B5C4AB', padding: '16px 20px' }}
    >
      <span
        className="flex h-8 min-w-[32px] items-center justify-center rounded-full font-mono text-[11px] font-bold"
        style={{ background: '#6B7F5E1F', border: '2px solid #6B7F5E', color: 'rgb(var(--delegation-text))' }}
      >
        L3
      </span>
      <div>
        <div className="mb-1.5 font-sans text-[13px] font-semibold text-ink-secondary">Transfer Measurement by Design</div>
        <p className="m-0 font-sans text-[12px] text-body" style={{ lineHeight: 1.6 }}>
          Two objectives produce trackable artifacts that the 30/60/90-day behavioral observation checks for
          sustained use: <strong className="text-ink">Objective 2.3</strong> (task-level action commitment — the
          participant identifies a specific task they will change their approach to) and{' '}
          <strong className="text-ink">Objective 4.5</strong> (AI diligence statement — the participant documents
          AI’s role in a completed work product using 4D vocabulary). If the program produces behavior change,
          Level 3 data shows it. If it does not, Level 3 data shows that too.
        </p>
      </div>
    </div>
  );
}

function InfraCards(): JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {INFRA_COMPONENTS.map((c) => (
        <div
          key={c.component}
          className="rounded-lg"
          style={{
            background: 'rgb(var(--surface-warm))',
            border: `1.5px dashed ${PLATFORMS.custom.color}`,
            borderLeft: `3px solid ${PLATFORMS.custom.color}`,
            padding: '14px 16px',
          }}
        >
          <div className="mb-1.5 flex items-center gap-1.5">
            <span aria-hidden="true" className="h-2 w-2 rounded-sm" style={{ background: PLATFORMS.custom.color }} />
            <span className="font-mono text-[10px] font-bold uppercase text-secondary" style={{ letterSpacing: '0.06em' }}>
              {c.component}
            </span>
          </div>
          <p className="m-0 mb-1 font-sans text-[11.5px] font-medium text-ink-secondary" style={{ lineHeight: 1.5 }}>
            {c.title}
          </p>
          <p className="m-0 font-sans text-[10.5px] italic text-muted" style={{ lineHeight: 1.5 }}>
            {c.detail}
          </p>
        </div>
      ))}
    </div>
  );
}

function PracticeDensity(): JSX.Element {
  return (
    <div className="rounded-lg" style={{ background: 'rgb(var(--white))', border: '1.5px solid rgb(var(--border-light))', padding: '20px 24px' }}>
      <Overline className="mb-4">Practice Activity Distribution</Overline>
      <div className="grid grid-cols-4 items-end gap-4" role="img" aria-label={distributionLabel()}>
        {ARCH_MODULES.map((m) => {
          const count = m.activities.length;
          const barH = (count / 5) * 64 + 14;
          const hex = COMPETENCY_HEX[m.emphasis[0]!].bg;
          return (
            <div key={m.id} className="flex flex-col items-center gap-2">
              <span className="font-mono text-[20px] font-bold" style={{ color: `rgb(var(--${m.emphasis[0]}-text))` }}>
                {count}
              </span>
              <div
                className="w-3/5 max-w-[72px] rounded-sm"
                style={{ height: barH, background: `linear-gradient(180deg, ${hex}BB, ${hex})` }}
              />
              <div className="text-center">
                <div className="font-mono text-[11px] font-semibold text-secondary">Module {m.id}</div>
                <div className="mt-0.5 font-sans text-[10px] text-muted">{m.sequence}</div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="m-0 mt-4 text-center font-sans text-[11px] italic text-muted">
        Practice density shifts from context-setting (Modules 1–2) to applied skill-building (Modules 3–4) — 10 of
        12 activities involve hands-on interaction.
      </p>
    </div>
  );
}

function distributionLabel(): string {
  return `Practice activity distribution by module: ${ARCH_MODULES.map((m) => `Module ${m.id} ${m.activities.length}`).join(', ')}.`;
}

// ─── Main ──────────────────────────────────────────────────────────────

export function LearningArchitectureDiagram(): JSX.Element {
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());
  const [kirkExpanded, setKirkExpanded] = useState(false);
  const allExpanded = expandedModules.size === ARCH_MODULES.length && kirkExpanded;
  const toggleModule = (id: number): void =>
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const setAll = (v: boolean): void => {
    setExpandedModules(v ? new Set(ARCH_MODULES.map((m) => m.id)) : new Set());
    setKirkExpanded(v);
  };

  const stats: { n: number | string; l: string }[] = [
    { n: 4, l: 'Modules' },
    { n: TOTAL_OBJECTIVES, l: 'Objectives' },
    { n: TOTAL_ACTIVITIES, l: 'Practice Activities' },
    { n: 2, l: 'Platforms' },
    { n: TIER3_COUNT, l: 'Competency-Assessed' },
    { n: L3_COUNT, l: 'L3 Tracked' },
  ];

  return (
    <div className="mt-8">
      {/* Header stats */}
      <div className="mb-6 flex flex-wrap gap-x-6 gap-y-3 rounded-xl" style={{ background: 'rgb(var(--surface))', border: '1px solid rgb(var(--border-light))', padding: '18px 22px' }}>
        {stats.map((s) => (
          <div key={s.l} className="flex items-baseline gap-1.5">
            <span className="font-mono text-[20px] font-bold" style={{ color: '#5E7080' }}>
              {s.n}
            </span>
            <span className="font-mono text-[10px] font-semibold uppercase text-muted" style={{ letterSpacing: '0.06em' }}>
              {s.l}
            </span>
          </div>
        ))}
      </div>

      {/* Platform legend */}
      <div className="mb-6 flex flex-wrap gap-3">
        {(['custom', 'articulate'] as const).map((key) => {
          const p = PLATFORMS[key];
          return (
            <div
              key={key}
              className="relative min-w-[240px] flex-1 overflow-hidden rounded-lg"
              style={{ background: 'rgb(var(--surface-warm))', border: '1.5px solid rgb(var(--border))', padding: '12px 16px' }}
            >
              <span aria-hidden="true" className="absolute bottom-0 left-0 top-0 w-[3px]" style={{ background: p.color }} />
              <div className="mb-1 flex items-center gap-1.5 pl-1">
                <span aria-hidden="true" className="h-2 w-2 rounded-sm" style={{ background: p.color }} />
                <span className="font-mono text-[10px] font-bold uppercase text-secondary" style={{ letterSpacing: '0.06em' }}>
                  {p.label} — {p.component}
                </span>
              </div>
              <p className="m-0 pl-1 font-sans text-[11px] text-body" style={{ lineHeight: 1.5 }}>
                {p.legend}
              </p>
            </div>
          );
        })}
      </div>

      <SectionRule label="Learning Progression" hint="Context → Evidence → Mechanism → Application" />

      <div className="-mt-2 mb-3 flex justify-end">
        <button
          type="button"
          onClick={() => setAll(!allExpanded)}
          className="font-sans text-[12px] font-semibold text-action hover:text-action-hover"
        >
          {allExpanded ? 'Collapse all' : 'Expand all'}
        </button>
      </div>

      {/* Module flow */}
      <div className="mb-7 flex flex-col">
        {ARCH_MODULES.map((m, i) => (
          <div key={m.id}>
            <ModuleCard
              module={m}
              expanded={expandedModules.has(m.id)}
              onToggle={() => toggleModule(m.id)}
            />
            {i < ARCH_MODULES.length - 1 && <VConnector />}
          </div>
        ))}
      </div>

      {/* Assessment architecture */}
      <div className="mb-2">
        <SectionRule label="Assessment Architecture" hint="Feeds Kirkpatrick Levels 2–4 below" />
        <AssessmentTiers />
      </div>

      <VConnector />

      {/* Kirkpatrick */}
      <div className="mb-6">
        <KirkpatrickLane expanded={kirkExpanded} onToggle={() => setKirkExpanded((v) => !v)} />
      </div>

      <div className="mb-7">
        <L3Callout />
      </div>

      {/* Admin / analytics infrastructure */}
      <div className="mb-7">
        <SectionRule label="Admin / Analytics Infrastructure" hint="Hidden from the learner — supports Levels 2 & 3" />
        <InfraCards />
      </div>

      <PracticeDensity />
    </div>
  );
}
