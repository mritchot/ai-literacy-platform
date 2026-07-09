// P10 OutputVerification — AI-generated briefing with six sequential
// verification cards (4B spec §7). Markers in the briefing scroll the
// learner to the matching card; cards unlock sequentially after each
// submission.

import { useEffect, useMemo, useRef, useState } from 'react';
import { BottleneckCallout } from '../../components/shared/BottleneckCallout';
import { Icon } from '../../components/shared/Icon';
import { Overline } from '../../components/shared/Overline';
import { R4Trigger } from '../../components/reference/R4Trigger';
import { ReferenceTabRail } from '../../components/reference/ReferenceTabRail';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { useLearnerProgress } from '../../contexts/LearnerProgressContext';
import { scrollBehavior } from '../../utils/motion';
import {
  P10_BRIEFING_SEGMENTS,
  P10_ELEMENTS,
  P10_SCENARIO,
  P10_SUMMARY,
  type Classification,
  type VerificationElement,
} from './module4-content';

const DISCERNMENT = '#5E7080';
const INFO = '#5E7080';

const CLASSIFICATION_META: Record<
  Classification,
  { label: string; symbol: string; tone: 'success' | 'caution' | 'error'; risk: string }
> = {
  include: { label: 'Include', symbol: '✓', tone: 'success', risk: 'Low Risk' },
  verify: { label: 'Verify', symbol: '?', tone: 'caution', risk: 'Medium Risk' },
  flag: { label: 'Flag', symbol: '⚑', tone: 'error', risk: 'High Risk' },
};

// Migration table for prior localStorage entries written under the
// old Classification union (`reliable | uncertain | fabricated`). The
// activity was relabeled to action-oriented triage; mapping the old
// stored values to their nearest new equivalent lets learners with
// in-progress sessions resume without losing state.
const CLASSIFICATION_MIGRATION: Record<string, Classification> = {
  reliable: 'include',
  uncertain: 'verify',
  fabricated: 'flag',
  include: 'include',
  verify: 'verify',
  flag: 'flag',
};

const TONE_BORDER: Record<'success' | 'caution' | 'error', string> = {
  success: 'rgb(var(--success))',
  caution: 'rgb(var(--caution))',
  error: 'rgb(var(--error))',
};

const TONE_BG: Record<'success' | 'caution' | 'error', string> = {
  success: 'rgb(var(--success-light))',
  caution: 'rgb(var(--caution-light))',
  error: 'rgb(var(--error-light))',
};

export function OutputVerification(): JSX.Element {
  const { state, recordKnowledgeCheck } = useLearnerProgress();
  const { track } = useAnalytics();
  const briefingRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [hasViewed, setHasViewed] = useState(false);

  // Restore prior classifications from persisted state. Values stored
  // before the relabel pass (reliable/uncertain/fabricated) are mapped
  // through CLASSIFICATION_MIGRATION to their new equivalents.
  const restored = useMemo<Record<string, Classification | null>>(() => {
    const out: Record<string, Classification | null> = {};
    for (const el of P10_ELEMENTS) {
      const stored = state.knowledgeChecks[`4.5.${el.id}`];
      const raw = stored?.selectedOptionId as string | undefined;
      out[el.id] = raw ? (CLASSIFICATION_MIGRATION[raw] ?? null) : null;
    }
    return out;
  }, [state.knowledgeChecks]);

  const [classifications, setClassifications] =
    useState<Record<string, Classification | null>>(restored);

  // Fire `briefing_viewed` once when the briefing enters the viewport.
  useEffect(() => {
    if (hasViewed) return;
    const el = briefingRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !hasViewed) {
            setHasViewed(true);
            track({ type: 'p10_briefing_viewed', moduleId: 4, sectionId: 5 });
            obs.disconnect();
          }
        }
      },
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasViewed, track]);

  const submittedCount = P10_ELEMENTS.filter((el) => classifications[el.id]).length;
  const allSubmitted = submittedCount === P10_ELEMENTS.length;

  const onClassify = (elementId: string, classification: Classification) => {
    const el = P10_ELEMENTS.find((e) => e.id === elementId);
    if (!el || classifications[elementId]) return;
    setClassifications((prev) => ({ ...prev, [elementId]: classification }));
    recordKnowledgeCheck(4, 5, elementId, {
      selectedOptionId: classification,
      isPreferred: classification === el.intendedClassification,
      timestamp: Date.now(),
    });
    track({
      type: `p10_${elementId}_submitted`,
      moduleId: 4,
      sectionId: 5,
      payload: {
        classification,
        matchesIntended: classification === el.intendedClassification,
      },
    });
    if (submittedCount + 1 === P10_ELEMENTS.length) {
      track({
        type: 'p10_all_submitted',
        moduleId: 4,
        sectionId: 5,
        payload: {
          matchCount: P10_ELEMENTS.filter((e) => {
            const chosen = e.id === elementId ? classification : classifications[e.id];
            return chosen === e.intendedClassification;
          }).length,
        },
      });
    }
  };

  const onMarkerClick = (marker: number) => {
    const el = P10_ELEMENTS.find((e) => e.marker === marker);
    if (!el) return;
    cardRefs.current[el.id]?.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
  };

  // Reverse navigation: when the learner clicks "View in briefing ↑"
  // inside a card, scroll the corresponding marker in the briefing
  // back into view. Symmetric counterpart to onMarkerClick above.
  const onScrollToMarker = (marker: number) => {
    const el = document.getElementById(`p10-marker-${marker}`);
    el?.scrollIntoView({ behavior: scrollBehavior(), block: 'center' });
  };

  return (
    <div className="space-y-3">
      {/* R4 supports D7 + D8 + D9 (Discernment) + D11 (Deployment
          Diligence) — the behaviors P10 builds. The interactive
          checklist gives the learner a verification scratch tool while
          they classify each element of the AI-generated briefing. */}
      <ReferenceTabRail>
        <R4Trigger label="Verification Checklist" />
      </ReferenceTabRail>

      <section
        aria-label="Output verification scenario"
        className="rounded-xl"
        style={{
          background: 'rgb(var(--white))',
          border: '1px solid rgb(var(--border))',
          padding: '24px 26px',
        }}
      >
      <Overline className="mb-2">Practice activity — P10</Overline>
      <h3
        className="m-0 mb-3 font-display text-title font-normal text-ink"
        style={{ letterSpacing: '-0.005em' }}
      >
        Output verification: the polished briefing
      </h3>

      <div className="mb-6">
        <BottleneckCallout title="Your situation">
          <p className="m-0 whitespace-pre-line">{P10_SCENARIO}</p>
        </BottleneckCallout>
      </div>

      <div ref={briefingRef}>
        <BriefingDocument onMarkerClick={onMarkerClick} />
      </div>

      {/* Decision-criteria callout: gives learners the triage heuristic
          before they classify. Sits between the briefing and the first
          card so the learner reads it once and then carries it into
          each per-element decision. Two-factor framing: signal density
          (one vs. compounding) crossed with verification difficulty
          (clear search target vs. hard-to-verify) → risk profile →
          action. */}
      <aside
        role="note"
        aria-label="Triage decision criteria"
        className="mt-6 rounded-lg"
        style={{
          background: 'rgb(var(--surface-warm))',
          border: '1px solid rgb(var(--border))',
          borderLeft: `3px solid ${DISCERNMENT}`,
          padding: '14px 18px',
        }}
      >
        <div
          className="mb-2 font-mono text-overline font-bold uppercase"
          style={{ color: DISCERNMENT, letterSpacing: '0.1em' }}
        >
          Triage decision
        </div>
        <p
          className="m-0 mb-2.5 font-sans text-body-sm text-body"
          style={{ lineHeight: 1.55 }}
        >
          Two factors determine where an element belongs:{' '}
          <strong className="text-ink">how many specificity signals it carries</strong>{' '}
          (one detail vs. compounding details), and{' '}
          <strong className="text-ink">how hard it is to verify</strong> (clear search target vs.
          no good way to check). Together they determine the risk profile.
        </p>
        <ul
          className="m-0 list-none space-y-1.5 p-0 font-sans text-body-sm text-body"
          style={{ lineHeight: 1.55 }}
        >
          <li>
            <strong className="text-ink">✓ Include: Low Risk.</strong> The passage manages its
            own attribution and limitations. Nothing to verify; forward as-is.
          </li>
          <li>
            <strong className="text-ink">? Verify: Medium Risk.</strong> A specific factual claim
            with a clear verification path (named company + searchable timeframe, identifiable
            source). Doable in ~5 minutes. Check before including.
          </li>
          <li>
            <strong className="text-ink">⚑ Flag: High Risk.</strong> Multiple specificity signals
            compound <em>and</em> verification is harder (citation without article title, quote
            without transcript link). Check first. If you can&apos;t confirm in reasonable time,
            exclude.
          </li>
        </ul>
        <p
          className="m-0 mt-2 font-sans text-body-sm italic text-secondary"
          style={{ lineHeight: 1.5 }}
        >
          The heuristic: count the signals AND consider how easy verification will be. The two
          compound: high signal count plus hard-to-verify is the flag pattern.
        </p>
      </aside>

      <ul className="m-0 mt-6 list-none space-y-4 p-0">
        {P10_ELEMENTS.map((element, idx) => {
          const previous = idx === 0 ? null : P10_ELEMENTS[idx - 1];
          const unlocked = !previous || Boolean(classifications[previous.id]);
          return (
            <li key={element.id}>
              <div
                ref={(el) => {
                  cardRefs.current[element.id] = el;
                }}
              >
                <VerificationCard
                  element={element}
                  index={idx + 1}
                  total={P10_ELEMENTS.length}
                  unlocked={unlocked}
                  classification={classifications[element.id] ?? null}
                  onClassify={(c) => onClassify(element.id, c)}
                  onScrollToMarker={onScrollToMarker}
                />
              </div>
            </li>
          );
        })}
      </ul>

      {allSubmitted && (
        <aside
          role="note"
          className="mt-8 rounded-lg"
          style={{
            background: 'rgb(var(--surface-warm))',
            border: '1px solid rgb(var(--border))',
            borderLeft: `3px solid ${DISCERNMENT}`,
            padding: '18px 22px',
          }}
        >
          <h4 className="m-0 mb-3 font-sans text-h4 font-semibold text-ink">
            Verification pattern: what this briefing revealed
          </h4>
          <div className="font-sans text-body-sm leading-relaxed text-body whitespace-pre-line">
            {P10_SUMMARY.replace(/^Verification triage[^.\n]*\.\n\n/, '')}
          </div>
        </aside>
      )}
      </section>
    </div>
  );
}

// ─── Briefing document with inline highlight markers ───────────────

function BriefingDocument({
  onMarkerClick,
}: {
  onMarkerClick: (marker: number) => void;
}): JSX.Element {
  // Group segments into paragraphs by `newParagraph: true` boundaries.
  const paragraphs: { heading?: string | undefined; nodes: JSX.Element[] }[] = [];
  let current: { heading?: string | undefined; nodes: JSX.Element[] } = { nodes: [] };

  P10_BRIEFING_SEGMENTS.forEach((seg, i) => {
    if (seg.newParagraph || seg.heading) {
      if (current.nodes.length > 0 || current.heading) paragraphs.push(current);
      current = { heading: seg.heading, nodes: [] };
    }
    if (seg.text) {
      if (seg.marker !== undefined) {
        current.nodes.push(
          // Keyboard-activatable highlight: role/tabIndex/Enter+Space make
          // the briefing→card jump reachable without a mouse (the reverse
          // card→briefing jump is already a real <button>).
          <mark
            key={i}
            id={`p10-marker-${seg.marker}`}
            role="button"
            tabIndex={0}
            aria-label={`Jump to verification card ${seg.marker}: ${seg.text.slice(0, 60)}`}
            onClick={() => onMarkerClick(seg.marker as number)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onMarkerClick(seg.marker as number);
              }
            }}
            style={{
              background: 'rgba(155, 123, 46, 0.18)',
              borderBottom: '2px dotted rgb(var(--caution))',
              padding: '0 2px',
              cursor: 'pointer',
              color: 'rgb(var(--ink))',
            }}
          >
            <MarkerBadge n={seg.marker} />
            {seg.text}
          </mark>,
        );
      } else {
        current.nodes.push(<span key={i}>{seg.text}</span>);
      }
    }
  });
  if (current.nodes.length > 0 || current.heading) paragraphs.push(current);

  return (
    <article
      className="rounded-xl"
      style={{
        background: 'rgb(var(--white))',
        border: '1.5px solid rgb(var(--border))',
        padding: '24px 26px',
      }}
    >
      <h3 className="m-0 mb-4 font-sans text-h3 font-semibold text-ink">
        INTERNAL BRIEFING — Competitor AI in Supply Chain Operations
      </h3>
      {paragraphs.map((para, i) => (
        <div key={i} style={{ marginBottom: 12 }}>
          {para.heading && (
            <h4 className="m-0 mb-1.5 font-sans text-h4 font-semibold text-ink">{para.heading}</h4>
          )}
          {para.nodes.length > 0 && (
            <p className="m-0 font-sans text-body leading-relaxed text-ink">{para.nodes}</p>
          )}
        </div>
      ))}
    </article>
  );
}

function MarkerBadge({ n }: { n: number }): JSX.Element {
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 18,
        height: 18,
        borderRadius: '50%',
        background: 'rgb(var(--caution))',
        color: 'rgb(var(--white))',
        fontFamily: '"DM Mono", "Courier New", monospace',
        fontSize: 10.5,
        fontWeight: 700,
        marginRight: 4,
        verticalAlign: 'baseline',
      }}
    >
      {n}
    </span>
  );
}

// ─── Verification card ────────────────────────────────────────────

function VerificationCard({
  element,
  index,
  total,
  unlocked,
  classification,
  onClassify,
  onScrollToMarker,
}: {
  element: VerificationElement;
  index: number;
  total: number;
  unlocked: boolean;
  classification: Classification | null;
  onClassify: (c: Classification) => void;
  onScrollToMarker: (marker: number) => void;
}): JSX.Element {
  const submitted = Boolean(classification);
  const feedback = classification ? element.feedback[classification] : null;
  const [pendingChoice, setPendingChoice] = useState<Classification | null>(null);
  // Local toggle for the See-all-responses expander, matching the
  // KnowledgeCheck and P8 patterns. Per-card state, not persisted —
  // the expander is a pure UI affordance.
  const [showAll, setShowAll] = useState<boolean>(false);

  const onSubmit = () => {
    if (!pendingChoice || submitted) return;
    onClassify(pendingChoice);
  };

  return (
    <article
      aria-label={`Element ${index} of ${total}`}
      aria-disabled={!unlocked}
      className="rounded-lg transition-opacity duration-300"
      style={{
        background: 'rgb(var(--surface))',
        border: `1px solid ${unlocked ? 'rgb(var(--border))' : 'rgba(232, 230, 225, 0.4)'}`,
        padding: '18px 20px',
        opacity: unlocked ? 1 : 0.4,
        pointerEvents: unlocked ? 'auto' : 'none',
      }}
    >
      {/* Header row: marker badge + element index on the left, a small
          "View in briefing ↑" link on the right that scrolls the
          corresponding marker back into view. Symmetric counterpart to
          the briefing-marker-click that scrolls TO the card. */}
      <div className="mb-2 flex items-center gap-2">
        <MarkerBadge n={element.marker} />
        <Overline style={{ fontSize: 11 }}>
          Element {index} of {total}
        </Overline>
        <button
          type="button"
          onClick={() => onScrollToMarker(element.marker)}
          className="ml-auto font-sans text-[11.5px] font-medium text-action hover:text-action-hover"
        >
          View in briefing ↑
        </button>
      </div>

      <p
        className="m-0 mb-4 rounded-md font-sans text-body italic text-ink"
        style={{
          background: 'rgb(var(--white))',
          border: '1px solid rgb(var(--border-light))',
          padding: '12px 14px',
        }}
      >
        “{element.highlightedText}”
      </p>

      {/* Accessibility label on the fieldset as aria-label rather than
          in a sr-only legend (see InterpretationCheck.tsx for full
          rationale on the iOS overflow pattern). The inner radiogroup
          keeps its own aria-label too — different scope. */}
      <fieldset
        disabled={submitted || !unlocked}
        className="m-0 border-0 p-0"
        aria-label={`Classify Element ${index}`}
      >
        <div
          role="radiogroup"
          aria-label={`Classify Element ${index}`}
          className="grid gap-2"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}
        >
          {(['include', 'verify', 'flag'] as Classification[]).map((c) => {
            const meta = CLASSIFICATION_META[c];
            const tone = meta.tone;
            const isSelected = (submitted ? classification : pendingChoice) === c;
            const colors = isSelected
              ? {
                  bg: TONE_BG[tone],
                  border: TONE_BORDER[tone],
                  text: TONE_BORDER[tone],
                }
              : {
                  bg: 'rgb(var(--surface))',
                  border: 'rgb(var(--border))',
                  text: 'rgb(var(--secondary))',
                };
            return (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={`${meta.label}: ${meta.risk}`}
                onClick={() => !submitted && setPendingChoice(c)}
                className="flex items-center justify-center gap-2 rounded-md font-sans text-[13px] transition-colors duration-150"
                style={{
                  padding: '10px 14px',
                  background: colors.bg,
                  border: `1.5px solid ${colors.border}`,
                  color: colors.text,
                  fontWeight: 500,
                  cursor: submitted ? 'default' : 'pointer',
                }}
              >
                <span aria-hidden="true" className="font-bold" style={{ fontSize: 15 }}>
                  {meta.symbol}
                </span>
                {/* Two-line label: action verb on top, risk level below.
                    Risk subtitle uses mono uppercase + 0.1em tracking so it
                    reads as a category tag rather than a second word in
                    the action label. */}
                <span className="flex flex-col items-start" style={{ lineHeight: 1.15 }}>
                  <span style={{ fontWeight: isSelected ? 600 : 500 }}>{meta.label}</span>
                  <span
                    aria-hidden="true"
                    className="font-mono font-bold uppercase"
                    style={{
                      fontSize: 9.5,
                      letterSpacing: '0.1em',
                      color: colors.text,
                      opacity: isSelected ? 0.85 : 0.7,
                      marginTop: 2,
                    }}
                  >
                    {meta.risk}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {!submitted && (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onSubmit}
            disabled={!pendingChoice || !unlocked}
            aria-disabled={!pendingChoice || !unlocked}
            className="rounded-md bg-action px-5 py-2.5 font-sans text-[12.5px] font-semibold text-[rgb(var(--white))] hover:bg-action-hover disabled:cursor-not-allowed disabled:bg-ghost disabled:text-muted"
          >
            Submit Classification
          </button>
        </div>
      )}

      {submitted && feedback && (
        <div
          aria-live="polite"
          className="mt-4 rounded-md transition-opacity duration-200"
          style={{
            background: TONE_BG[feedback.tone],
            borderLeft: `3px solid ${TONE_BORDER[feedback.tone]}`,
            padding: '12px 14px',
          }}
        >
          <div className="mb-1 flex flex-wrap items-baseline gap-2">
            <span
              className="font-sans text-body-sm font-semibold"
              style={{ color: TONE_BORDER[feedback.tone] }}
            >
              {feedback.title}
            </span>
            {element.diagnosticPair && (
              <span
                className="rounded-full font-mono text-[10.5px] font-semibold"
                style={{
                  background: 'rgba(94, 112, 128, 0.15)',
                  color: INFO,
                  padding: '2px 8px',
                  letterSpacing: '0.04em',
                }}
              >
                {element.diagnosticPair}
              </span>
            )}
          </div>
          <div className="font-sans text-body-sm leading-relaxed text-body">{feedback.text}</div>
        </div>
      )}

      {/* See-all-responses expander — surfaces the consequence feedback
          for the two classifications the learner didn't pick. Matches
          the KnowledgeCheck (4C spec §5.7) and P8 patterns: chevron +
          label toggle, stacked surface-backed list with tone-colored
          left borders, mono uppercase header, prose feedback. The
          classification the learner selected is marked with a
          "· Your choice" suffix. */}
      {submitted && (
        <div className="mt-4 border-t border-border-light pt-3">
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="inline-flex items-center gap-1.5 font-sans text-[12.5px] font-semibold text-action hover:text-action-hover"
          >
            <Icon name={showAll ? 'chevronDown' : 'chevronRight'} size={14} />
            {showAll ? 'Hide all responses' : 'See all responses'}
          </button>
          {showAll && (
            <ul className="mt-3 space-y-2 list-none p-0">
              {(['include', 'verify', 'flag'] as Classification[]).map((c) => {
                const fb = element.feedback[c];
                const meta = CLASSIFICATION_META[c];
                const isSelected = c === classification;
                return (
                  <li
                    key={`all-${element.id}-${c}`}
                    className="rounded-md"
                    style={{
                      background: 'rgb(var(--surface))',
                      border: '1px solid rgb(var(--border-light))',
                      borderLeft: `3px solid ${TONE_BORDER[fb.tone]}`,
                      padding: '12px 14px',
                    }}
                  >
                    <div
                      className="mb-1 font-mono text-[10px] font-bold uppercase"
                      style={{ letterSpacing: '0.1em', color: TONE_BORDER[fb.tone] }}
                    >
                      {meta.symbol} {meta.label} · {fb.title}
                      {isSelected && (
                        <span
                          className="ml-2 text-tertiary"
                          style={{ letterSpacing: '0.1em' }}
                        >
                          · Your choice
                        </span>
                      )}
                    </div>
                    <div className="font-sans text-body-sm leading-relaxed text-body">
                      {fb.text}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </article>
  );
}

