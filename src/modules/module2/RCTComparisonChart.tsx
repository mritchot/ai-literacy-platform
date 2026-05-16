// S4: RCTComparisonChart — two horizontal range bars contrasting how
// time savings get measured. The chart was previously a single dot
// plot that anchored the 81% AI-estimated median against four
// scattered RCT findings — visually that made the median feel like
// the "real" number and the trials feel like noise. Now both
// measurement approaches read as equal frames:
//
//   Row 1 (in-conversation, 20–95% with median 81%) — the
//          self-estimated savings inside the AI conversation window.
//   Row 2 (full work cycle, 14–56% across four RCTs) — the net
//          savings once verification and revision are included.
//
// Implementation: HTML/CSS rather than Recharts. The bars are
// percentage-positioned divs inside a relative-layout track, so they
// scale fluidly with container width. CSS variables (`--action`,
// `--info`) supply the bar colors directly via `rgb(var(--…))`,
// which means dark mode flips automatically through the existing
// design-token system — no `useChartTokens` extension needed.
//
// Source: Tamkin & McCrory, Nov 2025.

import { useState, type CSSProperties } from 'react';
import { TOKEN_HEX } from '../../utils/chart-config';

interface RCTComparisonChartProps {
  median: number;
  rctFindings: number[];
  note: string;
}

// Constants per the redesign spec. Pulled out as named constants so the
// values + their provenance (source paper) are explicit at the top.
const IN_CONVERSATION_MIN = 20; // diagnostic images — lowest documented task savings
const IN_CONVERSATION_MAX = 95; // compiling reports — highest documented task savings

const ROW_HEIGHT = 30; // px — bar fill height
const TRACK_HEIGHT = 44; // px — track height (allows margin around bar)

const X_TICKS = [0, 20, 40, 60, 80, 100];

export function RCTComparisonChart({
  median,
  rctFindings,
  note,
}: RCTComparisonChartProps): JSX.Element {
  const fullCycleMin = Math.min(...rctFindings);
  const fullCycleMax = Math.max(...rctFindings);

  const ariaLabel =
    `Range bar chart comparing two ways of measuring AI time savings. ` +
    `In-conversation savings range from ${IN_CONVERSATION_MIN}% (checking diagnostic images) ` +
    `to ${IN_CONVERSATION_MAX}% (compiling information from reports), with a median of ${median}% ` +
    `across 100,000 conversations. Full work-cycle savings range from ${fullCycleMin}% to ` +
    `${fullCycleMax}% across four randomized controlled trials, measuring the complete task ` +
    `including verification and refinement.`;

  return (
    <figure className="m-0" aria-label={ariaLabel}>
      <div
        className="grid items-center"
        style={{
          gridTemplateColumns: 'minmax(140px, max-content) 1fr',
          columnGap: 18,
          rowGap: 14,
        }}
      >
        {/* Row 1 — in-conversation */}
        <RowLabel>In-conversation</RowLabel>
        <RangeTrack
          ariaRowLabel="In-conversation"
          colorVar="--action"
          min={IN_CONVERSATION_MIN}
          max={IN_CONVERSATION_MAX}
          medianMarker={{ value: median, label: `${median}% median` }}
          tooltipText={`In-conversation savings: ${IN_CONVERSATION_MIN}%–${IN_CONVERSATION_MAX}% range, ${median}% median. Measures only the time spent in the AI interaction.`}
        />

        {/* Row 2 — full work cycle */}
        <RowLabel>Full work cycle</RowLabel>
        <RangeTrack
          ariaRowLabel="Full work cycle"
          colorVar="--info"
          min={fullCycleMin}
          max={fullCycleMax}
          dataPoints={rctFindings.map((v) => ({ value: v, label: `${v}%` }))}
          tooltipText={`Full-cycle savings: ${fullCycleMin}%–${fullCycleMax}% range across four controlled trials. Measures the complete task including verification and refinement.`}
        />

        {/* Axis row — empty label cell + tick row spanning the bars column */}
        <div />
        <AxisRow ticks={X_TICKS} />
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 font-mono text-[11px] text-tertiary">
        <span className="inline-flex items-center gap-1.5">
          <DiamondGlyph color="var(--action)" />
          In-conversation range ({IN_CONVERSATION_MIN}–{IN_CONVERSATION_MAX}%, median {median}%)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CircleGlyph color="var(--info)" />
          Full work cycle range ({fullCycleMin}–{fullCycleMax}%, four controlled trials)
        </span>
      </div>

      {/* Caveat note about the negative-finding RCT and earlier model gens */}
      <p
        className="m-0 mt-3 font-sans text-body-sm"
        style={{ color: TOKEN_HEX.error, fontStyle: 'italic' }}
      >
        {note}
      </p>

      <figcaption
        className="mt-3 font-mono text-caption text-muted"
        style={{ letterSpacing: '0.02em' }}
      >
        Source: Tamkin &amp; McCrory, Nov 2025. In-conversation: Figure 6 (median), Figure 5
        (task distribution). Full-cycle: RCT comparison, pp. 6–8.
      </figcaption>
    </figure>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Row label
// ─────────────────────────────────────────────────────────────────────

function RowLabel({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <div
      className="font-sans text-body-sm font-medium text-ink"
      style={{ paddingRight: 4 }}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Range track — one row of the chart
// ─────────────────────────────────────────────────────────────────────

interface RangeTrackProps {
  ariaRowLabel: string;
  colorVar: '--action' | '--info';
  min: number;
  max: number;
  medianMarker?: { value: number; label: string };
  dataPoints?: { value: number; label: string }[];
  tooltipText: string;
}

function RangeTrack({
  ariaRowLabel,
  colorVar,
  min,
  max,
  medianMarker,
  dataPoints,
  tooltipText,
}: RangeTrackProps): JSX.Element {
  const [hovered, setHovered] = useState(false);

  const trackStyle: CSSProperties = {
    position: 'relative',
    height: TRACK_HEIGHT,
    width: '100%',
  };

  // Subtle vertical grid lines at every X tick — match the axis below.
  const gridLines = X_TICKS.map((tick) => (
    <div
      key={tick}
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: `${tick}%`,
        top: 0,
        bottom: 0,
        width: 1,
        background: 'rgb(var(--border-light))',
        opacity: tick === 0 || tick === 100 ? 0.6 : 0.4,
      }}
    />
  ));

  return (
    <div
      style={trackStyle}
      role="img"
      aria-label={`${ariaRowLabel}: ${tooltipText}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {gridLines}

      {/* Range bar — fill spans [min%, max%] of the track width. */}
      <div
        style={{
          position: 'absolute',
          left: `${min}%`,
          width: `${max - min}%`,
          top: (TRACK_HEIGHT - ROW_HEIGHT) / 2,
          height: ROW_HEIGHT,
          background: `rgb(var(${colorVar}) / 0.25)`,
          border: `1px solid rgb(var(${colorVar}) / 0.5)`,
          borderRadius: 5,
        }}
      />

      {/* Median marker (Row 1 only) — a 9×9 diamond glyph at the
          median percentage, vertically centered in the track. The
          diamond shape signals "summary statistic across many
          conversations" (vs. the circles on Row 2, which are
          point estimates from individual RCTs), but it's sized to
          match the circles so neither row's marker dominates the
          other. The label sits inline to the right of the diamond,
          vertically centered with the marker, so it doesn't add
          chart height or compete with adjacent rows. */}
      {medianMarker && (
        <>
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: `${medianMarker.value}%`,
              top: '50%',
              width: 9,
              height: 9,
              transform: 'translate(-50%, -50%) rotate(45deg)',
              background: `rgb(var(${colorVar}))`,
              border: '1.5px solid rgb(var(--white))',
            }}
          />
          <span
            aria-hidden="true"
            className="font-mono text-caption"
            style={{
              position: 'absolute',
              left: `${medianMarker.value}%`,
              top: '50%',
              transform: 'translateY(-50%)',
              marginLeft: 8,
              color: `rgb(var(${colorVar}))`,
              fontWeight: 600,
              letterSpacing: '0.02em',
              whiteSpace: 'nowrap',
            }}
          >
            {medianMarker.label}
          </span>
        </>
      )}

      {/* Data points (Row 2) — circles at each RCT value. */}
      {dataPoints?.map((p) => (
        <div
          key={p.value}
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: `${p.value}%`,
            top: '50%',
            width: 9,
            height: 9,
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            background: `rgb(var(${colorVar}))`,
            border: '1.5px solid rgb(var(--white))',
          }}
        />
      ))}

      {/* Hover tooltip — styled to match the design system's existing
          chart tooltips. Positioned above the bar so it doesn't
          obscure the data. */}
      {hovered && (
        <div
          role="tooltip"
          style={{
            position: 'absolute',
            left: `${(min + max) / 2}%`,
            bottom: TRACK_HEIGHT + 6,
            transform: 'translateX(-50%)',
            background: 'rgb(var(--white))',
            border: '1px solid rgb(var(--border))',
            borderRadius: 6,
            padding: '8px 10px',
            fontSize: 12,
            color: 'rgb(var(--ink))',
            maxWidth: 320,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            zIndex: 5,
            pointerEvents: 'none',
          }}
        >
          <div className="font-sans font-semibold" style={{ marginBottom: 2 }}>
            {ariaRowLabel}
          </div>
          <div
            className="font-sans"
            style={{
              color: 'rgb(var(--secondary))',
              lineHeight: 1.4,
              fontSize: 11.5,
            }}
          >
            {tooltipText}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Axis row
// ─────────────────────────────────────────────────────────────────────

function AxisRow({ ticks }: { ticks: number[] }): JSX.Element {
  return (
    <div
      style={{
        position: 'relative',
        height: 22,
        width: '100%',
        marginTop: 2,
      }}
    >
      {/* Top axis line */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background: 'rgb(var(--border-light))',
        }}
      />
      {ticks.map((t) => (
        <div
          key={t}
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: `${t}%`,
            top: 0,
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Tick mark */}
          <div
            style={{
              width: 1,
              height: 4,
              background: 'rgb(var(--border))',
            }}
          />
          {/* Tick label */}
          <span
            className="font-mono text-[10px] text-tertiary"
            style={{ marginTop: 2, letterSpacing: '0.02em' }}
          >
            {t}%
          </span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Legend glyphs
// ─────────────────────────────────────────────────────────────────────

function DiamondGlyph({ color }: { color: string }): JSX.Element {
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-block',
        width: 9,
        height: 9,
        background: `rgb(${color})`,
        transform: 'rotate(45deg)',
      }}
    />
  );
}

function CircleGlyph({ color }: { color: string }): JSX.Element {
  return (
    <span
      aria-hidden="true"
      className="rounded-full"
      style={{
        display: 'inline-block',
        width: 9,
        height: 9,
        background: `rgb(${color})`,
      }}
    />
  );
}
