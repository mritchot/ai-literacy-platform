// Story 2 inset: GDP × AI Usage Index correlation. Reproduces Figure 2.4
// from Appel, McCrory & Tamkin (Sep 2025). Each country is a point on
// the log-log plane, color-coded by usage tier; a dashed reference line
// shows the published power-law fit (β=0.690, R²=0.709, p<0.001).
//
// This component is the primary visual support for IC_1_2, which tests
// whether the learner understands that income correlates with — but
// does not fully explain — adoption. Designed for non-statistician
// readers, so every statistical concept is wrapped in plain language:
//
//   • Axis labels read "Income per working-age person (log scale)" /
//     "AI adoption rate (log scale)" — not raw `ln(...)` notation.
//   • The annotation box opens with prose: "Income explains about 70%
//     of adoption variation. The remaining 30% comes from other
//     factors." Statistical notation (β, R², p) sits below in muted
//     mono as a footnote.
//   • A reading guide explains how to interpret position relative to
//     the regression line — so the learner doesn't need to know what a
//     residual is to understand the chart.
//   • Tooltips include a one-line plain-language residual: "Adopting
//     X% faster/slower than income alone would predict."
//   • A shaded ±1 SE band around the regression line makes the
//     unexplained-variance idea visually concrete.
//   • Two static comparison callouts (JPN↔NZL connector, Gulf cluster
//     vs. Estonia/Georgia) call out cases where similar income produces
//     different adoption.

import { useEffect, useMemo, useRef } from 'react';
import {
  CartesianGrid,
  Customized,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { AXIS_TICK_STYLE } from '../../utils/chart-config';
import { useChartTokens } from '../../hooks/useChartTokens';
import { useViewport } from '../../hooks/useViewport';
import type { GeoCountry } from './GeographicAdoptionChart';
import {
  BETA,
  R_SQUARED,
  TIER_NAMES,
  computeOutliers,
  computeScatterData,
  type ScatterPoint,
  type TierName,
} from './scatter-data';

// Notable countries that get inline ISO-3 labels rendered next to their
// data point (matches the source figure's labelling convention).
// EST, GEO, QAT, SAU, KWT are added to the original 14 because they
// anchor the static comparison callouts (Gulf cluster + Estonia/Georgia).
const NOTABLE_ISO3 = new Set([
  'ISR',
  'SGP',
  'USA',
  'GBR',
  'JPN',
  'DEU',
  'FRA',
  'IND',
  'NGA',
  'IDN',
  'BRA',
  'KOR',
  'AUS',
  'CHE',
  'EST',
  'GEO',
  'QAT',
  'SAU',
  'KWT',
  'NZL',
]);

const X_DOMAIN: [number, number] = [7, 12.5];
const Y_DOMAIN: [number, number] = [-3.5, 2.5];

interface GDPCorrelationScatterProps {
  countries: GeoCountry[];
}

export function GDPCorrelationScatter({
  countries,
}: GDPCorrelationScatterProps): JSX.Element {
  const tokens = useChartTokens();
  const { track } = useAnalytics();
  const figureRef = useRef<HTMLElement | null>(null);
  const seenRef = useRef(false);
  const viewport = useViewport();
  const isMobile = viewport === 'mobile';

  const tierColor: Record<TierName, string> = {
    Leading: tokens.tierLeading,
    'Upper Middle': tokens.tierUpperMiddle,
    'Lower Middle': tokens.tierLowerMiddle,
    Emerging: tokens.tierEmerging,
  };

  // Regression derivation lives in scatter-data.ts (pure, testable);
  // this is just a memo over the stable countries prop.
  const { seriesByTier, residualSE, allPoints, intercept } = useMemo(
    () => computeScatterData(countries),
    [countries],
  );

  // Mobile-only outlier ranking: the 5 countries adopting fastest
  // relative to what income alone would predict (positive residual,
  // above the regression line), and the 5 adopting slowest (negative
  // residual, below the line). Shown beneath the scatter on mobile as a
  // second, scannable presentation of the same data — the scatter shows
  // the overall pattern, the list names the most notable departures
  // from it.
  const { fasterOutliers, slowerOutliers } = useMemo(
    () =>
      isMobile
        ? computeOutliers(allPoints)
        : { fasterOutliers: [], slowerOutliers: [] },
    [allPoints, isMobile],
  );

  // Track first view (fires once per mount).
  useEffect(() => {
    const node = figureRef.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !seenRef.current) {
          seenRef.current = true;
          track({ type: 'p1_scatter_viewed', moduleId: 1, sectionId: 3 });
        }
      },
      { threshold: 0.3 },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [track]);

  // Two endpoints of the reference line, computed at the X-axis bounds.
  const refStart = { x: X_DOMAIN[0], y: BETA * X_DOMAIN[0] + intercept };
  const refEnd = { x: X_DOMAIN[1], y: BETA * X_DOMAIN[1] + intercept };

  const totalCountries = allPoints.length;
  const ariaLabel = `Scatter plot of ${totalCountries} countries on a log-log scale. Horizontal axis: income per working-age person, log-transformed. Vertical axis: Anthropic AI Usage Index, log-transformed. Points are color-coded by usage tier. A dashed reference line shows the power-law fit AUI proportional to GDP to the 0.69, with R-squared 0.709. A shaded band around the line shows the expected range based on income alone (plus or minus one standard error of the residuals).`;

  // Custom shape: render a circle plus an inline ISO-3 label for the
  // notable countries. Other countries show ISO-3 only on hover.
  const renderPoint =
    (color: string) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (props: any) => {
      const { cx, cy, payload } = props as {
        cx: number;
        cy: number;
        payload: ScatterPoint;
      };
      const showLabel = NOTABLE_ISO3.has(payload.iso3);
      return (
        <g>
          <circle
            cx={cx}
            cy={cy}
            r={4}
            fill={color}
            stroke="rgb(var(--white))"
            strokeWidth={1}
          />
          {showLabel && (
            <text
              x={cx + 6}
              y={cy + 3}
              fontSize={10}
              fontFamily='"DM Mono", ui-monospace, monospace'
              fontWeight={600}
              fill={tokens.ink}
            >
              {payload.iso3}
            </text>
          )}
        </g>
      );
    };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tooltipContent = (props: any) => {
    const payload = props?.payload?.[0]?.payload as ScatterPoint | undefined;
    if (!payload || !props?.active) return null;
    const usd = `$${Math.round(payload.gdpPerWorkingAgeCap).toLocaleString()}`;
    const aboveLine = payload.pctVsPredicted >= 0;
    const pct = Math.abs(Math.round(payload.pctVsPredicted));
    const residualLine = aboveLine
      ? `Adopting ${pct}% faster than income alone would predict`
      : `Adopting ${pct}% slower than income alone would predict`;
    return (
      <div
        style={{
          background: 'rgb(var(--white))',
          border: '1px solid rgb(var(--border))',
          borderRadius: 6,
          padding: '8px 10px',
          fontSize: 12,
          color: 'rgb(var(--ink))',
          maxWidth: 280,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        }}
      >
        <div className="font-sans font-semibold" style={{ marginBottom: 2 }}>
          {payload.country}
          <span
            className="font-mono"
            style={{
              marginLeft: 6,
              fontSize: 10,
              fontWeight: 500,
              color: 'rgb(var(--tertiary))',
              letterSpacing: '0.04em',
            }}
          >
            {payload.iso3}
          </span>
        </div>
        <div style={{ color: 'rgb(var(--secondary))' }}>
          AI Usage Index: <strong>{payload.aui.toFixed(2)}</strong>
        </div>
        <div style={{ color: 'rgb(var(--secondary))' }}>
          Income per working-age person: <strong>{usd}</strong>
        </div>
        <div style={{ color: 'rgb(var(--secondary))', marginBottom: 4 }}>
          Tier: <strong>{payload.tier}</strong>
        </div>
        <div
          className="font-sans"
          style={{
            fontStyle: 'italic',
            fontSize: 11.5,
            color: aboveLine ? 'rgb(var(--success))' : 'rgb(var(--caution))',
            borderTop: '1px solid rgb(var(--border-light))',
            paddingTop: 4,
            marginTop: 4,
          }}
        >
          {residualLine}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div
        className="font-sans text-body-sm font-semibold text-ink mb-2 mt-6"
      >
        Does income explain adoption?
      </div>

      {/* Mobile-only annotation block. Replaces the desktop overlay
          entirely on mobile — we skip the scatter figure on mobile
          because scatter plots don't translate well to narrow screens
          (cramped points, overlapping country labels, axis crops). The
          callout below names the regression takeaway and the outlier
          list below the figure (also mobile-only) names the standout
          countries — together they convey the chart's full story in a
          format that actually reads on a 390 px viewport. Desktop still
          gets the full scatter. */}
      {isMobile && <ScatterAnnotation />}

      {!isMobile && (
      <figure
        ref={(el) => {
          figureRef.current = el;
        }}
        className="m-0 rounded-md"
        aria-label={ariaLabel}
        style={{
          background: 'rgb(var(--white))',
          border: '1px solid rgb(var(--border))',
          padding: '14px 12px',
          position: 'relative',
        }}
      >
        {/* Top-left annotation block — plain-language summary above the
            statistical notation. The plain-language line is the primary
            takeaway; the β/R²/p line is provenance for readers who want
            to verify against the source paper. Desktop-only: on mobile
            this same content renders above the figure (see above). */}
        {!isMobile && (
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 16,
              left: 28,
              zIndex: 2,
              padding: '8px 12px',
              background: 'rgb(var(--white) / 0.92)',
              border: '1px solid rgb(var(--border-light))',
              borderRadius: 6,
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              maxWidth: 320,
            }}
          >
            <div
              className="font-sans text-body-sm text-ink"
              style={{ lineHeight: 1.4, marginBottom: 4 }}
            >
              Income explains about 70% of adoption variation.
              <br />
              The remaining 30% comes from other factors.
            </div>
            <div
              className="font-mono text-caption text-muted"
              style={{ letterSpacing: '0.02em' }}
            >
              (β = {BETA.toFixed(3)}, R² = {R_SQUARED.toFixed(3)}, p &lt; 0.001)
            </div>
            <div
              className="font-sans text-caption italic"
              style={{
                color: 'rgb(var(--tertiary))',
                lineHeight: 1.4,
                marginTop: 8,
                maxWidth: 300,
              }}
            >
              Countries above the dashed line are adopting AI faster than their income alone would
              predict. Countries below it are adopting slower. The distance from the line shows how
              much other factors matter.
            </div>
          </div>
        )}

        <div style={{ width: '100%', height: isMobile ? 600 : 460 }}>
          <ResponsiveContainer>
            <ScatterChart margin={{ top: 16, right: 24, bottom: 48, left: 36 }}>
              <CartesianGrid stroke="rgb(var(--border-light))" strokeDasharray="2 3" />
              <XAxis
                type="number"
                dataKey="lnGdp"
                name="ln(GDP)"
                domain={X_DOMAIN}
                tick={AXIS_TICK_STYLE}
                stroke="rgb(var(--border-light))"
                tickFormatter={(v: number) => v.toFixed(0)}
                // On mobile the long axis-label text was being clipped at
                // the right edge of the narrow chart ("...log sca"); the
                // caption below the figure already names the axes, so we
                // drop the in-chart label on mobile to avoid the cropped
                // look. Desktop keeps the inline label.
                label={
                  isMobile
                    ? undefined
                    : {
                        value: 'Income per working-age person (log scale)',
                        position: 'insideBottom',
                        offset: -16,
                        style: {
                          fontFamily: '"DM Sans", system-ui, sans-serif',
                          fontSize: 11.5,
                          fontWeight: 500,
                          fill: tokens.secondary,
                        },
                      }
                }
              />
              <YAxis
                type="number"
                dataKey="lnAui"
                name="ln(AUI)"
                domain={Y_DOMAIN}
                tick={AXIS_TICK_STYLE}
                stroke="rgb(var(--border-light))"
                tickFormatter={(v: number) => v.toFixed(0)}
                label={
                  isMobile
                    ? undefined
                    : {
                        value: 'AI adoption rate (log scale)',
                        angle: -90,
                        position: 'insideLeft',
                        offset: 4,
                        style: {
                          fontFamily: '"DM Sans", system-ui, sans-serif',
                          fontSize: 11.5,
                          fontWeight: 500,
                          fill: tokens.secondary,
                          textAnchor: 'middle',
                        },
                      }
                }
              />
              <Tooltip
                cursor={{ stroke: 'rgb(var(--border))', strokeDasharray: '3 3' }}
                content={tooltipContent}
              />

              {/* Prediction band + regression line — both drawn inside
                  the same Customized so we can guarantee z-order (band
                  underneath, line on top) and control every visual
                  attribute directly via SVG. The previous implementation
                  used Recharts' <ReferenceLine segment={...}> for the
                  line — that variant is fragile inside <ScatterChart>
                  and sometimes failed to render, leaving only the band
                  visible. Drawing the line manually as an <line> on top
                  of the polygon eliminates that dependency. */}
              <Customized
                component={
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  ((customProps: any) => {
                    const xMap = customProps?.xAxisMap;
                    const yMap = customProps?.yAxisMap;
                    if (!xMap || !yMap) return null;
                    const xKey = Object.keys(xMap)[0];
                    const yKey = Object.keys(yMap)[0];
                    if (!xKey || !yKey) return null;
                    const xScale = xMap[xKey].scale as (v: number) => number;
                    const yScale = yMap[yKey].scale as (v: number) => number;
                    const x1 = xScale(X_DOMAIN[0]);
                    const x2 = xScale(X_DOMAIN[1]);
                    const yLine1 = yScale(refStart.y);
                    const yLine2 = yScale(refEnd.y);
                    const yUpper1 = yScale(refStart.y + residualSE);
                    const yUpper2 = yScale(refEnd.y + residualSE);
                    const yLower1 = yScale(refStart.y - residualSE);
                    const yLower2 = yScale(refEnd.y - residualSE);
                    return (
                      <g aria-hidden="true">
                        {/* Band — subtle ambient context. */}
                        <polygon
                          points={`${x1},${yUpper1} ${x2},${yUpper2} ${x2},${yLower2} ${x1},${yLower1}`}
                          fill="rgb(var(--border))"
                          fillOpacity={0.1}
                          stroke="none"
                        />
                        {/* Regression line — the headline visual feature.
                            Brand-action teal so it reads as "this is the
                            meaningful trend" rather than blending into the
                            band's neutral gray. */}
                        <line
                          x1={x1}
                          y1={yLine1}
                          x2={x2}
                          y2={yLine2}
                          stroke={tokens.action}
                          strokeWidth={2}
                          strokeDasharray="6 4"
                          strokeLinecap="round"
                        />
                        {/* Edge label — anchored near the right end of the
                            upper band edge so it doesn't collide with the
                            top-left annotation block. */}
                        <text
                          x={x2 - 8}
                          y={yUpper2 - 6}
                          fontSize={10}
                          fontFamily='"DM Sans", system-ui, sans-serif'
                          fontStyle="italic"
                          textAnchor="end"
                          fill={tokens.tertiary}
                        >
                          Expected range based on income alone
                        </text>
                      </g>
                    );
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  }) as any
                }
              />

              {/* Static comparison callouts. */}
              <Customized
                component={
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  ((customProps: any) => {
                    const xMap = customProps?.xAxisMap;
                    const yMap = customProps?.yAxisMap;
                    if (!xMap || !yMap) return null;
                    const xKey = Object.keys(xMap)[0];
                    const yKey = Object.keys(yMap)[0];
                    if (!xKey || !yKey) return null;
                    const xScale = xMap[xKey].scale as (v: number) => number;
                    const yScale = yMap[yKey].scale as (v: number) => number;

                    const find = (iso: string) =>
                      allPoints.find((p) => p.iso3 === iso);
                    const jpn = find('JPN');
                    const nzl = find('NZL');

                    const elements: JSX.Element[] = [];

                    // 1) JPN ↔ NZL connector. These have nearly equal
                    //    GDP per working-age but NZL's AUI is ~2× JPN's.
                    if (jpn && nzl) {
                      const jx = xScale(jpn.lnGdp);
                      const jy = yScale(jpn.lnAui);
                      const nx = xScale(nzl.lnGdp);
                      const ny = yScale(nzl.lnAui);
                      const midX = (jx + nx) / 2;
                      const midY = (jy + ny) / 2;
                      elements.push(
                        <g key="jpn-nzl">
                          <line
                            x1={jx}
                            y1={jy}
                            x2={nx}
                            y2={ny}
                            stroke="rgb(var(--border))"
                            strokeWidth={1}
                            strokeDasharray="2 3"
                          />
                          <text
                            x={midX + 8}
                            y={midY - 4}
                            fontSize={10}
                            fontFamily='"DM Sans", system-ui, sans-serif'
                            fill={tokens.tertiary}
                          >
                            Comparable income —
                          </text>
                          <text
                            x={midX + 8}
                            y={midY + 8}
                            fontSize={10}
                            fontFamily='"DM Sans", system-ui, sans-serif'
                            fill={tokens.tertiary}
                          >
                            New Zealand adopts at 2× Japan's rate
                          </text>
                        </g>,
                      );
                    }

                    // 2) Gulf cluster annotation. Anchor at QAT/KWT (high
                    //    GDP, below-line). Placed just below the cluster
                    //    so it doesn't collide with the inline ISO labels.
                    const gulfAnchor = find('QAT') ?? find('KWT') ?? find('SAU');
                    if (gulfAnchor) {
                      const gx = xScale(gulfAnchor.lnGdp);
                      const gy = yScale(gulfAnchor.lnAui);
                      elements.push(
                        <g key="gulf">
                          <text
                            x={gx + 12}
                            y={gy + 18}
                            fontSize={10}
                            fontFamily='"DM Sans", system-ui, sans-serif'
                            fill={tokens.tertiary}
                          >
                            High income, below-predicted adoption
                          </text>
                        </g>,
                      );
                    }

                    // 3) Estonia / Georgia annotation. Lower GDP, above
                    //    the line.
                    const eastAnchor = find('EST') ?? find('GEO');
                    if (eastAnchor) {
                      const ex = xScale(eastAnchor.lnGdp);
                      const ey = yScale(eastAnchor.lnAui);
                      elements.push(
                        <g key="east">
                          <text
                            x={ex - 4}
                            y={ey - 14}
                            fontSize={10}
                            fontFamily='"DM Sans", system-ui, sans-serif'
                            fill={tokens.tertiary}
                            textAnchor="end"
                          >
                            Lower income, above-predicted adoption
                          </text>
                        </g>,
                      );
                    }

                    return <g aria-hidden="true">{elements}</g>;
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  }) as any
                }
              />

              {TIER_NAMES.map((tier) => {
                const data = seriesByTier[tier];
                if (data.length === 0) return null;
                return (
                  <Scatter
                    key={tier}
                    name={tier}
                    data={data}
                    fill={tierColor[tier]}
                    shape={renderPoint(tierColor[tier])}
                    isAnimationActive
                    animationDuration={400}
                  />
                );
              })}
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Visually-hidden table for accessibility */}
        <table className="sr-only">
          <caption>
            Country GDP per working-age capita and AI Usage Index, log-transformed, with
            residual relative to the income-only regression.
          </caption>
          <thead>
            <tr>
              <th scope="col">Country</th>
              <th scope="col">GDP per working-age (USD)</th>
              <th scope="col">AUI</th>
              <th scope="col">Tier</th>
              <th scope="col">vs. income-predicted</th>
            </tr>
          </thead>
          <tbody>
            {allPoints.map((p) => (
              <tr key={p.iso3}>
                <td>{p.country}</td>
                <td>${Math.round(p.gdpPerWorkingAgeCap).toLocaleString()}</td>
                <td>{p.aui.toFixed(2)}</td>
                <td>{p.tier}</td>
                <td>
                  {p.pctVsPredicted >= 0 ? '+' : ''}
                  {Math.round(p.pctVsPredicted)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </figure>
      )}

      {/* Mobile-only outlier list. The scatter is omitted on mobile (see
          comment above the figure); this list — top 5 adopting faster
          than income predicts, top 5 adopting slower — is the primary
          way mobile readers identify the standout countries. Reads as a
          ranked pair of departures from the regression rather than a
          chart. */}
      {isMobile && (
        <ScatterOutlierList faster={fasterOutliers} slower={slowerOutliers} />
      )}

      <p className="m-0 mt-2 font-mono text-caption text-muted" style={{ letterSpacing: '0.02em' }}>
        Income and AI Usage Index by country. Axes are log-transformed. Source: Appel, McCrory
        &amp; Tamkin, Sep 2025, Figure 2.4, p. 17; Anthropic Economic Index open dataset (MIT
        license).
      </p>
    </div>
  );
}

// Mobile-only annotation block — replaces the desktop overlay entirely
// on mobile (the scatter figure is skipped on mobile). Drops the third
// italic paragraph from the desktop version: that text referenced "the
// dashed line" and "above / below" positioning in the scatter, which
// don't exist on mobile. The outlier list immediately below this
// annotation makes the same point concretely (named countries adopting
// faster or slower than income predicts), so the explanatory glue isn't
// needed.
function ScatterAnnotation(): JSX.Element {
  return (
    <div
      className="mb-3 rounded-md"
      style={{
        background: 'rgb(var(--white))',
        border: '1px solid rgb(var(--border-light))',
        padding: '12px 14px',
      }}
    >
      <div
        className="font-sans text-body-sm text-ink"
        style={{ lineHeight: 1.4, marginBottom: 4 }}
      >
        Income explains about 70% of adoption variation. The remaining 30% comes from other
        factors — see the outlier list below for the countries that depart most from what income
        alone would predict.
      </div>
      <div
        className="font-mono text-caption text-muted"
        style={{ letterSpacing: '0.02em' }}
      >
        (β = {BETA.toFixed(3)}, R² = {R_SQUARED.toFixed(3)}, p &lt; 0.001)
      </div>
    </div>
  );
}

// Mobile-only outlier list rendered below the scatter. Top 5 faster
// (above the regression line) and top 5 slower (below). Positive
// residuals use the action color; negative residuals use secondary so
// the direction reads at a glance.
function ScatterOutlierList({
  faster,
  slower,
}: {
  faster: ScatterPoint[];
  slower: ScatterPoint[];
}): JSX.Element {
  return (
    <div
      className="mt-4 rounded-md"
      style={{
        background: 'rgb(var(--white))',
        border: '1px solid rgb(var(--border))',
        padding: '14px 16px',
      }}
    >
      <div className="mb-3 font-sans text-body-sm font-semibold text-ink">
        Notable outliers
      </div>

      <div className="mb-4">
        <div
          className="mb-2 font-mono text-caption font-semibold text-secondary"
          style={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}
        >
          Adopting faster than income predicts
        </div>
        <ul className="m-0 list-none space-y-1.5 p-0">
          {faster.map((p) => (
            <li key={p.iso3} className="flex items-baseline justify-between gap-3">
              <span className="font-sans text-body-sm text-ink">{p.country}</span>
              <span
                className="font-mono text-caption font-semibold text-action"
                style={{ letterSpacing: '0.02em' }}
              >
                +{Math.round(p.pctVsPredicted)}%
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <div
          className="mb-2 font-mono text-caption font-semibold text-secondary"
          style={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}
        >
          Adopting slower than income predicts
        </div>
        <ul className="m-0 list-none space-y-1.5 p-0">
          {slower.map((p) => (
            <li key={p.iso3} className="flex items-baseline justify-between gap-3">
              <span className="font-sans text-body-sm text-ink">{p.country}</span>
              <span
                className="font-mono text-caption font-semibold text-secondary"
                style={{ letterSpacing: '0.02em' }}
              >
                {Math.round(p.pctVsPredicted)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
