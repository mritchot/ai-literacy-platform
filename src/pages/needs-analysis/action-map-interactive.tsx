// The Action Map's interactive quadrant map, split out of ActionMap.tsx
// (which keeps the page shell/prose; static content lives in
// action-map-data.ts).
//
// Two departures from the design-phase prototype, both accessibility
// fixes rather than redesigns:
//
// 1. The two toggle targets (behavior cards, quadrant headers) were
//    clickable <div onClick>s — unreachable by keyboard. They are now
//    <button type="button"> with `aria-expanded`, keeping the original
//    inline styles (plus the resets a real button needs). Their inner
//    markup uses block/flex <span>s instead of div/h3/p because a button
//    may only contain phrasing content.
// 2. The prototype's hardcoded light palette (page chrome: card whites,
//    inks, warm grays) now resolves through the design-system tokens in
//    src/styles/index.css, so the map follows dark mode like the rest of
//    the platform, and the #888/#999 metadata text picks up the
//    WCAG-corrected `--tertiary` value. The four quadrant accent hexes
//    (and the accent-tinted strokes/shadows derived from them) stay
//    literal — they are brand colors used identically in both themes.

import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { renderInline } from '../../components/shared/render-markdown';
import {
  ACTIVITIES,
  BEHAVIORS,
  COLORS,
  GOAL_NOTE,
  GOAL_TEXT,
  QUADRANTS,
  REFERENCES,
  type Activity,
  type Behavior,
  type QuadrantKey,
  type Reference,
} from './action-map-data';

// ─── Interactive pieces ────────────────────────────────────────────────

function Pill({
  label,
  color,
  active,
  onClick,
  small,
  activeText = '#fff',
}: {
  label: string;
  color: string;
  active: boolean;
  onClick: () => void;
  small?: boolean;
  // Text color when active (sitting on `color`). Defaults to white, which
  // is correct for the theme-invariant quadrant accents; pills whose
  // `color` is a theme token pass `rgb(var(--white))` so the active label
  // inverts with the theme.
  activeText?: string;
}): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: small ? '3px 10px' : '5px 14px',
        borderRadius: 20,
        border: `1.5px solid ${color}`,
        background: active ? color : 'transparent',
        color: active ? activeText : color,
        fontSize: small ? 11 : 12,
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
}

function Tag({ label, color }: { label: string; color: string }): JSX.Element {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 4,
        background: color + '22',
        color,
        fontSize: 10,
        fontWeight: 600,
        fontFamily: "'DM Sans', sans-serif",
        letterSpacing: '0.03em',
      }}
    >
      {label}
    </span>
  );
}

// Rendered inside the BehaviorCard <button>, so only phrasing content —
// block-styled <span>s, not <div>s.
function MetaBlock({ label, color, children }: { label: string; color: string; children: ReactNode }): JSX.Element {
  return (
    <span style={{ display: 'block', marginBottom: 8 }}>
      <span
        style={{
          display: 'block',
          fontSize: 10,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color,
          marginBottom: 4,
        }}
      >
        {label}
      </span>
      <span style={{ display: 'block', fontSize: 12, color: 'rgb(var(--body))' }}>{children}</span>
    </span>
  );
}

function BehaviorCard({
  b,
  quadrant,
  isActive,
  onClick,
  isHighlighted,
  showMeta,
}: {
  b: Behavior;
  quadrant: QuadrantKey;
  isActive: boolean;
  onClick: () => void;
  isHighlighted: boolean | null;
  showMeta: boolean;
}): JSX.Element {
  const c = COLORS[quadrant];
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={isActive}
      style={{
        // Button resets — keep the card's visual identical to the old div.
        display: 'block',
        width: '100%',
        margin: 0,
        font: 'inherit',
        color: 'inherit',
        textAlign: 'left',
        WebkitAppearance: 'none',
        appearance: 'none',
        padding: isActive ? '16px 18px' : '10px 14px',
        borderRadius: 10,
        background: isActive ? 'rgb(var(--white))' : isHighlighted ? c.light : 'rgb(var(--surface))',
        border: `1.5px solid ${isActive ? c.bg : isHighlighted ? c.mid : 'rgb(var(--border))'}`,
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        boxShadow: isActive ? `0 4px 20px ${c.bg}25` : 'none',
        opacity: isHighlighted === false ? 0.4 : 1,
      }}
    >
      <span style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 28,
            height: 20,
            borderRadius: 4,
            background: c.bg,
            color: '#fff',
            fontSize: 10,
            fontWeight: 700,
            fontFamily: "'DM Mono', monospace",
            letterSpacing: '0.05em',
          }}
        >
          {b.id}
        </span>
        <span
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: 'rgb(var(--ink))',
            lineHeight: 1.4,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {b.short}
        </span>
      </span>
      {isActive && (
        <span
          style={{
            display: 'block',
            marginTop: 14,
            fontSize: 12.5,
            lineHeight: 1.6,
            color: 'rgb(var(--body))',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <span style={{ display: 'block', margin: '0 0 12px', fontStyle: 'italic', color: 'rgb(var(--secondary))', fontSize: 12 }}>
            {b.full}
          </span>
          {showMeta && (
            <>
              <MetaBlock label="Sub-component" color={c.bg}>
                {b.subComp}
              </MetaBlock>
              <MetaBlock label="Gap Trace" color={c.bg}>
                {renderInline(b.gap, `${b.id}-gap`)}
              </MetaBlock>
              <MetaBlock label="Module Trace" color={c.bg}>
                {renderInline(b.module, `${b.id}-mod`)}
              </MetaBlock>
            </>
          )}
          <span style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 10 }}>
            {b.builds.map((p) => (
              <Tag key={p} label={p} color="#5E7080" />
            ))}
            {b.refs.map((r) => (
              <Tag key={r} label={r} color="#7A6B80" />
            ))}
          </span>
        </span>
      )}
    </button>
  );
}

export function InteractiveMap(): JSX.Element {
  const [activeQuadrant, setActiveQuadrant] = useState<QuadrantKey | null>(null);
  const [activeBehavior, setActiveBehavior] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [showMeta, setShowMeta] = useState(false);
  const [hoveredActivity, setHoveredActivity] = useState<string | null>(null);
  const [hoveredRef, setHoveredRef] = useState<string | null>(null);

  const highlightedBehaviors = useMemo<Set<string> | null>(() => {
    if (hoveredActivity) {
      const set = new Set<string>();
      Object.values(BEHAVIORS)
        .flat()
        .forEach((b) => {
          if (b.builds.includes(hoveredActivity)) set.add(b.id);
        });
      return set;
    }
    if (hoveredRef) {
      const set = new Set<string>();
      Object.values(BEHAVIORS)
        .flat()
        .forEach((b) => {
          if (b.refs.includes(hoveredRef)) set.add(b.id);
        });
      return set;
    }
    return null;
  }, [hoveredActivity, hoveredRef]);

  const highlightedActivities = useMemo<Set<string> | null>(() => {
    if (!activeBehavior) return null;
    const b = Object.values(BEHAVIORS)
      .flat()
      .find((x) => x.id === activeBehavior);
    return b ? new Set(b.builds) : null;
  }, [activeBehavior]);

  const highlightedRefs = useMemo<Set<string> | null>(() => {
    if (!activeBehavior) return null;
    const b = Object.values(BEHAVIORS)
      .flat()
      .find((x) => x.id === activeBehavior);
    return b ? new Set(b.refs) : null;
  }, [activeBehavior]);

  const visibleQuadrants = activeQuadrant ? [activeQuadrant] : QUADRANTS.map((q) => q.key);
  const filteredActivities = useMemo<Activity[]>(() => {
    if (!activeQuadrant) return ACTIVITIES;
    const behaviorIds = BEHAVIORS[activeQuadrant].flatMap((b) => b.builds);
    return ACTIVITIES.filter((a) => behaviorIds.includes(a.id));
  }, [activeQuadrant]);
  const filteredRefs = useMemo<Reference[]>(() => {
    if (!activeQuadrant) return REFERENCES;
    const refIds = BEHAVIORS[activeQuadrant].flatMap((b) => b.refs);
    return REFERENCES.filter((r) => refIds.includes(r.id));
  }, [activeQuadrant]);

  const handleQuadrantClick = useCallback((key: QuadrantKey) => {
    setActiveQuadrant((prev) => (prev === key ? null : key));
    setActiveBehavior(null);
  }, []);

  const handleBehaviorClick = useCallback((id: string) => {
    setActiveBehavior((prev) => (prev === id ? null : id));
  }, []);

  return (
    <div
      className="my-7 overflow-hidden rounded-xl"
      style={{
        background: 'rgb(var(--surface-warm))',
        border: '1px solid rgb(var(--border-light))',
        color: 'rgb(var(--ink))',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div style={{ padding: '24px 22px 32px' }}>
        {/* Controls */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 10,
            marginBottom: 24,
            paddingBottom: 16,
            borderBottom: '1px solid rgb(var(--border))',
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'rgb(var(--tertiary))',
              marginRight: 4,
              fontFamily: "'DM Mono', monospace",
            }}
          >
            Filter
          </span>
          {QUADRANTS.map((q) => (
            <Pill
              key={q.key}
              label={q.label}
              color={COLORS[q.key].bg}
              active={activeQuadrant === q.key}
              onClick={() => handleQuadrantClick(q.key)}
            />
          ))}
          <div style={{ flex: 1, minWidth: 12 }} />
          <Pill
            label={showMeta ? 'Hide Metadata' : 'Show Metadata'}
            color="rgb(var(--tertiary))"
            activeText="rgb(var(--white))"
            active={showMeta}
            onClick={() => setShowMeta(!showMeta)}
            small
          />
          <Pill
            label={showAll ? 'Collapse' : 'Show All'}
            color="rgb(var(--secondary))"
            activeText="rgb(var(--white))"
            active={showAll}
            onClick={() => {
              setShowAll(!showAll);
              if (!showAll) setActiveBehavior(null);
            }}
            small
          />
        </div>

        {/* Center Goal */}
        <div
          style={{
            background: 'rgb(var(--white))',
            borderRadius: 14,
            padding: '24px 26px',
            border: '2px solid #6B7F5E',
            marginBottom: 28,
            boxShadow: '0 2px 12px rgba(107,127,94,0.08)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: `linear-gradient(90deg, ${COLORS.delegation.bg}, ${COLORS.description.bg}, ${COLORS.discernment.bg}, ${COLORS.diligence.bg})`,
            }}
          />
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#6B7F5E',
              marginBottom: 10,
              fontFamily: "'DM Mono', monospace",
            }}
          >
            Center — Measurable Business Goal
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.65, margin: 0, color: 'rgb(var(--ink-secondary))' }}>{GOAL_TEXT}</p>
          <p style={{ fontSize: 11, color: 'rgb(var(--tertiary))', margin: '10px 0 0', fontStyle: 'italic', lineHeight: 1.5 }}>
            {GOAL_NOTE}
          </p>
        </div>

        {/* Ring Labels */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'Ring 1 — Observable Behaviors', color: '#6B7F5E' },
            { label: 'Ring 2 — Practice Activities', color: '#5E7080' },
            { label: 'Ring 3 — Reference Information', color: '#7A6B80' },
          ].map((r) => (
            <div
              key={r.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11,
                fontWeight: 600,
                color: r.color,
                fontFamily: "'DM Mono', monospace",
                letterSpacing: '0.04em',
              }}
            >
              <div style={{ width: 10, height: 10, borderRadius: 3, background: r.color }} />
              {r.label}
            </div>
          ))}
        </div>

        {/* Main Grid: Behaviors */}
        <div
          className={activeQuadrant ? 'grid grid-cols-1' : 'grid grid-cols-1 sm:grid-cols-2'}
          style={{ gap: 20, marginBottom: 28 }}
        >
          {QUADRANTS.filter((q) => visibleQuadrants.includes(q.key)).map((q) => {
            const c = COLORS[q.key];
            const behaviors = BEHAVIORS[q.key];
            return (
              <div
                key={q.key}
                style={{
                  borderRadius: 14,
                  overflow: 'hidden',
                  border: `1.5px solid ${activeQuadrant === q.key ? c.bg : 'rgb(var(--border-light))'}`,
                  background: 'rgb(var(--white))',
                  transition: 'all 0.3s ease',
                }}
              >
                {/* Quadrant Header */}
                <button
                  type="button"
                  onClick={() => handleQuadrantClick(q.key)}
                  aria-expanded={activeQuadrant === q.key}
                  style={{
                    // Button resets — visual parity with the old div.
                    display: 'block',
                    width: '100%',
                    margin: 0,
                    font: 'inherit',
                    color: 'inherit',
                    textAlign: 'left',
                    WebkitAppearance: 'none',
                    appearance: 'none',
                    border: 'none',
                    padding: '16px 20px',
                    cursor: 'pointer',
                    background: activeQuadrant === q.key ? c.bg : c.light,
                    borderBottom: `1px solid ${activeQuadrant === q.key ? c.bg : c.mid}`,
                    transition: 'all 0.25s ease',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>
                      <span
                        style={{
                          display: 'block',
                          margin: 0,
                          fontSize: 16,
                          fontWeight: 700,
                          color: activeQuadrant === q.key ? '#fff' : c.text,
                          fontFamily: "'DM Serif Display', serif",
                        }}
                      >
                        {q.label}
                      </span>
                      <span
                        style={{
                          display: 'block',
                          margin: '4px 0 0',
                          fontSize: 11.5,
                          lineHeight: 1.4,
                          color: activeQuadrant === q.key ? 'rgba(255,255,255,0.8)' : c.textSub,
                          maxWidth: 400,
                        }}
                      >
                        {q.sub}
                      </span>
                    </span>
                    <span
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: activeQuadrant === q.key ? 'rgba(255,255,255,0.2)' : c.bg + '15',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                        fontWeight: 700,
                        color: activeQuadrant === q.key ? '#fff' : c.bg,
                        fontFamily: "'DM Mono', monospace",
                      }}
                    >
                      {behaviors.length}
                    </span>
                  </span>
                </button>

                {/* Behaviors List */}
                <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {behaviors.map((b) => (
                    <BehaviorCard
                      key={b.id}
                      b={b}
                      quadrant={q.key}
                      isActive={activeBehavior === b.id || showAll}
                      onClick={() => handleBehaviorClick(b.id)}
                      isHighlighted={highlightedBehaviors ? highlightedBehaviors.has(b.id) : null}
                      showMeta={showMeta}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Ring 2: Practice Activities */}
        <div
          style={{
            background: 'rgb(var(--white))',
            borderRadius: 14,
            padding: '20px 22px',
            border: '1.5px solid #C8D5DE',
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#5E7080',
              marginBottom: 14,
              fontFamily: "'DM Mono', monospace",
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: 3, background: '#5E7080' }} />
            Ring 2 — Practice Activities ({filteredActivities.length})
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
            {filteredActivities.map((a) => {
              const isHL = highlightedActivities ? highlightedActivities.has(a.id) : null;
              return (
                <div
                  key={a.id}
                  // Focusable so keyboard/AT users get the same
                  // activity→behavior highlight that hover provides.
                  tabIndex={0}
                  onMouseEnter={() => setHoveredActivity(a.id)}
                  onMouseLeave={() => setHoveredActivity(null)}
                  onFocus={() => setHoveredActivity(a.id)}
                  onBlur={() => setHoveredActivity(null)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    background:
                      isHL === true
                        ? 'rgb(var(--discernment-light))'
                        : isHL === false
                          ? 'rgb(var(--surface))'
                          : hoveredActivity === a.id
                            ? 'rgb(var(--discernment-light) / 0.65)'
                            : 'rgb(var(--surface))',
                    border: `1px solid ${isHL === true ? '#5E7080' : 'rgb(var(--border))'}`,
                    opacity: isHL === false ? 0.35 : 1,
                    transition: 'all 0.2s ease',
                    cursor: 'default',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#5E7080', fontFamily: "'DM Mono', monospace", minWidth: 24 }}>{a.id}</span>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: 'rgb(var(--ink))' }}>{a.short}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 10.5, color: 'rgb(var(--tertiary))' }}>{a.module}</span>
                    <span style={{ fontSize: 10.5, color: 'rgb(var(--subtle))' }}>•</span>
                    <span style={{ fontSize: 10.5, color: 'rgb(var(--tertiary))' }}>{a.component}</span>
                  </div>
                  {(showAll || showMeta) && (
                    <div style={{ fontSize: 10.5, color: 'rgb(var(--tertiary))', marginTop: 4, fontStyle: 'italic' }}>{a.type}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Ring 3: Reference Information */}
        <div style={{ background: 'rgb(var(--white))', borderRadius: 14, padding: '20px 22px', border: '1.5px solid #D1C4D9' }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#7A6B80',
              marginBottom: 14,
              fontFamily: "'DM Mono', monospace",
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: 3, background: '#7A6B80' }} />
            Ring 3 — Reference Information ({filteredRefs.length})
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
            {filteredRefs.map((r) => {
              const isHL = highlightedRefs ? highlightedRefs.has(r.id) : null;
              return (
                <div
                  key={r.id}
                  // Focusable so keyboard/AT users get the same
                  // reference→behavior highlight that hover provides.
                  tabIndex={0}
                  onMouseEnter={() => setHoveredRef(r.id)}
                  onMouseLeave={() => setHoveredRef(null)}
                  onFocus={() => setHoveredRef(r.id)}
                  onBlur={() => setHoveredRef(null)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    background:
                      isHL === true
                        ? 'rgb(var(--diligence-light))'
                        : isHL === false
                          ? 'rgb(var(--surface))'
                          : hoveredRef === r.id
                            ? 'rgb(var(--diligence-light) / 0.8)'
                            : 'rgb(var(--surface))',
                    border: `1px solid ${isHL === true ? '#7A6B80' : 'rgb(var(--border))'}`,
                    opacity: isHL === false ? 0.35 : 1,
                    transition: 'all 0.2s ease',
                    cursor: 'default',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#7A6B80', fontFamily: "'DM Mono', monospace", minWidth: 20 }}>{r.id}</span>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: 'rgb(var(--ink))' }}>{r.short}</span>
                  </div>
                  {(showAll || showMeta) && (
                    <div style={{ fontSize: 10.5, color: 'rgb(var(--tertiary))', fontStyle: 'italic' }}>{r.format}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div
          style={{
            marginTop: 28,
            padding: '16px 20px',
            borderRadius: 10,
            background: 'rgb(var(--surface))',
            border: '1px solid rgb(var(--border))',
            fontSize: 11.5,
            color: 'rgb(var(--tertiary))',
            lineHeight: 1.7,
          }}
        >
          <strong style={{ color: 'rgb(var(--secondary))' }}>Interactions:</strong> Click a{' '}
          <strong style={{ color: '#6B7F5E' }}>competency header</strong> to filter by dimension. Click a{' '}
          <strong style={{ color: '#6B7F5E' }}>behavior card</strong> to expand details and highlight linked activities and
          references. Hover over a <strong style={{ color: '#5E7080' }}>practice activity</strong> or{' '}
          <strong style={{ color: '#7A6B80' }}>reference item</strong> to see which behaviors it supports. Toggle{' '}
          <em>Show Metadata</em> for gap traces, module traces, and sub-component alignment. Toggle <em>Show All</em> to expand
          every element simultaneously.
        </div>
      </div>
    </div>
  );
}
