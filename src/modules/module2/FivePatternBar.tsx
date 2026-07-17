// S2: FivePatternBar — single-row stacked horizontal bar visualizing the
// five-pattern AI collaboration taxonomy (4A spec §3.1).
// Source: Handa et al., Feb 2025, Figure 7.

import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  DELEGATION_COLORS,
  DISCERNMENT_COLORS,
  TOOLTIP_ITEM_STYLE,
  TOOLTIP_LABEL_STYLE,
  TOOLTIP_STYLE,
} from '../../utils/chart-config';
import { useChartTokens } from '../../hooks/useChartTokens';
import { useViewport } from '../../hooks/useViewport';

interface CollaborationCategory {
  pattern: string;
  category: 'augmentation' | 'automation';
  pct: number;
  definition: string;
  example: string;
  typical_tasks: string;
}

interface FivePatternBarProps {
  categories: CollaborationCategory[];
}

interface PatternMeta {
  key: string;
  label: string;
  color: string;
}

export function FivePatternBar({ categories }: FivePatternBarProps): JSX.Element {
  const viewport = useViewport();
  const tokens = useChartTokens();

  const meta: PatternMeta[] = useMemo(
    () => [
      { key: 'taskIteration', label: categories[0]?.pattern ?? '', color: DELEGATION_COLORS[0] },
      { key: 'learning', label: categories[1]?.pattern ?? '', color: DELEGATION_COLORS[1] },
      { key: 'validation', label: categories[2]?.pattern ?? '', color: DELEGATION_COLORS[2] },
      { key: 'directive', label: categories[3]?.pattern ?? '', color: DISCERNMENT_COLORS[0] },
      { key: 'feedbackLoop', label: categories[4]?.pattern ?? '', color: DISCERNMENT_COLORS[1] },
    ],
    [categories],
  );

  const augTotal = (categories[0]?.pct ?? 0) + (categories[1]?.pct ?? 0) + (categories[2]?.pct ?? 0);
  const autoTotal = (categories[3]?.pct ?? 0) + (categories[4]?.pct ?? 0);

  const ariaLabel = `Stacked bar chart showing five AI collaboration patterns: ${categories
    .map((c) => `${c.pattern} at ${c.pct}%`)
    .join(', ')}. Augmentation total ${Math.round(augTotal)}%, Automation total ${Math.round(autoTotal)}%.`;

  if (viewport === 'mobile') {
    return <FivePatternMobile categories={categories} meta={meta} ariaLabel={ariaLabel} />;
  }

  const stackedData = [
    {
      taskIteration: categories[0]?.pct ?? 0,
      learning: categories[1]?.pct ?? 0,
      validation: categories[2]?.pct ?? 0,
      directive: categories[3]?.pct ?? 0,
      feedbackLoop: categories[4]?.pct ?? 0,
    },
  ];

  return (
    <figure className="m-0" aria-label={ariaLabel}>
      <div style={{ width: '100%', height: 80 }}>
        <ResponsiveContainer>
          <BarChart layout="vertical" data={stackedData} margin={{ top: 4, right: 4, bottom: 4, left: 4 }} barSize={32}>
            <XAxis type="number" hide domain={[0, 100]} />
            <YAxis type="category" hide />
            <Tooltip
              // marginTop pushes the tooltip content 56px below the cursor
              // so it sits below the 32px-tall bar instead of floating above
              // it (which previously obscured adjacent bars when hovering
              // over the left side of the chart). The Recharts wrapper
              // anchors at the cursor; content margin is added inside the
              // wrapper, so the tooltip x still tracks the cursor.
              contentStyle={{ ...TOOLTIP_STYLE, marginTop: 56 }}
              itemStyle={TOOLTIP_ITEM_STYLE}
              labelStyle={TOOLTIP_LABEL_STYLE}
              cursor={{ fill: tokens.cursorFill }}
              // Allow vertical overflow past the chart's view box so the
              // pushed-down tooltip isn't clipped against the 80px bar
              // chart wrapper.
              allowEscapeViewBox={{ x: false, y: true }}
              formatter={(value: number, name: string) => {
                const m = meta.find((x) => x.key === name);
                const cat = categories.find((c) => c.pattern === m?.label);
                if (!m || !cat) return [`${value}%`, name];
                return [`${value}% · ${cat.category}`, m.label];
              }}
              labelFormatter={() => ''}
            />
            {meta.map((m) => (
              <Bar
                key={m.key}
                dataKey={m.key}
                stackId="patterns"
                fill={m.color}
                isAnimationActive
                animationDuration={400}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <FivePatternLegend meta={meta} categories={categories} />

      <BracketAnnotation augTotal={augTotal} autoTotal={autoTotal} />

      <figcaption
        className="mt-3 font-mono text-caption text-muted"
        style={{ letterSpacing: '0.02em' }}
      >
        Source: Handa et al., Feb 2025, Figure 7 (sample: 1M Claude.ai conversations, Dec 2024–Jan 2025).
      </figcaption>
    </figure>
  );
}

function FivePatternLegend({
  meta,
  categories,
}: {
  meta: PatternMeta[];
  categories: CollaborationCategory[];
}): JSX.Element {
  return (
    <div className="mt-3 grid gap-x-4 gap-y-1.5 text-[12px]" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
      {meta.map((m, i) => (
        <div key={m.key} className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="inline-block flex-shrink-0"
            style={{ width: 10, height: 10, background: m.color }}
          />
          <span className="font-sans text-secondary">
            {m.label} · <span className="font-mono text-tertiary">{categories[i]?.pct}%</span>
          </span>
        </div>
      ))}
    </div>
  );
}

function BracketAnnotation({
  augTotal,
  autoTotal,
}: {
  augTotal: number;
  autoTotal: number;
}): JSX.Element {
  const augPct = Math.round(augTotal);
  const autoPct = Math.round(autoTotal);
  const augWidth = augTotal;
  const autoWidth = autoTotal;
  return (
    <div className="mt-2 flex items-center text-[11px]" style={{ width: '100%' }}>
      <div
        className="font-mono uppercase"
        style={{
          flexBasis: `${augWidth}%`,
          letterSpacing: '0.08em',
          color: 'rgb(var(--delegation-text))',
          fontWeight: 700,
          borderTop: '1px solid #B5C4AB',
          paddingTop: 4,
          textAlign: 'center',
        }}
      >
        Augmentation · {augPct}%
      </div>
      <div
        className="font-mono uppercase"
        style={{
          flexBasis: `${autoWidth}%`,
          letterSpacing: '0.08em',
          color: 'rgb(var(--discernment-text))',
          fontWeight: 700,
          borderTop: '1px solid #A8BCCA',
          paddingTop: 4,
          textAlign: 'center',
        }}
      >
        Automation · {autoPct}%
      </div>
    </div>
  );
}

// Mobile fallback — stacked horizontal bar becomes one row per pattern.
function FivePatternMobile({
  categories,
  meta,
  ariaLabel,
}: {
  categories: CollaborationCategory[];
  meta: PatternMeta[];
  ariaLabel: string;
}): JSX.Element {
  const [hovered, setHovered] = useState<string | null>(null);
  return (
    <figure className="m-0" aria-label={ariaLabel}>
      <ul className="m-0 list-none space-y-2 p-0">
        {meta.map((m, i) => {
          const cat = categories[i];
          if (!cat) return null;
          return (
            <li
              key={m.key}
              onMouseEnter={() => setHovered(m.key)}
              onMouseLeave={() => setHovered(null)}
              style={{ padding: '6px 8px', background: hovered === m.key ? 'rgb(var(--surface))' : 'transparent' }}
            >
              <div className="mb-1 flex items-center justify-between text-[12.5px]">
                <span className="font-sans font-semibold text-ink">{m.label}</span>
                <span className="font-mono text-tertiary">{cat.pct}%</span>
              </div>
              <div className="overflow-hidden" style={{ height: 10, background: 'rgb(var(--border-light))' }}>
                <div style={{ width: `${cat.pct}%`, height: '100%', background: m.color, transition: 'width 400ms' }} />
              </div>
            </li>
          );
        })}
      </ul>
      <figcaption
        className="mt-3 font-mono text-caption text-muted"
        style={{ letterSpacing: '0.02em' }}
      >
        Source: Handa et al., Feb 2025, Figure 7.
      </figcaption>
    </figure>
  );
}
