// Project Timeline — interactive artifact page (`/#/build/timeline`). Leads on
// the effort comparison (≈150–160 focused hours vs a ~735-hour baseline, a
// 4.6–4.9× reduction, the reconciled canonical figures), then a two-swimlane
// Gantt of the ~8-week solo build against the 24–33-week organizational plan on
// a shared week axis, with dated, click-to-expand phases sharing lifecycle
// colors across the two tracks. Data lives in ./timeline-data; prose is sliced
// from the co-located markdown (via ?raw).

import { useState } from 'react';
import TL_MD from './content/04_timeline.md?raw';
import { renderMarkdown } from '../../components/shared/render-markdown';
import { Overline } from '../../components/shared/Overline';
import { EFFORT, ORG_PHASES, SOLO_PHASES, STAGES, TIMELINE_MAX_WEEKS, type Phase } from './timeline-data';
import { SERIES_ACCENT } from './config';
import { ArtifactFooter, ArtifactTopBar, SeriesEyebrow } from './chrome';

const [INTRO_MD = '', ...REST] = TL_MD.replace(/\r\n/g, '\n').split(/\n## /);
const SECTIONS = REST.map((part) => {
  const nl = part.indexOf('\n');
  return { heading: part.slice(0, nl).trim(), body: part.slice(nl + 1).trim() };
});

const TICKS = [5, 10, 15, 20, 25, 30];
const LABEL_W = 150;

// ─── Effort comparison (the headline) ──────────────────────────────────

function EffortBar({ label, note, hoursLabel, widthPct, accent }: { label: string; note: string; hoursLabel: string; widthPct: number; accent: string }): JSX.Element {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <span className="font-sans text-body-sm font-semibold text-ink">{label}</span>
        <span className="font-mono text-body-sm font-semibold text-ink">{hoursLabel}</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full" style={{ background: 'rgb(var(--surface))', border: '1px solid rgb(var(--border-light))' }}>
        <div className="h-full rounded-full" style={{ width: `${widthPct}%`, background: accent }} />
      </div>
      <div className="mt-1 font-sans text-caption text-tertiary">{note}</div>
    </div>
  );
}

function EffortComparison(): JSX.Element {
  const soloPct = Math.round((EFFORT.soloHoursAnchor / EFFORT.baselineAnchor) * 100);
  return (
    <section
      aria-label="Effort comparison"
      className="mt-8 rounded-xl"
      style={{ background: 'rgb(var(--white))', border: '1px solid rgb(var(--border))', borderTop: `3px solid ${SERIES_ACCENT}`, padding: '22px 24px' }}
    >
      <Overline className="mb-4">Effort · not calendar</Overline>
      <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
        <div
          className="space-y-4"
          role="img"
          aria-label={`Focused solo effort about 150 to 160 hours, against a roughly 735-hour Chapman Alliance baseline for comparable Level-3 e-learning, a 4.6 to 4.9 times reduction.`}
        >
          <EffortBar label="Focused solo effort" note={EFFORT.soloNote} hoursLabel={EFFORT.soloHoursLabel} widthPct={soloPct} accent={SERIES_ACCENT} />
          <EffortBar label="Conventional baseline" note={EFFORT.baselineNote} hoursLabel={EFFORT.baselineLabel} widthPct={100} accent="rgb(var(--ghost))" />
        </div>
        <div className="text-center sm:border-l sm:border-border-light sm:pl-6">
          <div className="font-mono text-overline font-semibold uppercase text-tertiary" style={{ letterSpacing: '0.12em' }}>
            Reduction
          </div>
          <div className="font-mono font-bold" style={{ fontSize: 40, lineHeight: 1.15, color: SERIES_ACCENT }}>
            {EFFORT.reductionLabel}
          </div>
        </div>
      </div>
      <p className="m-0 mt-5 border-t border-border-light pt-3 font-sans text-caption text-tertiary" style={{ lineHeight: 1.5 }}>
        Calendar, for context only: {EFFORT.soloCalendar} solo against {EFFORT.orgCalendar} for the five-person
        organizational plan. The calendar span overstates working time; it is not the compression figure.
      </p>
    </section>
  );
}

// ─── Dual-track Gantt ──────────────────────────────────────────────────

function GanttLegend(): JSX.Element {
  return (
    <div className="mb-4 flex flex-wrap gap-x-4 gap-y-1.5">
      {Object.values(STAGES).map((s) => (
        <span key={s.label} className="inline-flex items-center gap-1.5 font-sans text-[11px] text-tertiary">
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
          {s.label}
        </span>
      ))}
    </div>
  );
}

function WeekAxis(): JSX.Element {
  return (
    <div className="mb-2 flex items-end gap-2">
      <span aria-hidden="true" className="shrink-0" style={{ width: LABEL_W }} />
      <div className="relative h-4 flex-1">
        {TICKS.map((w) => (
          <span
            key={w}
            className="absolute font-mono text-[9px] text-muted"
            style={{ left: `${(w / TIMELINE_MAX_WEEKS) * 100}%`, transform: 'translateX(-50%)' }}
          >
            {w}w
          </span>
        ))}
      </div>
    </div>
  );
}

function Gridlines(): JSX.Element {
  return (
    <>
      {TICKS.map((w) => (
        <span
          key={w}
          aria-hidden="true"
          className="absolute bottom-0 top-0 w-px"
          style={{ left: `${(w / TIMELINE_MAX_WEEKS) * 100}%`, background: 'rgb(var(--border-light))' }}
        />
      ))}
    </>
  );
}

function GanttRow({ phase, id, open, onToggle }: { phase: Phase; id: string; open: boolean; onToggle: () => void }): JSX.Element {
  const stage = STAGES[phase.stage];
  const left = ((phase.startWeek - 1) / TIMELINE_MAX_WEEKS) * 100;
  const width = (phase.weeks / TIMELINE_MAX_WEEKS) * 100;
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`${id}-d`}
        aria-label={`${phase.name}, ${phase.when}`}
        className="flex w-full items-center gap-2 rounded transition-colors hover:bg-surface"
        style={{ padding: '5px 0' }}
      >
        <span className="shrink-0 font-sans text-[11px] font-semibold text-ink" style={{ width: LABEL_W, lineHeight: 1.25 }}>
          {phase.name}
        </span>
        <span className="relative h-5 flex-1 overflow-hidden rounded-sm" style={{ background: 'rgb(var(--surface))' }}>
          <Gridlines />
          <span
            className="absolute top-1/2 h-3.5 -translate-y-1/2 rounded-sm"
            style={{ left: `${left}%`, width: `${width}%`, minWidth: 6, background: stage.color }}
          />
        </span>
      </button>
      {open && (
        <div
          id={`${id}-d`}
          className="font-sans text-[12px] text-body"
          style={{ paddingLeft: LABEL_W + 8, paddingRight: 4, paddingBottom: 8, paddingTop: 2, lineHeight: 1.6 }}
        >
          <span className="mr-2 font-mono text-[11px] font-semibold text-secondary">{phase.when}</span>
          {phase.detail}
        </div>
      )}
    </div>
  );
}

function Swimlane({ title, total, phases, prefix, open, toggle }: { title: string; total: string; phases: Phase[]; prefix: string; open: Set<string>; toggle: (id: string) => void }): JSX.Element {
  return (
    <div className="mt-5">
      <div className="mb-1.5 flex items-baseline gap-2 border-b border-border-light pb-1">
        <h3 className="m-0 font-sans text-[12px] font-bold uppercase text-secondary" style={{ letterSpacing: '0.06em' }}>
          {title}
        </h3>
        <span className="font-mono text-[11px] text-tertiary">{total}</span>
      </div>
      {phases.map((p, i) => {
        const id = `${prefix}-${i}`;
        return <GanttRow key={id} id={id} phase={p} open={open.has(id)} onToggle={() => toggle(id)} />;
      })}
    </div>
  );
}

function GanttChart(): JSX.Element {
  const allIds = [...SOLO_PHASES.map((_, i) => `solo-${i}`), ...ORG_PHASES.map((_, i) => `org-${i}`)];
  const [open, setOpen] = useState<Set<string>>(() => new Set());
  const allOpen = open.size === allIds.length;
  const toggle = (id: string): void =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="mt-10">
      <div className="mb-4 flex items-center justify-between">
        <Overline as="span">Dual-track Gantt</Overline>
        <button
          type="button"
          onClick={() => setOpen(allOpen ? new Set() : new Set(allIds))}
          className="font-sans text-[12px] font-semibold text-action hover:text-action-hover"
        >
          {allOpen ? 'Collapse all' : 'Expand all'}
        </button>
      </div>
      <GanttLegend />
      <div className="overflow-x-auto">
        <div style={{ minWidth: 560 }}>
          <WeekAxis />
          <Swimlane title="Solo build" total={EFFORT.soloCalendar} phases={SOLO_PHASES} prefix="solo" open={open} toggle={toggle} />
          <Swimlane title="Organizational deployment" total={EFFORT.orgCalendar} phases={ORG_PHASES} prefix="org" open={open} toggle={toggle} />
        </div>
      </div>
      <p className="m-0 mt-4 font-sans text-caption text-tertiary" style={{ lineHeight: 1.5 }}>
        Both tracks run the same lifecycle. The solo build merges content development and platform build into one block
        and folds integration, QA, and launch prep into adjacent phases: compression, not skipped steps. The
        organizational schedule is illustrative, derived from typical phase durations; real timings vary by team and
        scope.
      </p>
    </div>
  );
}

export default function Timeline(): JSX.Element {
  return (
    <div className="mx-auto max-w-interactive px-4 py-12 sm:px-8 lg:px-16 lg:py-14">
      <ArtifactTopBar pdfSlug="timeline" />
      <SeriesEyebrow label="Behind the build · Project Management" />

      <h1 className="m-0 mb-2 font-display text-display font-normal text-ink">Project Timeline</h1>
      <p className="m-0 mb-6 font-sans text-h3 font-normal text-secondary">AI Literacy for the Modern Workforce</p>

      <div className="max-w-reading">{renderMarkdown(INTRO_MD.trim())}</div>

      <EffortComparison />
      <GanttChart />

      {SECTIONS.map((s) => (
        <section key={s.heading} className="mt-10">
          <h2 className="mb-3 font-sans text-h2 font-semibold text-ink">{s.heading}</h2>
          <div className="max-w-reading">{renderMarkdown(s.body)}</div>
        </section>
      ))}

      <ArtifactFooter currentSlug="timeline" />
    </div>
  );
}
