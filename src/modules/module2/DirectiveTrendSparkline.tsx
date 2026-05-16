// S6: DirectiveTrendSparkline — three-point editorial line chart showing
// V1 28% → V3 39% → V4 32% directive-interaction share (4A spec §3.3).

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import { AXIS_TICK_STYLE } from '../../utils/chart-config';
import { useChartTokens } from '../../hooks/useChartTokens';
// AXIS_TICK_STYLE is consumed below via the XAxis tick prop; the inline
// label uses individual SVG attributes since <text> typing rejects the bag.

interface TrendPoint {
  wave: string;
  period: string;
  directiveShare: number;
}

interface DirectiveTrendSparklineProps {
  series: TrendPoint[];
}

export function DirectiveTrendSparkline({ series }: DirectiveTrendSparklineProps): JSX.Element {
  const tokens = useChartTokens();
  const data = series.map((p) => ({
    // X-axis label: the period (e.g. "Jan 2025") is sufficient — the
    // internal wave id (V1/V3/V4) is dropped from the display.
    wave: p.period,
    pct: Math.round(p.directiveShare * 100),
  }));

  const ariaLabel = `Line chart showing the share of directive AI interactions across three measurement waves: ${data
    .map((d) => `${d.wave} at ${d.pct}%`)
    .join(', ')}.`;

  return (
    <figure className="mx-auto m-0" style={{ maxWidth: 460 }} aria-label={ariaLabel}>
      <div style={{ width: '100%', height: 140 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 28, right: 32, bottom: 28, left: 32 }}>
            <CartesianGrid stroke="transparent" />
            <XAxis
              dataKey="wave"
              tick={AXIS_TICK_STYLE}
              tickLine={false}
              axisLine={{ stroke: 'rgb(var(--border-light))' }}
              // `interval={0}` forces every tick label to render. Recharts'
              // default (`preserveEnd`) hides the first label when it would
              // overlap the chart edge — visible here as a missing
              // "V1 · Jan 2025" caption. The `padding` insets the first and
              // last data points so their labels don't clip off the chart.
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
      <figcaption
        className="mt-3 font-mono text-caption text-muted"
        style={{ letterSpacing: '0.02em' }}
      >
        Source: Handa et al., Feb 2025; Appel, McCrory &amp; Tamkin, Sep 2025, p. 9; Economic
        Primitives, Nov 2025, p. 9.
      </figcaption>
    </figure>
  );
}
