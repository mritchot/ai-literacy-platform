// P3 View A — Adoption by Occupation. Dumbbell / connected-dot plot
// modeled on Handa et al. Figure 1 (p. 6): each occupation row shows the
// share of Claude.ai conversations alongside the share of the U.S.
// workforce, with a connecting line that makes the gap (the
// over/under-representation) the visible signal. Replaces the earlier
// paired-bar treatment per design feedback.

import { useMemo, useState } from 'react';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { TOKEN_HEX } from '../../utils/chart-config';
import { useViewport } from '../../hooks/useViewport';

interface OccupationRow {
  occupation: string;
  claude_pct: number;
  us_workforce_pct: number;
  overrepresentation_ratio: number;
}

type SortKey = 'overrepresentation_ratio' | 'claude_pct' | 'us_workforce_pct';

interface AugAutoViewAProps {
  categories: OccupationRow[];
  occupationDepthInsight: string;
}

const SORT_OPTIONS: { id: SortKey; label: string }[] = [
  { id: 'overrepresentation_ratio', label: 'By overrepresentation' },
  { id: 'claude_pct', label: 'By AI usage share' },
  { id: 'us_workforce_pct', label: 'By workforce share' },
];

const X_AXIS_TICKS = [0, 10, 20, 30, 40] as const;

// Marker styles. The Claude series uses a filled disc in the action color
// so the "AI" reading reads quickly; the workforce series uses a hollow
// ring in the tertiary tone so it reads as the baseline reference.
const CLAUDE_FILL = TOKEN_HEX.action;
const WORKFORCE_FILL = TOKEN_HEX.tertiary;

export function AugAutoViewA({
  categories,
  occupationDepthInsight,
}: AugAutoViewAProps): JSX.Element {
  const { track } = useAnalytics();
  const [sortKey, setSortKey] = useState<SortKey>('overrepresentation_ratio');

  const sorted = useMemo(
    () => [...categories].sort((a, b) => b[sortKey] - a[sortKey]),
    [categories, sortKey],
  );

  // Domain ceiling — round the global max up to the next tick so the
  // X-axis grid lines line up cleanly with the largest dot.
  const domainMax = useMemo(() => {
    const maxObserved = categories.reduce(
      (acc, c) => Math.max(acc, c.claude_pct, c.us_workforce_pct),
      0,
    );
    return Math.max(40, Math.ceil(maxObserved / 5) * 5);
  }, [categories]);

  const ariaLabel = `Connected dot plot for 22 occupation categories: each row shows the share of AI conversations (${CLAUDE_FILL}) and the share of the U.S. workforce (${WORKFORCE_FILL}), connected by a line whose length is the gap. Sorted by ${
    SORT_OPTIONS.find((o) => o.id === sortKey)?.label.toLowerCase() ?? 'overrepresentation'
  }.`;

  return (
    <div className="space-y-5">
      <p className="m-0 font-sans text-body-sm text-body">
        Each row shows an occupation's share of AI conversations alongside its share of the U.S.
        workforce. The line between the two dots is the gap: its length is the
        over- or under-representation. Computer and Mathematical leads at 37.2% of conversations
        against 3.4% of the workforce (10.9× overrepresentation). The tail end shows occupations
        where AI usage is near zero despite substantial workforce shares.
      </p>

      <div role="group" aria-label="Sort order" className="flex flex-wrap gap-2">
        {SORT_OPTIONS.map((opt) => {
          const active = sortKey === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                setSortKey(opt.id);
                track({ type: 'p3_view_a_sorted', moduleId: 2, sectionId: 3, payload: { sortKey: opt.id } });
              }}
              aria-pressed={active}
              className="rounded-full font-sans text-[12.5px] transition-colors duration-150"
              style={{
                padding: '5px 14px',
                border: `1.5px solid ${active ? 'rgb(var(--ink))' : 'rgb(var(--border))'}`,
                background: active ? 'rgb(var(--ink))' : 'rgb(var(--white))',
                color: active ? 'rgb(var(--white))' : 'rgb(var(--secondary))',
                fontWeight: active ? 600 : 500,
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      <DumbbellLegend />

      <figure
        className="m-0"
        aria-label={ariaLabel}
        role="img"
      >
        <DumbbellChart rows={sorted} domainMax={domainMax} />
      </figure>

      {/* Visually-hidden table for screen readers (4A spec §10.1) */}
      <table className="sr-only">
        <caption>AI conversation share vs. U.S. workforce share by occupation</caption>
        <thead>
          <tr>
            <th scope="col">Occupation</th>
            <th scope="col">AI share (%)</th>
            <th scope="col">Workforce share (%)</th>
            <th scope="col">Overrepresentation ratio</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((c) => (
            <tr key={c.occupation}>
              <td>{c.occupation}</td>
              <td>{c.claude_pct}</td>
              <td>{c.us_workforce_pct}</td>
              <td>{c.overrepresentation_ratio}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <aside
        role="note"
        className="rounded-lg bg-surface-warm"
        style={{
          borderLeft: `3px solid ${TOKEN_HEX.info}`,
          border: '1px solid rgb(var(--border))',
          padding: '14px 18px',
        }}
      >
        <div className="font-mono text-overline font-bold uppercase text-tertiary" style={{ letterSpacing: '0.1em' }}>
          Depth of usage
        </div>
        <p className="m-0 mt-1.5 font-sans text-body-sm text-body">{occupationDepthInsight}</p>
      </aside>

      <p className="m-0 font-mono text-caption text-muted" style={{ letterSpacing: '0.02em' }}>
        Source: Handa et al., Feb 2025, Figure 1 (p. 6), Table 1, Appendix B.7 (p. 21).
      </p>
    </div>
  );
}

function DumbbellLegend(): JSX.Element {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-1.5 font-mono text-[11px] text-tertiary">
      <span className="inline-flex items-center gap-2">
        <span
          aria-hidden="true"
          className="inline-block rounded-full"
          style={{ width: 10, height: 10, background: CLAUDE_FILL }}
        />
        Share of AI conversations (Claude.ai)
      </span>
      <span className="inline-flex items-center gap-2">
        <span
          aria-hidden="true"
          className="inline-block rounded-full"
          style={{
            width: 10,
            height: 10,
            background: 'transparent',
            border: `2px solid ${WORKFORCE_FILL}`,
            boxSizing: 'border-box',
          }}
        />
        Share of U.S. workforce
      </span>
      <span className="inline-flex items-center gap-2">
        <span
          aria-hidden="true"
          className="inline-block"
          style={{ width: 18, height: 1, background: 'rgb(var(--border))' }}
        />
        Connecting line: visualizes the gap
      </span>
    </div>
  );
}

function DumbbellChart({
  rows,
  domainMax,
}: {
  rows: OccupationRow[];
  domainMax: number;
}): JSX.Element {
  // Track measurements. The label + value columns are viewport-responsive
  // because the desktop widths (230 + 110 = 340 px) leave essentially no
  // room for the dumbbell track itself on a 358-px-wide mobile viewport.
  // Mobile uses tighter columns (140 + 92 = 232 px) so the track has
  // ~126 px to render the dots and connecting line — visible if compact.
  // The container's `overflow-hidden` always prevented this from causing
  // page-level horizontal scroll; this fix is about readability, not
  // overflow safety.
  const viewport = useViewport();
  const isMobile = viewport === 'mobile';
  const ROW_HEIGHT = isMobile ? 30 : 26;
  const LABEL_WIDTH = isMobile ? 140 : 230;
  const VALUE_WIDTH = isMobile ? 92 : 110;
  const AXIS_HEIGHT = 28;
  const DOT_SIZE = 10;

  const pctToLeft = (pct: number) => `${(pct / domainMax) * 100}%`;

  return (
    <div
      className="relative w-full overflow-hidden rounded-md"
      style={{
        background: 'rgb(var(--white))',
        border: '1px solid rgb(var(--border))',
      }}
    >
      {/* X-axis (top) — references the same domain as every row track. */}
      <div
        className="relative flex"
        style={{
          height: AXIS_HEIGHT,
          borderBottom: '1px solid rgb(var(--border-light))',
          background: 'rgb(var(--surface-warm))',
        }}
      >
        <div style={{ width: LABEL_WIDTH, flexShrink: 0 }} />
        <div className="relative flex-1" style={{ marginRight: VALUE_WIDTH }}>
          {X_AXIS_TICKS.filter((t) => t <= domainMax).map((t) => (
            <div
              key={t}
              className="absolute -translate-x-1/2 font-mono text-[11px] text-tertiary"
              style={{
                left: pctToLeft(t),
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              {t}%
            </div>
          ))}
        </div>
      </div>

      {/* Rows */}
      <ul className="m-0 list-none p-0">
        {rows.map((row, i) => {
          const claude = row.claude_pct;
          const workforce = row.us_workforce_pct;
          const minPct = Math.min(claude, workforce);
          const maxPct = Math.max(claude, workforce);
          const claudeLeft = pctToLeft(claude);
          const workforceLeft = pctToLeft(workforce);
          const lineLeft = pctToLeft(minPct);
          const lineWidth = pctToLeft(maxPct - minPct);
          const isOverrepresented = row.overrepresentation_ratio >= 1;
          const tooltipText = `${row.occupation}: ${claude}% AI share vs. ${workforce}% workforce share, ${row.overrepresentation_ratio}× ${
            isOverrepresented ? 'overrepresented' : 'underrepresented'
          }`;

          return (
            <li
              key={row.occupation}
              className="flex items-center"
              style={{
                height: ROW_HEIGHT,
                borderTop: i === 0 ? 'none' : '1px solid rgb(var(--border-light))',
              }}
              title={tooltipText}
            >
              {/* Occupation label */}
              <div
                className="font-sans text-[12px] text-body"
                style={{
                  width: LABEL_WIDTH,
                  flexShrink: 0,
                  padding: '0 12px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {row.occupation}
              </div>

              {/* Dumbbell track */}
              <div
                className="relative flex-1"
                style={{ height: ROW_HEIGHT, marginRight: VALUE_WIDTH }}
              >
                {/* Subtle vertical gridlines aligned to the X-axis ticks */}
                {X_AXIS_TICKS.filter((t) => t <= domainMax).map((t) => (
                  <div
                    key={t}
                    aria-hidden="true"
                    className="absolute"
                    style={{
                      left: pctToLeft(t),
                      top: 0,
                      bottom: 0,
                      width: 1,
                      background: 'rgb(var(--border-light))',
                      opacity: 0.5,
                    }}
                  />
                ))}

                {/* Connecting line — drawn first so dots sit on top */}
                <div
                  aria-hidden="true"
                  className="absolute"
                  style={{
                    left: lineLeft,
                    width: lineWidth,
                    top: '50%',
                    height: 1.5,
                    background: 'rgb(var(--ghost))',
                    transform: 'translateY(-50%)',
                  }}
                />

                {/* Workforce marker (hollow ring) */}
                <div
                  aria-hidden="true"
                  className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    left: workforceLeft,
                    top: '50%',
                    width: DOT_SIZE,
                    height: DOT_SIZE,
                    background: 'rgb(var(--white))',
                    border: `2px solid ${WORKFORCE_FILL}`,
                    boxSizing: 'border-box',
                  }}
                />

                {/* Claude marker (filled disc) */}
                <div
                  aria-hidden="true"
                  className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    left: claudeLeft,
                    top: '50%',
                    width: DOT_SIZE,
                    height: DOT_SIZE,
                    background: CLAUDE_FILL,
                  }}
                />
              </div>

              {/* Numeric values + ratio */}
              <div
                className="flex items-center justify-end gap-2 font-mono text-[11px]"
                style={{
                  width: VALUE_WIDTH,
                  flexShrink: 0,
                  padding: '0 12px',
                  marginLeft: -VALUE_WIDTH,
                }}
              >
                <span style={{ color: CLAUDE_FILL, fontWeight: 600 }}>{claude}%</span>
                <span className="text-ghost">·</span>
                <span style={{ color: WORKFORCE_FILL }}>{workforce}%</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
