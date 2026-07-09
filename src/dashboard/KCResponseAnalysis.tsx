// KCResponseAnalysis — knowledge check + interpretation check breakdown
// organized by module (4D §9). Each item card shows the selected option and
// whether it matched the preferred response. Module 1 also shows IC items
// under a separate subheading; other modules don't have ICs.

import { useMemo } from 'react';
import type { LearnerProgressState } from '../contexts/LearnerProgressContext';
import { Overline } from '../components/shared/Overline';
import {
  IC_IDS,
  IC_METADATA,
  KC_IDS,
  KC_METADATA,
  type KCMetadata,
} from './kc-metadata';
import type { ModuleId } from './section-labels';

interface KCResponseAnalysisProps {
  progress: LearnerProgressState;
}

// Theme-adaptive competency text tokens — the previous hardcoded
// light-mode tints (#3D4A35 family) sat near-invisible on the dark
// canvas (same fix as the module overline at the IC block below).
const MODULE_OVERLINE: Record<ModuleId, { label: string; color: string }> = {
  1: { label: 'Module 1 — Context', color: 'rgb(var(--delegation-text))' },
  2: { label: 'Module 2 — Evidence', color: 'rgb(var(--description-text))' },
  3: { label: 'Module 3 — Mechanism', color: 'rgb(var(--discernment-text))' },
  4: { label: 'Module 4 — Application', color: 'rgb(var(--diligence-text))' },
};

interface ResponseRow {
  meta: KCMetadata;
  selected: string | null; // null = not attempted
  isPreferred: boolean | null;
  feedbackTone: 'success' | 'caution' | 'error' | null;
}

function buildKCRows(
  moduleId: ModuleId,
  progress: LearnerProgressState,
): ResponseRow[] {
  return KC_IDS[moduleId].map((kcId) => {
    const meta = KC_METADATA[kcId];
    // Storage key: `${moduleId}.${sectionId}.${kcId}` — section comes from metadata.
    const key = `${meta.moduleId}.${meta.sectionId}.${kcId}`;
    const stored = progress.knowledgeChecks[key];
    if (!stored) {
      return { meta, selected: null, isPreferred: null, feedbackTone: null };
    }
    const tone: 'success' | 'caution' | 'error' = stored.isPreferred
      ? 'success'
      : 'caution';
    return {
      meta,
      selected: stored.selectedOptionId,
      isPreferred: stored.isPreferred,
      feedbackTone: tone,
    };
  });
}

function buildICRows(progress: LearnerProgressState): ResponseRow[] {
  return IC_IDS[1].map((icId) => {
    const meta = IC_METADATA[icId];
    const key = `${meta.moduleId}.${meta.sectionId}.${icId}`;
    const stored = progress.knowledgeChecks[key];
    const fullMeta: KCMetadata = { ...meta, objectiveRef: '—' };
    if (!stored) {
      return { meta: fullMeta, selected: null, isPreferred: null, feedbackTone: null };
    }
    return {
      meta: fullMeta,
      selected: stored.selectedOptionId,
      isPreferred: stored.isPreferred,
      feedbackTone: stored.isPreferred ? 'success' : 'caution',
    };
  });
}

export function KCResponseAnalysis({ progress }: KCResponseAnalysisProps): JSX.Element {
  const moduleData = useMemo(() => {
    return ([1, 2, 3, 4] as const).map((id) => ({
      moduleId: id as ModuleId,
      kc: buildKCRows(id as ModuleId, progress),
      ic: id === 1 ? buildICRows(progress) : [],
    }));
  }, [progress]);

  return (
    <section aria-label="Knowledge check response analysis" className="grid gap-6 lg:grid-cols-2">
      {moduleData.map((m) => (
        <ModuleGroup
          key={m.moduleId}
          moduleId={m.moduleId}
          kc={m.kc}
          ic={m.ic}
        />
      ))}
    </section>
  );
}

function ModuleGroup({
  moduleId,
  kc,
  ic,
}: {
  moduleId: ModuleId;
  kc: ResponseRow[];
  ic: ResponseRow[];
}): JSX.Element {
  const m = MODULE_OVERLINE[moduleId];
  return (
    <article>
      <Overline className="mb-3" style={{ color: m.color, fontSize: 11 }}>
        {m.label}
      </Overline>
      <ul className="m-0 list-none p-0 space-y-2">
        {kc.map((row) => (
          <li key={row.meta.id}>
            <ResponseCard row={row} kind="kc" />
          </li>
        ))}
      </ul>
      {ic.length > 0 && (
        <>
          {/* `--discernment-text` flips for dark mode; the raw
              #5E7080 (discernment DEFAULT) stayed dark and lost
              contrast on the dark dashboard surface. */}
          <Overline
            className="mb-3 mt-5"
            style={{ color: 'rgb(var(--discernment-text))', fontSize: 11 }}
          >
            Interpretation Checks
          </Overline>
          <ul className="m-0 list-none p-0 space-y-2">
            {ic.map((row) => (
              <li key={row.meta.id}>
                <ResponseCard row={row} kind="ic" />
              </li>
            ))}
          </ul>
        </>
      )}
    </article>
  );
}

const TONE_COLOR: Record<NonNullable<ResponseRow['feedbackTone']>, string> = {
  success: 'rgb(var(--success))',
  caution: 'rgb(var(--caution))',
  error: 'rgb(var(--error))',
};

function ResponseCard({
  row,
  kind,
}: {
  row: ResponseRow;
  kind: 'kc' | 'ic';
}): JSX.Element {
  const isAttempted = row.selected !== null;
  const accent = isAttempted
    ? row.feedbackTone
      ? TONE_COLOR[row.feedbackTone]
      : 'rgb(var(--border-light))'
    : 'rgb(var(--border-light))';

  // For IC display, the spec says use --info as left accent (4D §9.6) regardless
  // of the response tone.
  const leftAccent = kind === 'ic' ? '#5E7080' : accent;

  // Format the item ID label: kc_1_1 → "KC-1.1"; ic_1_1 → "IC-1.1"
  const idLabel = row.meta.id
    .replace(/^kc_/, 'KC-')
    .replace(/^ic_/, 'IC-')
    .replace(/_/g, '.');
  const objLabel = kind === 'kc' ? `Obj ${row.meta.objectiveRef}` : null;

  const selectedOption = isAttempted
    ? row.meta.options.find((o) => o.id === row.selected)
    : null;
  const preferredOption = row.meta.options.find((o) => o.id === row.meta.preferredOptionId);

  // Long-form border sides — using `border` shorthand alongside `borderLeft`
  // makes React emit a "shorthand vs non-shorthand" rerender warning. We split
  // the four sides explicitly so each prop is its own value.
  const sideStyle = isAttempted ? '1px solid rgb(var(--border))' : '1px dashed rgb(var(--border-light))';

  return (
    <article
      className="rounded-md"
      style={{
        background: isAttempted ? 'rgb(var(--white))' : 'rgb(var(--surface))',
        borderTop: sideStyle,
        borderRight: sideStyle,
        borderBottom: sideStyle,
        borderLeft: `3px solid ${leftAccent}`,
        padding: 12,
      }}
    >
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <span
            className="font-mono text-[12px] font-bold text-ink"
            style={{ letterSpacing: '0.04em' }}
          >
            {idLabel}
          </span>
          {objLabel && (
            <span className="font-mono text-[11px] text-tertiary">{objLabel}</span>
          )}
        </div>
        {isAttempted ? (
          <span
            className="font-sans text-[12.5px] font-semibold"
            style={{ color: row.feedbackTone ? TONE_COLOR[row.feedbackTone] : undefined }}
          >
            {row.isPreferred ? '✓ Preferred' : '✗ Not preferred'}
          </span>
        ) : (
          <span className="font-mono text-[11px] text-muted">Not attempted</span>
        )}
      </div>
      <div
        className="font-sans text-body-sm text-secondary"
        style={{ lineHeight: 1.45, marginBottom: isAttempted ? 8 : 0 }}
      >
        {row.meta.stemPreview}
      </div>
      {isAttempted && (
        <div className="font-mono text-[11px] flex flex-wrap gap-x-4 gap-y-0.5">
          <span className="text-secondary">
            Selected: <span className="text-ink">{selectedOption?.label ?? row.selected}</span>
          </span>
          {!row.isPreferred && preferredOption && (
            <span className="text-muted">
              Preferred: {preferredOption.label}
            </span>
          )}
        </div>
      )}
    </article>
  );
}
