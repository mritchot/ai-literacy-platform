// P3 View B — Collaboration Patterns. Interactive stacked-bar (mirrors S2)
// with click-to-expand pattern detail cards, a collapsible job-zone panel,
// and Reflection Prompt 1 (4A spec §4.4).

import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ReflectionPrompt } from '../../components/shared/ReflectionPrompt';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import {
  AXIS_TICK_STYLE,
  DELEGATION_COLORS,
  DISCERNMENT_COLORS,
  TOOLTIP_ITEM_STYLE,
  TOOLTIP_LABEL_STYLE,
  TOOLTIP_STYLE,
} from '../../utils/chart-config';
import { Icon } from '../../components/shared/Icon';
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

interface JobZone {
  zone: number;
  label: string;
  example_occupations: string;
  representation_ratio: number;
}

interface AugAutoViewBProps {
  categories: CollaborationCategory[];
  jobZones: JobZone[];
  jobZoneInsight: string;
}

export function AugAutoViewB({
  categories,
  jobZones,
  jobZoneInsight,
}: AugAutoViewBProps): JSX.Element {
  const { track } = useAnalytics();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [zonesOpen, setZonesOpen] = useState<boolean>(true);
  const viewport = useViewport();
  const isMobile = viewport === 'mobile';
  const tokens = useChartTokens();

  const meta = useMemo(
    () => [
      { key: 'taskIteration', color: DELEGATION_COLORS[0] },
      { key: 'learning', color: DELEGATION_COLORS[1] },
      { key: 'validation', color: DELEGATION_COLORS[2] },
      { key: 'directive', color: DISCERNMENT_COLORS[0] },
      { key: 'feedbackLoop', color: DISCERNMENT_COLORS[1] },
    ],
    [],
  );

  const stacked = [
    {
      taskIteration: categories[0]?.pct ?? 0,
      learning: categories[1]?.pct ?? 0,
      validation: categories[2]?.pct ?? 0,
      directive: categories[3]?.pct ?? 0,
      feedbackLoop: categories[4]?.pct ?? 0,
    },
  ];

  const handleSegmentClick = (patternName: string) => {
    setExpanded((prev) => (prev === patternName ? null : patternName));
    if (expanded !== patternName) {
      track({
        type: 'p3_view_b_pattern_expanded',
        moduleId: 2,
        sectionId: 3,
        payload: { pattern: patternName },
      });
    }
  };

  const augTotal = (categories[0]?.pct ?? 0) + (categories[1]?.pct ?? 0) + (categories[2]?.pct ?? 0);
  const autoTotal = (categories[3]?.pct ?? 0) + (categories[4]?.pct ?? 0);

  const expandedCat = categories.find((c) => c.pattern === expanded) ?? null;
  const expandedColor = expandedCat
    ? meta[categories.indexOf(expandedCat)]?.color ?? tokens.delegation
    : null;

  const ariaLabel = `Interactive stacked bar chart of five collaboration patterns. Click a segment to view details.`;

  return (
    <div className="space-y-6">
      <p className="m-0 font-sans text-body-sm text-body">
        Click any segment of the bar to see what that pattern looks like in practice. The three
        augmentation patterns (Task Iteration, Learning, Validation) sit to the left; the two
        automation patterns (Directive, Feedback Loop) sit to the right.
      </p>

      <div aria-label={ariaLabel}>
        {/* Position marker: rendered above the selected segment so the
            chosen pattern is unmistakable in both light and dark mode,
            independent of the segment's fill color. */}
        <SelectionMarker
          expanded={expanded}
          categories={categories}
          colors={meta.map((m) => m.color)}
        />
        <div style={{ width: '100%', height: 64 }}>
          <ResponsiveContainer>
            <BarChart layout="vertical" data={stacked} margin={{ top: 4, right: 4, bottom: 4, left: 4 }} barSize={44}>
              <XAxis type="number" hide domain={[0, 100]} />
              <YAxis type="category" hide />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                itemStyle={TOOLTIP_ITEM_STYLE}
                labelStyle={TOOLTIP_LABEL_STYLE}
                cursor={{ fill: tokens.cursorFill }}
                formatter={(value: number, name: string) => {
                  const idx = meta.findIndex((m) => m.key === name);
                  const c = categories[idx];
                  if (!c) return [`${value}%`, name];
                  return [`${value}% · ${c.category}`, c.pattern];
                }}
                labelFormatter={() => ''}
              />
              {meta.map((m, i) => {
                const c = categories[i];
                if (!c) return null;
                const isSelected = expanded === c.pattern;
                const hasAnySelection = expanded !== null;
                // When something is selected, dim the others; the selected
                // segment keeps full opacity AND gains a clear ink-color
                // stroke. Mirrors the design-system "competency-highlighted
                // card" pattern transposed onto chart bars.
                const fillOpacity = !hasAnySelection ? 1 : isSelected ? 1 : 0.25;
                return (
                  <Bar
                    key={m.key}
                    dataKey={m.key}
                    stackId="patterns"
                    fill={m.color}
                    isAnimationActive={false}
                    onClick={() => handleSegmentClick(c.pattern)}
                    style={{ cursor: 'pointer' }}
                  >
                    <Cell
                      fill={m.color}
                      fillOpacity={fillOpacity}
                      stroke={isSelected ? 'rgb(var(--ink))' : 'transparent'}
                      strokeWidth={isSelected ? 3 : 0}
                    />
                  </Bar>
                );
              })}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Bracket annotation */}
        <div className="mt-1 flex items-center text-[11px]" style={{ width: '100%' }}>
          <div
            className="font-mono uppercase"
            style={{
              flexBasis: `${augTotal}%`,
              letterSpacing: '0.08em',
              color: 'rgb(var(--delegation-text))',
              fontWeight: 700,
              borderTop: '1px solid #B5C4AB',
              paddingTop: 4,
              textAlign: 'center',
            }}
          >
            Augmentation · {Math.round(augTotal)}%
          </div>
          <div
            className="font-mono uppercase"
            style={{
              flexBasis: `${autoTotal}%`,
              letterSpacing: '0.08em',
              color: 'rgb(var(--discernment-text))',
              fontWeight: 700,
              borderTop: '1px solid #A8BCCA',
              paddingTop: 4,
              textAlign: 'center',
            }}
          >
            Automation · {Math.round(autoTotal)}%
          </div>
        </div>
      </div>

      {/* Pattern selector (alternative for keyboard / non-mouse users),
          rendered as a segmented control. The per-pattern accent that used
          to color each pill now appears only on the expanded panel below,
          which carries it as a left rule and heading color. */}
      <div
        className="inline-flex flex-wrap"
        role="group"
        aria-label="Pattern detail selector"
        style={{ border: '1px solid rgb(var(--border))', background: 'rgb(var(--surface))' }}
      >
        {categories.map((c, i) => {
          const active = expanded === c.pattern;
          return (
            <button
              key={c.pattern}
              type="button"
              onClick={() => handleSegmentClick(c.pattern)}
              aria-pressed={active}
              className="font-sans text-[12px] transition-colors duration-[160ms]"
              style={{
                padding: '5px 14px',
                borderLeft: i > 0 ? '1px solid rgb(var(--border))' : undefined,
                background: active ? 'rgb(var(--white))' : 'transparent',
                color: active ? 'rgb(var(--ink))' : 'rgb(var(--tertiary))',
                fontWeight: 600,
              }}
            >
              {c.pattern} · {c.pct}%
            </button>
          );
        })}
      </div>

      {expandedCat && expandedColor && (
        <article
          aria-live="polite"
          className="bg-[rgb(var(--white))]"
          style={{
            border: '1px solid rgb(var(--border))',
            borderLeft: `3px solid ${expandedColor}`,
            padding: '18px 22px',
          }}
        >
          <div className="mb-1 flex flex-wrap items-baseline justify-between gap-3">
            <h4 className="m-0 font-sans text-h4 font-semibold text-ink">{expandedCat.pattern}</h4>
            <span className="font-mono text-[11px] uppercase" style={{ letterSpacing: '0.1em', color: expandedColor }}>
              {expandedCat.category}
            </span>
          </div>
          <div className="mb-3 font-display text-h3 font-normal" style={{ color: expandedColor }}>
            {expandedCat.pct}%
          </div>
          <p className="m-0 mb-3 font-sans text-body-sm text-body">{expandedCat.definition}</p>
          <p className="m-0 mb-2 font-sans text-body-sm text-secondary">
            <strong className="font-semibold text-ink">Typical tasks:</strong> {expandedCat.typical_tasks}
          </p>
          <p className="m-0 font-sans text-body-sm italic text-secondary">
            "{expandedCat.example}"
          </p>
        </article>
      )}

      {/* Job zone panel */}
      <section style={{ border: '1px solid rgb(var(--border))', padding: 0 }}>
        <button
          type="button"
          onClick={() => setZonesOpen((v) => !v)}
          aria-expanded={zonesOpen}
          className="flex w-full items-center justify-between gap-3"
          style={{ padding: '14px 18px', background: 'rgb(var(--surface-warm))' }}
        >
          <span className="font-sans text-h4 font-semibold text-ink">
            AI usage by occupational preparation level
          </span>
          <Icon name={zonesOpen ? 'chevronDown' : 'chevronRight'} size={16} />
        </button>
        {zonesOpen && (
          <div style={{ padding: '16px 18px' }}>
            {isMobile ? (
              // Mobile: the Recharts vertical-layout bar reserved 170 px
              // for zone labels ("Job Zone 1: Little/no preparation"
              // etc.) and left ~188 px for the bars themselves — too
              // cramped to compare ratios at a glance. Render each zone
              // as a horizontal-card row instead.
              <MobileJobZoneList zones={jobZones} />
            ) : (
              <div style={{ width: '100%', height: 5 * 28 + 40 }}>
                <ResponsiveContainer>
                  <BarChart layout="vertical" data={jobZones} margin={{ top: 8, right: 32, bottom: 8, left: 8 }}>
                    <XAxis
                      type="number"
                      domain={[0, 'auto']}
                      tickFormatter={(v) => `${v}×`}
                      tick={AXIS_TICK_STYLE}
                      stroke="rgb(var(--border-light))"
                    />
                    <YAxis
                      type="category"
                      dataKey="label"
                      tick={{ ...AXIS_TICK_STYLE, fontSize: 11 }}
                      width={170}
                      interval={0}
                      stroke="rgb(var(--border-light))"
                    />
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      itemStyle={TOOLTIP_ITEM_STYLE}
                      labelStyle={TOOLTIP_LABEL_STYLE}
                      cursor={{ fill: tokens.cursorFill }}
                      formatter={(value: number) => [`${value}× representation`, 'Ratio']}
                      labelFormatter={(label, payload) => {
                        const p = payload[0]?.payload as JobZone | undefined;
                        return p ? `Zone ${p.zone} · ${p.example_occupations}` : String(label);
                      }}
                    />
                    <Bar dataKey="representation_ratio" isAnimationActive={false}>
                      {jobZones.map((z) => (
                        <Cell
                          key={z.zone}
                          fill={z.zone === 4 ? tokens.action : tokens.secondary}
                          fillOpacity={z.zone === 4 ? 1 : 0.6}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            <p className="m-0 mt-3 font-sans text-body-sm text-body">{jobZoneInsight}</p>
          </div>
        )}
      </section>

      <p className="m-0 font-mono text-caption text-muted" style={{ letterSpacing: '0.02em' }}>
        Source: Handa et al., Feb 2025, Figure 7, pp. 9–10 (patterns); p. 7 (job zones).
      </p>

      <ReflectionPrompt
        moduleId={2}
        sectionId={3}
        promptId="p3_reflection_1"
        engagedEvent="p3_reflection_1_engaged"
        savedEvent="p3_reflection_1_saved"
        promptText="Think about the last five times you used an AI tool for work. For each, try to identify which of the five collaboration patterns it fits. How many were task iteration? How many were directive? Did any involve validation: bringing your own work for the AI to check?"
      />
    </div>
  );
}

// Renders a small "▼ {pattern name}" marker positioned above the selected
// segment of the stacked bar. Uses cumulative percentage to compute the
// horizontal center of the selected segment, so the marker tracks segment
// position regardless of color or absolute position.
function SelectionMarker({
  expanded,
  categories,
  colors,
}: {
  expanded: string | null;
  categories: CollaborationCategory[];
  colors: string[];
}): JSX.Element {
  if (!expanded) {
    return <div style={{ height: 24 }} aria-hidden="true" />;
  }
  const idx = categories.findIndex((c) => c.pattern === expanded);
  if (idx < 0) {
    return <div style={{ height: 24 }} aria-hidden="true" />;
  }
  const before = categories.slice(0, idx).reduce((acc, c) => acc + c.pct, 0);
  const span = categories[idx]?.pct ?? 0;
  const centerPct = before + span / 2;
  const color = colors[idx] ?? 'rgb(var(--ink))';
  return (
    <div className="relative" style={{ height: 24 }} aria-hidden="true">
      <div
        className="absolute top-0 -translate-x-1/2 whitespace-nowrap font-mono text-[10.5px] font-bold uppercase"
        style={{
          left: `${centerPct}%`,
          color,
          letterSpacing: '0.08em',
        }}
      >
        {expanded}
      </div>
      <div
        className="absolute -translate-x-1/2"
        style={{
          left: `${centerPct}%`,
          top: 14,
          width: 0,
          height: 0,
          borderLeft: '5px solid transparent',
          borderRight: '5px solid transparent',
          borderTop: `7px solid ${color}`,
        }}
      />
    </div>
  );
}

// Mobile rendering of the job-zones representation-ratio chart. Each
// zone gets a row with the full zone label (no truncation) on top and
// a full-width progress bar below, normalized to the max ratio across
// the visible zones so cards stay visually comparable. Zone 4 (the
// "highlight" zone in the desktop chart) keeps the action color at
// full opacity; other zones use the muted secondary tone.
function MobileJobZoneList({ zones }: { zones: JobZone[] }): JSX.Element {
  const tokens = useChartTokens();
  const maxRatio = Math.max(...zones.map((z) => z.representation_ratio));
  return (
    <div className="space-y-2.5">
      {zones.map((z) => {
        const widthPct = (z.representation_ratio / maxRatio) * 100;
        const isHighlight = z.zone === 4;
        return (
          <div key={z.zone}>
            <div className="mb-1 flex items-baseline justify-between gap-3">
              <span
                className="font-sans text-body-sm text-ink"
                style={{ lineHeight: 1.35 }}
              >
                {z.label}
              </span>
              <span
                className="font-mono text-caption font-semibold text-secondary"
                style={{ letterSpacing: '0.02em' }}
              >
                {z.representation_ratio}×
              </span>
            </div>
            <div
              className="h-2 w-full overflow-hidden"
              style={{ background: 'rgb(var(--border-light))' }}
            >
              <div
                className="h-full"
                style={{
                  width: `${widthPct}%`,
                  background: isHighlight ? tokens.action : tokens.secondary,
                  opacity: isHighlight ? 1 : 0.7,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
