// ModuleCompletionTable — semantic <table> with one row per module and an
// expandable per-section detail panel (4D §8). The detail panel shows both
// `scrolled` and `interactionComplete` columns; both must be ✓ for a section
// to count as complete in the aggregate. Below the section table, a
// "Learner Artifacts" subsection lists truncated previews; clicking opens
// the full text in `ArtifactViewerModal`.

import { useMemo, useState } from 'react';
import { Icon } from '../components/shared/Icon';
import type { LearnerProgressState } from '../contexts/LearnerProgressContext';
import { ArtifactViewerModal } from './ArtifactViewerModal';
import { KC_IDS } from './kc-metadata';
import { SECTION_LABELS, type ModuleId } from './section-labels';

interface ModuleCompletionTableProps {
  progress: LearnerProgressState;
}

const MODULE_TITLES: Record<ModuleId, string> = {
  1: 'Why AI Literacy Matters Now',
  2: 'How AI Is Actually Being Used at Work',
  3: 'Understanding How Language Models Work',
  4: 'Evaluating AI Outputs and Working Responsibly',
};

const MODULE_ACCENT: Record<ModuleId, string> = {
  1: '#6B7F5E', // delegation olive
  2: '#8B7355', // description amber
  3: '#5E7080', // discernment blue-gray
  4: '#7A6B80', // diligence purple
};

interface ArtifactRef {
  id: string;
  label: string;
  content: string;
}

// Map from progress.reflections key prefix → human-readable label.
function collectArtifacts(
  moduleId: ModuleId,
  reflections: Record<string, string>,
): ArtifactRef[] {
  const out: ArtifactRef[] = [];
  for (const [key, value] of Object.entries(reflections)) {
    if (!key.startsWith(`${moduleId}.`)) continue;
    if (!value || value.trim().length === 0) continue;
    const id = key;
    const label = artifactLabelFromKey(key);
    out.push({ id, label, content: value });
  }
  return out;
}

function artifactLabelFromKey(key: string): string {
  // Patterns: `2.3.p3_reflection_1` → "P3 Reflection 1"
  // `2.5.p4_commitment_task1` → "P4 Action Commitment — Task 1"
  // `4.8.p12_reflection` → "P12 Reflection"
  // `4.8.p12_statement` → "P12 Diligence Statement"
  const tail = key.split('.').slice(2).join('.');
  if (tail.startsWith('p4_commitment_task1')) return 'P4 Action Commitment — Task 1';
  if (tail.startsWith('p4_commitment_task2')) return 'P4 Action Commitment — Task 2';
  if (tail.startsWith('p12_statement')) return 'P12 Diligence Statement';
  // p3_reflection_1 → "P3 Reflection 1"; p6_reasoning → "P6 Reasoning"
  const code = tail.match(/^(p\d+)_(.+)$/);
  if (code) {
    const [, p, rest] = code;
    return `${p!.toUpperCase()} ${rest!.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}`;
  }
  return tail;
}

// Active reading time for a module — sums per-section values recorded
// by the visibility/idle tracker in LearnerProgressContext. Replaces
// the old `max(ts) - min(ts)` span, which over-counted any time a tab
// was left open (no visibility/idle/sleep filtering).
function moduleTime(progress: LearnerProgressState, moduleId: ModuleId): string {
  const prefix = `${moduleId}.`;
  let totalMs = 0;
  for (const [key, ms] of Object.entries(progress.activeTimeMs ?? {})) {
    if (key.startsWith(prefix)) totalMs += ms;
  }
  if (totalMs <= 0) return '—';
  const minutes = Math.max(1, Math.round(totalMs / 60_000));
  return `${minutes}m`;
}

interface ModuleStats {
  moduleId: ModuleId;
  done: number;
  total: number;
  preferred: number;
  attempted: number;
  time: string;
  artifacts: ArtifactRef[];
  sections: { id: number; label: string; scrolled: boolean; interaction: boolean }[];
}

function computeModuleStats(progress: LearnerProgressState): ModuleStats[] {
  const out: ModuleStats[] = [];
  for (const idStr of [1, 2, 3, 4] as const) {
    const moduleId = idStr as ModuleId;
    const labels = SECTION_LABELS[moduleId];
    const total = labels.length;
    let done = 0;
    const sections = labels.map((label, idx) => {
      const sectionId = idx + 1;
      const key = `${moduleId}.${sectionId}`;
      const scrolled = Boolean(progress.scrolledSections[key]);
      const interaction = Boolean(progress.interactionCompleteSections[key]);
      if (scrolled && interaction) done += 1;
      return { id: sectionId, label, scrolled, interaction };
    });
    let preferred = 0;
    let attempted = 0;
    for (const kcId of KC_IDS[moduleId]) {
      // Match by suffix because KC IDs include section in storage key.
      const match = Object.entries(progress.knowledgeChecks).find(([k]) =>
        k.startsWith(`${moduleId}.`) && k.endsWith(`.${kcId}`),
      );
      if (match) {
        attempted += 1;
        if (match[1].isPreferred) preferred += 1;
      }
    }
    out.push({
      moduleId,
      done,
      total,
      preferred,
      attempted,
      time: moduleTime(progress, moduleId),
      artifacts: collectArtifacts(moduleId, progress.reflections),
      sections,
    });
  }
  return out;
}

export function ModuleCompletionTable({
  progress,
}: ModuleCompletionTableProps): JSX.Element {
  const stats = useMemo(() => computeModuleStats(progress), [progress]);
  const [expandedId, setExpandedId] = useState<ModuleId | null>(null);
  const [activeArtifact, setActiveArtifact] = useState<ArtifactRef | null>(null);

  const toggle = (id: ModuleId) => setExpandedId((prev) => (prev === id ? null : id));

  return (
    <>
      <section aria-label="Module completion table">
        <div
          className="overflow-hidden rounded-lg"
          style={{
            border: '1px solid rgb(var(--border))',
            background: 'rgb(var(--white))',
          }}
        >
          {/* Tablet + Desktop: <table>. Wrapped in overflow-x: auto so when
              the content area gets narrower than the table's min-width
              (which happens between ~md viewport and ~lg with the expanded
              sidebar in the way) the table horizontally scrolls instead of
              compressing columns and overlapping cell text with the status
              bar. The Time column is hidden between md..lg per spec §13.1
              so the table can comfortably fit at tablet widths. */}
          <div className="hidden md:block" style={{ overflowX: 'auto' }}>
            <table
              className="border-collapse"
              style={{
                tableLayout: 'fixed',
                width: '100%',
                minWidth: 640,
              }}
            >
              <thead>
                <tr
                  className="font-mono text-tertiary"
                  style={{
                    background: 'rgb(var(--surface-warm))',
                    fontSize: 11,
                    letterSpacing: '0.06em',
                  }}
                >
                  <th scope="col" className="text-left font-semibold uppercase" style={{ padding: '10px 14px', width: '34%' }}>
                    Module
                  </th>
                  <th scope="col" className="text-left font-semibold uppercase" style={{ padding: '10px 14px' }}>
                    Status
                  </th>
                  <th scope="col" className="text-left font-semibold uppercase" style={{ padding: '10px 14px', width: 84 }}>
                    Sections
                  </th>
                  <th scope="col" className="text-left font-semibold uppercase" style={{ padding: '10px 14px', width: 84 }}>
                    KC Score
                  </th>
                  <th
                    scope="col"
                    className="hidden text-left font-semibold uppercase lg:table-cell"
                    style={{ padding: '10px 14px', width: 64 }}
                  >
                    Time
                  </th>
                  <th
                    scope="col"
                    className="text-right font-semibold uppercase"
                    // Wider right padding so the "DETAILS" label and the
                    // chevron in the body don't crowd the table's right
                    // edge. The column is the rightmost cell, so its cell
                    // boundary IS the table's right border.
                    style={{ padding: '10px 22px 10px 10px', width: 80 }}
                  >
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.map((s) => {
                  const expanded = expandedId === s.moduleId;
                  const detailId = `module-${s.moduleId}-detail`;
                  return (
                    <ModuleRowDesktop
                      key={s.moduleId}
                      stats={s}
                      expanded={expanded}
                      detailId={detailId}
                      onToggle={() => toggle(s.moduleId)}
                      onArtifactClick={setActiveArtifact}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile: stacked cards (4D §13.2). */}
          <div className="md:hidden">
            {stats.map((s) => {
              const expanded = expandedId === s.moduleId;
              const detailId = `module-${s.moduleId}-detail-mobile`;
              return (
                <ModuleCardMobile
                  key={s.moduleId}
                  stats={s}
                  expanded={expanded}
                  detailId={detailId}
                  onToggle={() => toggle(s.moduleId)}
                  onArtifactClick={setActiveArtifact}
                />
              );
            })}
          </div>
        </div>
      </section>

      <ArtifactViewerModal
        isOpen={activeArtifact !== null}
        onClose={() => setActiveArtifact(null)}
        title={activeArtifact?.label ?? ''}
        content={activeArtifact?.content ?? ''}
      />
    </>
  );
}

function StatusBar({ pct, accent }: { pct: number; accent: string }): JSX.Element {
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct * 100)}
      className="rounded-full"
      style={{
        background: 'rgb(var(--border-light))',
        height: 6,
        overflow: 'hidden',
        // No minWidth here. The bar fills its column. The table wrapper's
        // overflow-x:auto + table minWidth handle the narrow-viewport case.
        width: '100%',
      }}
    >
      <div
        style={{
          width: `${pct * 100}%`,
          height: '100%',
          background: accent,
        }}
      />
    </div>
  );
}

function ModuleRowDesktop({
  stats,
  expanded,
  detailId,
  onToggle,
  onArtifactClick,
}: {
  stats: ModuleStats;
  expanded: boolean;
  detailId: string;
  onToggle: () => void;
  onArtifactClick: (a: ArtifactRef) => void;
}): JSX.Element {
  const accent = MODULE_ACCENT[stats.moduleId];
  const pct = stats.total === 0 ? 0 : stats.done / stats.total;
  const moduleLabelId = `module-${stats.moduleId}-label`;
  return (
    <>
      <tr
        className="border-t border-border-light hover:bg-[rgb(var(--surface))]"
        style={{ borderLeft: `3px solid ${accent}` }}
      >
        <td
          id={moduleLabelId}
          className="font-sans text-body-sm text-ink"
          style={{ padding: '14px 14px', fontWeight: 500 }}
        >
          <span className="font-mono font-bold mr-2">{stats.moduleId}</span>
          <span className="font-normal text-secondary">— {MODULE_TITLES[stats.moduleId]}</span>
        </td>
        <td style={{ padding: '14px 14px' }}>
          <StatusBar pct={pct} accent={accent} />
        </td>
        <td className="font-mono text-body-sm text-ink" style={{ padding: '14px 14px' }}>
          {stats.done}/{stats.total}
        </td>
        <td className="font-mono text-body-sm text-ink" style={{ padding: '14px 14px' }}>
          {stats.attempted === 0 ? '—' : `${stats.preferred}/${stats.attempted}`}
        </td>
        <td
          className="hidden font-mono text-body-sm text-tertiary lg:table-cell"
          style={{ padding: '14px 14px' }}
        >
          {stats.time}
        </td>
        <td
          style={{ padding: '14px 16px 14px 10px' }}
          className="text-right"
        >
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            aria-controls={detailId}
            aria-label={`${expanded ? 'Collapse' : 'Expand'} Module ${stats.moduleId} detail`}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-tertiary hover:bg-surface hover:text-ink"
          >
            <Icon name={expanded ? 'chevronDown' : 'chevronRight'} size={16} />
          </button>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td
            id={detailId}
            colSpan={6}
            role="region"
            aria-labelledby={moduleLabelId}
            style={{
              padding: '8px 14px 18px',
              borderLeft: `3px solid ${accent}`,
              borderTop: '1px solid rgb(var(--border-light))',
              background: 'rgb(var(--surface))',
            }}
          >
            <ModuleDetail stats={stats} onArtifactClick={onArtifactClick} />
          </td>
        </tr>
      )}
    </>
  );
}

function ModuleCardMobile({
  stats,
  expanded,
  detailId,
  onToggle,
  onArtifactClick,
}: {
  stats: ModuleStats;
  expanded: boolean;
  detailId: string;
  onToggle: () => void;
  onArtifactClick: (a: ArtifactRef) => void;
}): JSX.Element {
  const accent = MODULE_ACCENT[stats.moduleId];
  const pct = stats.total === 0 ? 0 : stats.done / stats.total;
  return (
    <article
      className="border-b border-border-light"
      style={{
        borderLeft: `3px solid ${accent}`,
        padding: '14px 16px',
      }}
    >
      <div className="font-mono font-bold text-[11px] uppercase text-tertiary mb-1">
        Module {stats.moduleId}
      </div>
      <div className="font-sans text-h4 font-semibold text-ink mb-2">
        {MODULE_TITLES[stats.moduleId]}
      </div>
      <div className="mb-2">
        <StatusBar pct={pct} accent={accent} />
      </div>
      <div className="font-mono text-[11px] text-tertiary mb-3">
        {stats.done}/{stats.total} sections · {stats.attempted === 0 ? '—' : `${stats.preferred}/${stats.attempted} KC`} · {stats.time}
      </div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={detailId}
        className="inline-flex items-center gap-1 font-sans text-[12.5px] font-semibold text-action"
      >
        {expanded ? 'Hide details' : 'View details'}
        <Icon name={expanded ? 'chevronDown' : 'chevronRight'} size={14} />
      </button>
      {expanded && (
        <div id={detailId} className="mt-3" role="region">
          <ModuleDetail stats={stats} onArtifactClick={onArtifactClick} compact />
        </div>
      )}
    </article>
  );
}

function ModuleDetail({
  stats,
  onArtifactClick,
  compact = false,
}: {
  stats: ModuleStats;
  onArtifactClick: (a: ArtifactRef) => void;
  compact?: boolean;
}): JSX.Element {
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: compact ? '1fr' : '1fr', maxWidth: 720 }}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="font-mono text-tertiary text-[10px] uppercase" style={{ letterSpacing: '0.06em' }}>
            <th scope="col" className="text-left font-semibold" style={{ padding: '6px 8px' }}>
              Section
            </th>
            <th scope="col" className="text-center font-semibold" style={{ padding: '6px 8px', width: 90 }}>
              Scrolled
            </th>
            <th scope="col" className="text-center font-semibold" style={{ padding: '6px 8px', width: 110 }}>
              Interaction
            </th>
          </tr>
        </thead>
        <tbody>
          {stats.sections.map((s) => (
            <tr key={s.id} className="border-t border-border-light">
              <td className="font-sans text-body-sm text-ink" style={{ padding: '7px 8px' }}>
                {s.label}
              </td>
              <td style={{ padding: '7px 8px' }} className="text-center">
                <CheckIcon done={s.scrolled} />
              </td>
              <td style={{ padding: '7px 8px' }} className="text-center">
                <CheckIcon done={s.interaction} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {stats.artifacts.length > 0 && (
        <div className="mt-3">
          <div
            className="mb-2 font-mono text-[10px] font-semibold uppercase text-tertiary"
            style={{ letterSpacing: '0.06em' }}
          >
            Learner Artifacts
          </div>
          <ul className="m-0 list-none p-0 space-y-1.5">
            {stats.artifacts.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => onArtifactClick(a)}
                  className="block w-full rounded-md text-left transition-colors duration-150 hover:bg-[rgb(var(--white))]"
                  style={{
                    border: '1px solid rgb(var(--border-light))',
                    padding: '8px 10px',
                    background: 'rgb(var(--white))',
                  }}
                >
                  <div className="font-mono text-[10.5px] font-semibold uppercase text-tertiary mb-0.5" style={{ letterSpacing: '0.06em' }}>
                    {a.label}
                  </div>
                  <div className="font-sans text-[12.5px] text-secondary" style={{ lineHeight: 1.4 }}>
                    {truncate(a.content, 120)}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function CheckIcon({ done }: { done: boolean }): JSX.Element {
  if (done) {
    return (
      <span
        className="inline-flex h-5 w-5 items-center justify-center rounded-full"
        aria-label="Complete"
        style={{
          background: 'rgb(var(--success))',
          color: 'rgb(var(--white))',
        }}
      >
        <Icon name="check" size={12} />
      </span>
    );
  }
  return (
    <span
      className="inline-block h-5 w-5 rounded-full"
      aria-label="Not complete"
      style={{
        border: '1.5px solid rgb(var(--ghost))',
      }}
    />
  );
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n).trimEnd() + '…';
}
