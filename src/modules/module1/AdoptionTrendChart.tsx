// Story 3: AdoptionTrendChart — augmentation/automation balance over three
// waves (V1, V3, V4) plus a directive-interaction sparkline (4C spec §3.5).
// Source: Handa et al. (V1); Appel, McCrory & Tamkin (V3); Economic Primitives (V4).
//
// Color rule: Story 3 uses neutral --secondary / --tertiary for the bars,
// NOT the 4D olive/blue-gray, because the 4D framework hasn't been
// introduced yet at this point in the narrative. Action color (#3D5A4E)
// is used for the directive sparkline because it's an editorial signal,
// not a 4D one (see 4C spec §18.2 rationale).

import { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
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
import { Icon } from '../../components/shared/Icon';

interface CollaborationPoint {
  wave: string;
  period: string;
  augmentation: number;
  automation: number;
}

interface DirectivePoint {
  wave: string;
  period: string;
  directiveShare: number;
}

interface AdoptionTrendChartProps {
  collaboration: CollaborationPoint[];
  directive: DirectivePoint[];
  classifierCaveat: string;
}

export function AdoptionTrendChart({
  collaboration,
  directive,
  classifierCaveat,
}: AdoptionTrendChartProps): JSX.Element {
  const [caveatOpen, setCaveatOpen] = useState(false);
  const tokens = useChartTokens();

  // Convert decimals → percentage points for chart consumption.
  // X-axis label uses only the period (e.g. "Jan 2025") — the internal
  // wave id (V1/V3/V4) is dropped from the display.
  const collabData = collaboration.map((p) => ({
    waveLabel: p.period,
    wave: p.wave,
    augmentation: Math.round(p.augmentation * 100),
    automation: Math.round(p.automation * 100),
  }));

  const directiveData = directive.map((p) => ({
    waveLabel: p.period,
    pct: Math.round(p.directiveShare * 100),
  }));

  const collabAria = `Grouped bar chart of augmentation versus automation across three waves: ${collabData
    .map((d) => `${d.waveLabel} augmentation ${d.augmentation}%, automation ${d.automation}%`)
    .join('; ')}.`;

  const directiveAria = `Three-point line showing directive interaction share: ${directiveData
    .map((d) => `${d.waveLabel} at ${d.pct}%`)
    .join(', ')}.`;

  return (
    <div className="space-y-6">
      <figure className="m-0" aria-label={collabAria}>
        <div
          className="mb-1 font-sans text-h4 font-semibold text-ink"
        >
          Augmentation vs. automation balance
        </div>
        <div className="mb-3 font-mono text-caption text-tertiary" style={{ letterSpacing: '0.02em' }}>
          Three measurement waves · Jan 2025 → Aug 2025 → Nov 2025
        </div>

        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer>
            <BarChart data={collabData} margin={{ top: 16, right: 24, bottom: 8, left: 24 }} barCategoryGap="22%">
              <CartesianGrid stroke="rgb(var(--border-light))" strokeDasharray="2 2" vertical={false} />
              <XAxis
                dataKey="waveLabel"
                tick={AXIS_TICK_STYLE}
                axisLine={{ stroke: 'rgb(var(--border-light))' }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 70]}
                tickFormatter={(v) => `${v}%`}
                tick={AXIS_TICK_STYLE}
                stroke="rgb(var(--border-light))"
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                itemStyle={TOOLTIP_ITEM_STYLE}
                labelStyle={TOOLTIP_LABEL_STYLE}
                cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                formatter={(value: number, name) => [
                  `${value}%`,
                  name === 'augmentation' ? 'Augmentation' : 'Automation',
                ]}
              />
              <Bar dataKey="augmentation" isAnimationActive animationDuration={400} radius={[3, 3, 0, 0]}>
                {collabData.map((d) => (
                  <Cell key={`aug-${d.wave}`} fill={tokens.secondary} />
                ))}
              </Bar>
              <Bar dataKey="automation" isAnimationActive animationDuration={400} radius={[3, 3, 0, 0]}>
                {collabData.map((d) => (
                  <Cell key={`auto-${d.wave}`} fill={tokens.tertiary} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-1.5 font-mono text-[11px] text-tertiary">
          <span className="inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="inline-block rounded-sm"
              style={{ width: 10, height: 10, background: tokens.secondary }}
            />
            Augmentation
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="inline-block rounded-sm"
              style={{ width: 10, height: 10, background: tokens.tertiary }}
            />
            Automation
          </span>
        </div>

        <p className="m-0 mt-3 font-sans text-body-sm italic text-secondary">
          Note: percentages do not sum to 100%. A small share of interactions (3–4%) do not
          clearly fit either category and remain unclassified.
        </p>
      </figure>

      <figure className="m-0" aria-label={directiveAria}>
        <div
          className="mb-1 font-sans text-h4 font-semibold text-ink"
        >
          Directive interaction share
        </div>
        <div className="mb-3 font-mono text-caption text-tertiary" style={{ letterSpacing: '0.02em' }}>
          Hand off the task, accept the result.
        </div>

        <div className="mx-auto" style={{ maxWidth: 460 }}>
          <div style={{ width: '100%', height: 140 }}>
            <ResponsiveContainer>
              <LineChart data={directiveData} margin={{ top: 28, right: 32, bottom: 28, left: 32 }}>
                <CartesianGrid stroke="transparent" />
                <XAxis
                  dataKey="waveLabel"
                  tick={AXIS_TICK_STYLE}
                  tickLine={false}
                  axisLine={{ stroke: 'rgb(var(--border-light))' }}
                  // `interval={0}` forces every tick label to render. Recharts'
                  // default (`preserveEnd`) hides the first label when it
                  // would overlap the chart edge — visible here as a missing
                  // "V1 · Jan 2025" caption. The `padding` insets the first
                  // and last data points so their labels don't clip off the
                  // chart.
                  interval={0}
                  padding={{ left: 16, right: 16 }}
                />
                <YAxis hide domain={[20, 45]} />
                <Line
                  type="monotone"
                  dataKey="pct"
                  stroke={tokens.action}
                  strokeWidth={2}
                  isAnimationActive
                  animationDuration={400}
                  dot={(props) => {
                    const { cx, cy, payload, index } = props as {
                      cx: number;
                      cy: number;
                      payload: { pct: number };
                      index: number;
                    };
                    return (
                      <g key={`dot-${index}`}>
                        <circle cx={cx} cy={cy} r={5} fill={tokens.action} />
                        <text
                          x={cx}
                          y={cy - 12}
                          textAnchor="middle"
                          fontSize={12}
                          fontFamily='"DM Sans", system-ui, -apple-system, sans-serif'
                          fontWeight={600}
                          fill={tokens.ink}
                        >
                          {payload.pct}%
                        </text>
                      </g>
                    );
                  }}
                  activeDot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </figure>

      <section className="rounded-md" style={{ background: 'rgb(var(--surface))', border: '1px solid rgb(var(--border-light))' }}>
        <button
          type="button"
          onClick={() => setCaveatOpen((v) => !v)}
          aria-expanded={caveatOpen}
          className="flex w-full items-center gap-2 font-mono text-[11px] uppercase text-tertiary"
          style={{ padding: '10px 14px', letterSpacing: '0.08em' }}
        >
          <Icon name={caveatOpen ? 'chevronDown' : 'chevronRight'} size={12} />
          About this data
        </button>
        {caveatOpen && (
          <div className="font-sans text-body-sm text-body" style={{ padding: '0 14px 14px' }}>
            {classifierCaveat}
          </div>
        )}
      </section>

      <p className="m-0 font-mono text-caption text-muted" style={{ letterSpacing: '0.02em' }}>
        Source: Handa et al., Feb 2025, pp. 3, 9; Appel, McCrory &amp; Tamkin, Sep 2025, p. 9;
        Economic Primitives, Nov 2025, pp. 5, 9.
      </p>
    </div>
  );
}
