// Story 2: GeographicAdoptionChart — country-level AI Usage Index
// ranking, sourced from the Anthropic Economic Index open dataset
// (Appel, McCrory & Tamkin, Sep 2025; MIT license).
//
// The dataset includes every country with at least 200 observations in
// the underlying ~1M conversation sample (~115 countries). Three filter
// modes:
//   • Top 14 — top 14 + four low-adoption anchors (the original cut)
//   • All Countries — every country, scrollable, with country search
//   • By Tier — collapsible tier sections (Leading / Upper / Lower /
//     Emerging), with country search that auto-expands matching tiers
//
// The Census enterprise-adoption inset is unchanged.

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { Icon } from '../../components/shared/Icon';
import {
  AXIS_TICK_STYLE,
  TOOLTIP_ITEM_STYLE,
  TOOLTIP_LABEL_STYLE,
  TOOLTIP_STYLE,
} from '../../utils/chart-config';
import { useChartTokens } from '../../hooks/useChartTokens';
import { useViewport } from '../../hooks/useViewport';

// ─── Types ────────────────────────────────────────────────────────────

export interface GeoCountry {
  country: string;
  iso3: string;
  aui: number;
  gdpPerWorkingAgeCap: number;
  tier: string;
  usageCount: number;
}

export interface TierRange {
  min: number;
  max: number;
}

interface CensusAdoption {
  fall2023: number;
  earlyAugust2025: number;
  description: string;
}

interface GeographicAdoptionChartProps {
  countries: GeoCountry[];
  tierRanges: Record<string, TierRange>;
  /** ISO-3 codes of the four "low-adoption anchor" countries used for
   *  context in the Top 14 view. Defaults to India, Indonesia, Nigeria,
   *  Bolivia (the original anchor set). */
  lowAdoptionAnchors?: string[];
}

// ─── Constants ────────────────────────────────────────────────────────

const DEFAULT_ANCHORS = ['IND', 'IDN', 'NGA', 'BOL'];

const TIER_NAMES = ['Leading', 'Upper Middle', 'Lower Middle', 'Emerging'] as const;
type TierName = (typeof TIER_NAMES)[number];

type Mode = 'top14' | 'all' | 'byTier';

// Row height for the horizontal-bar layout. Empirically chosen so the
// 18-row Top 14 view fits at natural height without internal scroll.
const ROW_PX = 22;
const CHART_VPAD = 60;
const SCROLL_MAX_HEIGHT = 520;

// ─── Component ────────────────────────────────────────────────────────

export function GeographicAdoptionChart({
  countries,
  tierRanges,
  lowAdoptionAnchors = DEFAULT_ANCHORS,
}: GeographicAdoptionChartProps): JSX.Element {
  const { track } = useAnalytics();
  const tokens = useChartTokens();
  const [mode, setMode] = useState<Mode>('top14');
  const [search, setSearch] = useState('');
  const [openTiers, setOpenTiers] = useState<Record<string, boolean>>({
    Leading: true,
    'Upper Middle': false,
    'Lower Middle': false,
    Emerging: false,
  });

  // Theme-aware tier color ramp. Dark-mode versions lift the lower
  // tiers from near-invisible neutral grays.
  const tierColor: Record<TierName, string> = {
    Leading: tokens.tierLeading,
    'Upper Middle': tokens.tierUpperMiddle,
    'Lower Middle': tokens.tierLowerMiddle,
    Emerging: tokens.tierEmerging,
  };

  // Debounced analytics for search — 500ms after typing stops.
  const searchTrackRef = useRef<number | null>(null);
  useEffect(() => {
    if (mode === 'top14') return;
    if (searchTrackRef.current) window.clearTimeout(searchTrackRef.current);
    if (!search.trim()) return;
    const query = search.trim();
    searchTrackRef.current = window.setTimeout(() => {
      track({
        type: 'p1_chart_search_used',
        moduleId: 1,
        sectionId: 3,
        payload: { query },
      });
    }, 500);
    return () => {
      if (searchTrackRef.current) window.clearTimeout(searchTrackRef.current);
    };
  }, [search, mode, track]);

  // Sorted-by-AUI base list (descending).
  const sorted = useMemo(
    () => [...countries].sort((a, b) => b.aui - a.aui),
    [countries],
  );

  // Top 14 view: top 14 by AUI + the 4 low-adoption anchor countries.
  const top14Rows = useMemo(() => {
    const top = sorted.slice(0, 14);
    const anchors = sorted.filter((c) => lowAdoptionAnchors.includes(c.iso3));
    const seen = new Set<string>();
    const merged: GeoCountry[] = [];
    for (const c of [...top, ...anchors]) {
      if (seen.has(c.iso3)) continue;
      seen.add(c.iso3);
      merged.push(c);
    }
    return merged.sort((a, b) => b.aui - a.aui);
  }, [sorted, lowAdoptionAnchors]);

  // All Countries view (with search filter).
  const filteredAll = useMemo(() => {
    if (!search.trim()) return sorted;
    const q = search.trim().toLowerCase();
    return sorted.filter(
      (c) => c.country.toLowerCase().includes(q) || c.iso3.toLowerCase().includes(q),
    );
  }, [sorted, search]);

  // By Tier view: countries grouped by tier (descending AUI within tier).
  const byTier = useMemo(() => {
    const q = search.trim().toLowerCase();
    const groups: Record<TierName, GeoCountry[]> = {
      Leading: [],
      'Upper Middle': [],
      'Lower Middle': [],
      Emerging: [],
    };
    for (const c of sorted) {
      const t = c.tier as TierName;
      if (!TIER_NAMES.includes(t)) continue;
      if (q) {
        if (
          !c.country.toLowerCase().includes(q) &&
          !c.iso3.toLowerCase().includes(q)
        )
          continue;
      }
      groups[t].push(c);
    }
    return groups;
  }, [sorted, search]);

  return (
    <div className="space-y-5">
      <ModePills mode={mode} onChange={(m) => setMode(m)} track={track} />

      {(mode === 'all' || mode === 'byTier') && (
        <SearchInput value={search} onChange={setSearch} />
      )}

      <TierLegend tierRanges={tierRanges} tierColor={tierColor} />

      {mode === 'top14' && (
        <BarChartFigure
          rows={top14Rows}
          tierColor={tierColor}
          maxHeight={null}
          ariaLabel={`Horizontal bar chart of ${top14Rows.length} countries (top 14 by AUI plus four low-adoption context anchors), color-coded by adoption tier.`}
        />
      )}

      {mode === 'all' && (
        <BarChartFigure
          rows={filteredAll}
          tierColor={tierColor}
          maxHeight={SCROLL_MAX_HEIGHT}
          ariaLabel={`Horizontal bar chart of ${filteredAll.length} countries (full dataset, sorted by AUI descending), color-coded by adoption tier.`}
        />
      )}

      {mode === 'byTier' && (
        <ByTierGroups
          groups={byTier}
          tierRanges={tierRanges}
          tierColor={tierColor}
          openTiers={openTiers}
          setOpenTiers={setOpenTiers}
          searchActive={Boolean(search.trim())}
        />
      )}
    </div>
  );
}

// ─── Mode pills ──────────────────────────────────────────────────────

function ModePills({
  mode,
  onChange,
  track,
}: {
  mode: Mode;
  onChange: (m: Mode) => void;
  track: ReturnType<typeof useAnalytics>['track'];
}): JSX.Element {
  const opts: { id: Mode; label: string }[] = [
    { id: 'top14', label: 'Top 14' },
    { id: 'all', label: 'All Countries' },
    { id: 'byTier', label: 'By Tier' },
  ];
  return (
    <div role="group" aria-label="Range filter" className="flex flex-wrap gap-2">
      {opts.map((opt) => {
        const active = mode === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => {
              onChange(opt.id);
              track({
                type: 'p1_chart_toggle_used',
                moduleId: 1,
                sectionId: 3,
                payload: { toggleId: 'geo_range', state: opt.id },
              });
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
  );
}

// ─── Search input ────────────────────────────────────────────────────

function SearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}): JSX.Element {
  return (
    <div
      className="flex items-center rounded-full"
      style={{
        background: 'rgb(var(--white))',
        border: '1px solid rgb(var(--border))',
        padding: '4px 10px',
        maxWidth: 360,
      }}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search countries..."
        aria-label="Search countries"
        className="flex-1 font-sans text-body-sm text-ink"
        style={{
          background: 'transparent',
          border: 'none',
          outline: 'none',
          padding: '4px 6px',
          minWidth: 0,
        }}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="flex h-6 w-6 items-center justify-center rounded-full text-tertiary hover:bg-surface hover:text-ink"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}

// ─── Tier legend ─────────────────────────────────────────────────────

function TierLegend({
  tierRanges,
  tierColor,
}: {
  tierRanges: Record<string, TierRange>;
  tierColor: Record<TierName, string>;
}): JSX.Element {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 font-mono text-[11px] text-tertiary">
      {TIER_NAMES.map((tier) => {
        const range = tierRanges[tier];
        return (
          <span key={tier} className="inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="inline-block rounded-sm"
              style={{ width: 10, height: 10, background: tierColor[tier] }}
            />
            <span>
              {tier}
              {range
                ? ` (${range.min.toFixed(2)}–${range.max.toFixed(2)})`
                : ''}
            </span>
          </span>
        );
      })}
    </div>
  );
}

// ─── Bar chart figure (shared between Top 14 and All) ────────────────

// Mobile-only vertical-list rendering of country AUI data. Each row
// shows the country name + AUI value on one line and a full-width
// progress bar below, tier-colored to match the desktop chart. Bar
// widths are normalized to the max value across the visible rows so
// the relative spread between leading and emerging countries stays
// visually meaningful.
function MobileGeoList({
  rows,
  tierColor,
}: {
  rows: GeoCountry[];
  tierColor: Record<TierName, string>;
}): JSX.Element {
  const maxValue = Math.max(...rows.map((r) => r.aui));
  return (
    <div className="space-y-2.5" aria-hidden="true">
      {rows.map((row) => {
        const widthPct = (row.aui / maxValue) * 100;
        const color = tierColor[row.tier as TierName] ?? tierColor.Emerging;
        return (
          <div key={row.iso3}>
            <div className="mb-1 flex items-baseline justify-between gap-3">
              <span
                className="font-sans text-body-sm text-ink"
                style={{ lineHeight: 1.35 }}
              >
                {row.country}
              </span>
              <span
                className="font-mono text-caption font-semibold text-secondary"
                style={{ letterSpacing: '0.02em' }}
              >
                {row.aui.toFixed(2)}
              </span>
            </div>
            <div
              className="h-2 w-full overflow-hidden rounded-full"
              style={{ background: 'rgb(var(--border-light))' }}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${widthPct}%`, background: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BarChartFigure({
  rows,
  tierColor,
  maxHeight,
  ariaLabel,
}: {
  rows: GeoCountry[];
  tierColor: Record<TierName, string>;
  maxHeight: number | null;
  ariaLabel: string;
}): JSX.Element {
  const viewport = useViewport();

  if (rows.length === 0) {
    return (
      <figure
        className="m-0 rounded-md"
        aria-label="No countries match the current search."
        style={{
          background: 'rgb(var(--white))',
          border: '1px solid rgb(var(--border))',
          padding: '24px',
          textAlign: 'center',
          color: 'rgb(var(--secondary))',
          fontSize: 13,
        }}
      >
        No countries match.
      </figure>
    );
  }

  const chartHeightPx = rows.length * ROW_PX + CHART_VPAD;
  const isScrollable = maxHeight !== null && chartHeightPx > maxHeight;

  // Mobile branch — vertical-list layout instead of Recharts horizontal
  // bars. The Recharts layout reserves a fixed 150px YAxis column for
  // country names, leaving only ~208px of bar width on a 390px viewport
  // (compressed and hard to read). The vertical list uses full row width
  // per country: name + AUI value on one line, full-width bar below.
  // Tier coloring is preserved.
  if (viewport === 'mobile') {
    return (
      <figure
        className="m-0 rounded-md"
        aria-label={ariaLabel}
        style={{
          background: 'rgb(var(--white))',
          border: '1px solid rgb(var(--border))',
          padding: '14px 12px',
        }}
      >
        <div
          style={{
            maxHeight: isScrollable ? maxHeight : undefined,
            overflowY: isScrollable ? 'auto' : 'visible',
          }}
        >
          <MobileGeoList rows={rows} tierColor={tierColor} />
        </div>
      </figure>
    );
  }

  return (
    <>
      <figure
        className="m-0 rounded-md"
        aria-label={ariaLabel}
        style={{
          background: 'rgb(var(--white))',
          border: '1px solid rgb(var(--border))',
          padding: '14px 12px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxHeight: isScrollable ? maxHeight : undefined,
            overflowY: isScrollable ? 'auto' : 'visible',
          }}
        >
          <div style={{ width: '100%', height: chartHeightPx }}>
            <ResponsiveContainer>
              <BarChart
                layout="vertical"
                data={rows}
                margin={{ top: 8, right: 36, bottom: 8, left: 8 }}
                barCategoryGap={4}
              >
                <XAxis
                  type="number"
                  domain={[0, 'auto']}
                  tick={AXIS_TICK_STYLE}
                  stroke="rgb(var(--border-light))"
                />
                <YAxis
                  type="category"
                  dataKey="country"
                  tick={{ ...AXIS_TICK_STYLE, fontSize: 11 }}
                  width={150}
                  interval={0}
                  stroke="rgb(var(--border-light))"
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  itemStyle={TOOLTIP_ITEM_STYLE}
                  labelStyle={TOOLTIP_LABEL_STYLE}
                  cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={((value: number, _name: string, entry: any) => {
                    const c = entry?.payload as GeoCountry | undefined;
                    return [`${value.toFixed(2)} (${c?.tier ?? '—'})`, 'AUI'];
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  }) as any}
                  labelFormatter={(label) => label}
                />
                <Bar dataKey="aui" isAnimationActive animationDuration={400} radius={[0, 3, 3, 0]}>
                  {rows.map((c) => (
                    <Cell key={c.iso3} fill={tierColor[c.tier as TierName] ?? tierColor.Emerging} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </figure>

      <table className="sr-only">
        <caption>Country AI Usage Index by adoption tier</caption>
        <thead>
          <tr>
            <th scope="col">Country</th>
            <th scope="col">AUI</th>
            <th scope="col">Tier</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.iso3}>
              <td>{c.country}</td>
              <td>{c.aui}</td>
              <td>{c.tier}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

// ─── By Tier groups (collapsible sections) ───────────────────────────

function ByTierGroups({
  groups,
  tierRanges,
  tierColor,
  openTiers,
  setOpenTiers,
  searchActive,
}: {
  groups: Record<TierName, GeoCountry[]>;
  tierRanges: Record<string, TierRange>;
  tierColor: Record<TierName, string>;
  openTiers: Record<string, boolean>;
  setOpenTiers: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  searchActive: boolean;
}): JSX.Element {
  return (
    <div className="space-y-3">
      {TIER_NAMES.map((tier) => {
        const list = groups[tier];
        if (searchActive && list.length === 0) return null;
        // While search is active, force-open any tier that has matches.
        const isOpen = searchActive ? list.length > 0 : Boolean(openTiers[tier]);
        const range = tierRanges[tier];
        return (
          <section
            key={tier}
            className="rounded-md"
            style={{
              background: 'rgb(var(--white))',
              border: '1px solid rgb(var(--border))',
              overflow: 'hidden',
            }}
          >
            <button
              type="button"
              onClick={() =>
                setOpenTiers((prev) => ({ ...prev, [tier]: !isOpen }))
              }
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-3 text-left"
              style={{ padding: '12px 14px', background: 'transparent' }}
            >
              <span className="inline-flex items-center gap-3">
                <span
                  aria-hidden="true"
                  style={{
                    transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                    transition: 'transform 160ms ease',
                    color: 'rgb(var(--tertiary))',
                    display: 'inline-flex',
                  }}
                >
                  <Icon name="chevronDown" size={14} />
                </span>
                <span
                  aria-hidden="true"
                  className="inline-block rounded-sm"
                  style={{
                    width: 10,
                    height: 10,
                    background: tierColor[tier],
                  }}
                />
                <span className="font-sans text-body-sm font-semibold text-ink">{tier}</span>
                {range && (
                  <span
                    className="font-mono text-caption"
                    style={{ color: 'rgb(var(--tertiary))', letterSpacing: '0.02em' }}
                  >
                    AUI {range.min.toFixed(2)}–{range.max.toFixed(2)}
                  </span>
                )}
              </span>
              <span
                className="font-mono text-caption"
                style={{ color: 'rgb(var(--tertiary))', letterSpacing: '0.02em' }}
              >
                {list.length} {list.length === 1 ? 'country' : 'countries'}
              </span>
            </button>
            {isOpen && list.length > 0 && (
              <div
                style={{ borderTop: '1px solid rgb(var(--border-light))', padding: '8px 12px' }}
              >
                <BarChartFigure
                  rows={list}
                  tierColor={tierColor}
                  maxHeight={null}
                  ariaLabel={`${tier} tier — ${list.length} countries.`}
                />
              </div>
            )}
            {isOpen && list.length === 0 && (
              <div
                className="font-sans text-body-sm"
                style={{
                  padding: '12px 14px',
                  borderTop: '1px solid rgb(var(--border-light))',
                  color: 'rgb(var(--secondary))',
                  fontStyle: 'italic',
                }}
              >
                No countries in this tier match the current search.
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

// ─── Census enterprise inset (exported so the parent can slot the GDP
// scatter between the country bar chart and this panel) ──────────────

export function CensusEnterpriseInset({
  adoption,
}: {
  adoption: CensusAdoption;
}): JSX.Element {
  const tokens = useChartTokens();
  const fall = Math.round(adoption.fall2023 * 1000) / 10;
  const aug = Math.round(adoption.earlyAugust2025 * 1000) / 10;
  const data = [
    { period: 'Fall 2023', pct: fall, label: `${fall}%` },
    { period: 'Aug 2025', pct: aug, label: `${aug}%` },
  ];

  return (
    <aside
      className="mt-2 rounded-lg"
      style={{
        background: 'rgb(var(--surface))',
        border: '1px solid rgb(var(--border))',
        padding: '14px 18px',
      }}
    >
      <div className="mb-1 font-sans text-body-sm font-semibold text-ink">
        US firms reporting AI use
      </div>
      <div
        className="mb-3 font-mono text-caption text-tertiary"
        style={{ letterSpacing: '0.02em' }}
      >
        Census Bureau Business Trends and Outlook Survey
      </div>
      <div style={{ width: '100%', height: 120 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 16 }} barCategoryGap="35%">
            <XAxis
              dataKey="period"
              tick={AXIS_TICK_STYLE}
              axisLine={{ stroke: 'rgb(var(--border-light))' }}
              tickLine={false}
            />
            <YAxis hide domain={[0, 12]} />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              itemStyle={TOOLTIP_ITEM_STYLE}
              labelStyle={TOOLTIP_LABEL_STYLE}
              cursor={{ fill: 'rgba(0,0,0,0.04)' }}
              formatter={(value: number) => [`${value}%`, 'Adoption rate']}
            />
            <Bar dataKey="pct" fill={tokens.secondary} radius={[3, 3, 0, 0]} isAnimationActive animationDuration={400}>
              {data.map((d) => (
                <Cell key={d.period} fill={tokens.secondary} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="m-0 mt-1 font-sans text-body-sm italic text-body">
        Even in a leading adoption country, fewer than 1 in 10 firms formally report using AI.
      </p>
    </aside>
  );
}
