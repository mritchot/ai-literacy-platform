// Story 1: SkillDemandBar — top-10 fastest-rising workforce skills from
// the WEF Future of Jobs Report 2025 (4C spec §3.2).
// Source: WEF 2025, Figure 3.4, pp. 36–37.

import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AXIS_TICK_STYLE,
  TOOLTIP_ITEM_STYLE,
  TOOLTIP_LABEL_STYLE,
  TOOLTIP_STYLE,
} from '../../utils/chart-config';
import { useChartTokens } from '../../hooks/useChartTokens';
import { useViewport } from '../../hooks/useViewport';

interface SkillRow {
  rank: number;
  skill: string;
  netIncrease: number;
}

interface SkillDemandBarProps {
  skills: SkillRow[];
  instability: {
    prior2020: number;
    prior2023: number;
    current: number;
  };
}

const TOP_N = 10;

export function SkillDemandBar({ skills, instability }: SkillDemandBarProps): JSX.Element {
  const tokens = useChartTokens();
  const viewport = useViewport();
  const top = useMemo(() => skills.slice(0, TOP_N), [skills]);

  const ariaLabel = `Horizontal bar chart of the top ${TOP_N} fastest-rising workforce skills by net-increase score: ${top
    .map((s) => `${s.skill} at ${s.netIncrease}`)
    .join(', ')}.`;

  // Mobile renders a vertical-list layout instead of Recharts. The
  // Recharts horizontal-bar layout reserves a fixed-pixel left margin
  // for category labels (YAxis width: 210); at ~358px mobile width that
  // leaves only ~148px for the bars themselves, which makes the data
  // visually unreadable. The vertical-list layout uses the full
  // viewport width for each bar with the label on its own line above.
  return (
    <figure className="m-0" aria-label={ariaLabel}>
      {viewport === 'mobile' ? (
        <MobileSkillsList rows={top} tokens={tokens} />
      ) : (
        <div style={{ width: '100%', height: TOP_N * 32 + 60 }}>
          <ResponsiveContainer>
            <BarChart layout="vertical" data={top} margin={{ top: 8, right: 36, bottom: 8, left: 16 }} barCategoryGap={8}>
              <XAxis
                type="number"
                domain={[0, 'auto']}
                // WEF Figure 3.4 expresses net-increase as a percentage —
                // the difference between the share of employers expecting a
                // skill to grow and the share expecting it to shrink. Bare
                // integers read as ambiguous; the % suffix names the unit.
                tickFormatter={(v) => `${v}%`}
                tick={AXIS_TICK_STYLE}
                stroke="rgb(var(--border-light))"
              />
              <YAxis
                type="category"
                dataKey="skill"
                tick={{ ...AXIS_TICK_STYLE, fontSize: 12 }}
                width={210}
                interval={0}
                stroke="rgb(var(--border-light))"
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                itemStyle={TOOLTIP_ITEM_STYLE}
                labelStyle={TOOLTIP_LABEL_STYLE}
                cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                formatter={(value: number) => [`${value}%`, 'Net increase']}
                labelFormatter={(label) => label}
              />
              <Bar
                dataKey="netIncrease"
                isAnimationActive
                animationDuration={400}
               
              >
                {top.map((row) => (
                  <Cell
                    key={row.skill}
                    fill={row.rank === 1 ? tokens.action : tokens.secondary}
                    fillOpacity={row.rank === 1 ? 1 : 0.7}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Visually-hidden table for screen readers */}
      <table className="sr-only">
        <caption>Top {TOP_N} fastest-rising workforce skills by net increase</caption>
        <thead>
          <tr>
            <th scope="col">Rank</th>
            <th scope="col">Skill</th>
            <th scope="col">Net increase score</th>
          </tr>
        </thead>
        <tbody>
          {top.map((s) => (
            <tr key={s.skill}>
              <td>{s.rank}</td>
              <td>{s.skill}</td>
              <td>{s.netIncrease}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <SkillInstabilityCallout instability={instability} />

      <figcaption
        className="mt-3 font-mono text-caption text-muted"
        style={{ letterSpacing: '0.02em' }}
      >
        Source: WEF Future of Jobs Report 2025, Figure 3.4, pp. 36–37; Figure 3.3, p. 35.
      </figcaption>
    </figure>
  );
}

// Mobile-only vertical-list rendering of the skills. Each row uses the
// full row width: label and percentage on the first line, full-width
// progress bar on the second. Bar widths are normalized to the max
// value in the visible set (rather than to an absolute 0-100 scale) so
// the relative differences between skills stay visually legible — the
// WEF data range is narrow (~60-90) and an absolute scale would make
// every bar look nearly full.
function MobileSkillsList({
  rows,
  tokens,
}: {
  rows: SkillRow[];
  tokens: ReturnType<typeof useChartTokens>;
}): JSX.Element {
  const maxValue = Math.max(...rows.map((r) => r.netIncrease));
  return (
    <div className="space-y-3" aria-hidden="true">
      {rows.map((row) => {
        const widthPct = (row.netIncrease / maxValue) * 100;
        const isTop = row.rank === 1;
        return (
          <div key={row.skill}>
            <div className="mb-1 flex items-baseline justify-between gap-3">
              <span
                className="font-sans text-body-sm text-ink"
                style={{ lineHeight: 1.35 }}
              >
                {row.skill}
              </span>
              <span
                className="font-mono text-caption font-semibold text-secondary"
                style={{ letterSpacing: '0.02em' }}
              >
                {row.netIncrease}%
              </span>
            </div>
            <div
              className="h-2 w-full overflow-hidden"
              style={{ background: 'rgb(var(--border-light))' }}
            >
              <div
                className="h-full transition-[width] duration-300"
                style={{
                  width: `${widthPct}%`,
                  background: isTop ? tokens.action : tokens.secondary,
                  opacity: isTop ? 1 : 0.7,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SkillInstabilityCallout({
  instability,
}: {
  instability: SkillDemandBarProps['instability'];
}): JSX.Element {
  const viewport = useViewport();
  const isMobile = viewport === 'mobile';
  const pct = (v: number) => `${Math.round(v * 100)}%`;
  const rows: { year: string; value: number }[] = [
    { year: '2020', value: instability.prior2020 },
    { year: '2023', value: instability.prior2023 },
    { year: '2025', value: instability.current },
  ];
  return (
    <aside
      className="mt-4 bg-surface-warm"
      style={{
        border: '1px solid rgb(var(--border))',
        padding: '14px 18px',
      }}
    >
      {/* `text-wrap: balance` evens out line widths when the title
          wraps on a narrow viewport. Without it the greedy line-break
          algorithm leaves "expected to change" as an orphan tail line
          on mobile; with it the wrap point shifts so both lines carry
          comparable weight. No-op on a wide enough viewport where the
          title fits on one line. */}
      <div
        className="mb-1.5 font-sans text-body-sm font-semibold text-ink"
        style={{ textWrap: 'balance' }}
      >
        Skills instability — share of core skills expected to change
      </div>
      {isMobile ? (
        // Mobile: stack the three data points vertically so each row gets
        // its own line. The single-line horizontal layout overflowed the
        // callout box on a 390-px viewport (three `%-(year)` nowrap units
        // separated by arrows didn't fit), and letting it wrap between
        // groups produced inconsistent multi-line presentations depending
        // on viewport. Stacking makes the temporal trend a clean
        // top-to-bottom read.
        <div className="mb-1.5 space-y-1 font-mono text-[13px] text-secondary" style={{ letterSpacing: '0.04em' }}>
          {rows.map((r) => (
            <div key={r.year} className="flex items-baseline gap-3">
              <span className="text-muted" style={{ minWidth: '3.25em' }}>{r.year}</span>
              <span className="text-ink font-semibold">{pct(r.value)}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="mb-1.5 font-mono text-[13px] text-secondary" style={{ letterSpacing: '0.04em' }}>
          {rows.map((r, i) => (
            <span key={r.year}>
              {i > 0 && <span className="mx-2 text-ghost">→</span>}
              <span style={{ whiteSpace: 'nowrap' }}>
                <span className="text-ink">{pct(r.value)}</span>
                <span className="ml-2 text-muted">({r.year})</span>
              </span>
            </span>
          ))}
        </div>
      )}
      <p className="m-0 font-sans text-body-sm italic text-secondary">
        “The target is becoming clearer, not smaller.”
      </p>
    </aside>
  );
}
