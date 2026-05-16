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
  const top = useMemo(() => skills.slice(0, TOP_N), [skills]);

  const ariaLabel = `Horizontal bar chart of the top ${TOP_N} fastest-rising workforce skills by net-increase score: ${top
    .map((s) => `${s.skill} at ${s.netIncrease}`)
    .join(', ')}.`;

  return (
    <figure className="m-0" aria-label={ariaLabel}>
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
              radius={[0, 3, 3, 0]}
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

function SkillInstabilityCallout({
  instability,
}: {
  instability: SkillDemandBarProps['instability'];
}): JSX.Element {
  const pct = (v: number) => `${Math.round(v * 100)}%`;
  return (
    <aside
      className="mt-4 rounded-lg bg-surface-warm"
      style={{
        border: '1px solid rgb(var(--border))',
        padding: '14px 18px',
      }}
    >
      <div
        className="mb-1.5 font-sans text-body-sm font-semibold text-ink"
      >
        Skills instability — share of core skills expected to change
      </div>
      <div className="mb-1.5 font-mono text-[13px] text-secondary" style={{ letterSpacing: '0.04em' }}>
        <span className="text-ink">{pct(instability.prior2020)}</span>
        <span className="mx-2 text-muted">(2020)</span>
        <span className="mx-2 text-ghost">→</span>
        <span className="text-ink">{pct(instability.prior2023)}</span>
        <span className="mx-2 text-muted">(2023)</span>
        <span className="mx-2 text-ghost">→</span>
        <span className="text-ink">{pct(instability.current)}</span>
        <span className="mx-2 text-muted">(2025)</span>
      </div>
      <p className="m-0 font-sans text-body-sm italic text-secondary">
        “The target is becoming clearer, not smaller.”
      </p>
    </aside>
  );
}
