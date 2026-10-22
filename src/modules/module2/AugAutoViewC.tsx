// P3 View C — Self-Report vs. Behavioral Data. Three grouped bar pairs
// (self-report, V1 behavioral, latest behavioral), gap annotations, a
// methodology disclosure, the Reflection 1 recall card, and Reflection 2
// (4A spec §4.5).

import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { useLearnerProgress } from '../../contexts/LearnerProgressContext';
import { ReflectionPrompt } from '../../components/shared/ReflectionPrompt';
import { Icon } from '../../components/shared/Icon';
import {
  AXIS_TICK_STYLE,
  TOOLTIP_ITEM_STYLE,
  TOOLTIP_LABEL_STYLE,
  TOOLTIP_STYLE,
} from '../../utils/chart-config';
import { Citation } from '../../components/shared/Citation';
import { useChartTokens } from '../../hooks/useChartTokens';
import { useViewport } from '../../hooks/useViewport';

interface AugAutoViewCProps {
  selfReportAug: number;
  selfReportAuto: number;
  v1Aug: number;
  v1Auto: number;
  latestAug: number;
  latestAuto: number;
}

interface SeriesRow {
  label: string;
  augmentation: number;
  automation: number;
  fill: string;
}

export function AugAutoViewC({
  selfReportAug,
  selfReportAuto,
  v1Aug,
  v1Auto,
  latestAug,
  latestAuto,
}: AugAutoViewCProps): JSX.Element {
  const { track } = useAnalytics();
  const { getReflection } = useLearnerProgress();
  const [methodOpen, setMethodOpen] = useState(false);
  const viewport = useViewport();
  const isMobile = viewport === 'mobile';
  const tokens = useChartTokens();

  const reflection1Text = getReflection(2, 3, 'p3_reflection_1');

  const data: SeriesRow[] = useMemo(
    () => [
      { label: 'Self-reported', augmentation: selfReportAug, automation: selfReportAuto, fill: tokens.secondary },
      { label: 'Behavioral (Jan 2025)', augmentation: v1Aug, automation: v1Auto, fill: tokens.delegation },
      { label: 'Behavioral (Aug 2025)', augmentation: latestAug, automation: latestAuto, fill: tokens.discernment },
    ],
    [selfReportAug, selfReportAuto, v1Aug, v1Auto, latestAug, latestAuto, tokens],
  );

  const v1Gap = selfReportAug - v1Aug;
  const latestGap = selfReportAug - latestAug;

  const ariaLabel = `Grouped bar chart comparing augmentation and automation rates across three sources. Self-reported: ${selfReportAug}% augmentation, ${selfReportAuto}% automation. Behavioral (Jan 2025): ${v1Aug}% augmentation, ${v1Auto}% automation. Behavioral (Aug 2025): ${latestAug}% augmentation, ${latestAuto}% automation. Self-report vs. Jan 2025 gap: ${v1Gap} percentage points. Self-report vs. Aug 2025 gap: ${latestGap} percentage points.`;

  return (
    <div className="space-y-5">
      <p className="m-0 font-sans text-body-sm text-body">
        Researchers asked 1,000 general-workforce professionals how they use AI, then compared the answers against
        behavioral data from millions of conversations. The gap is consistent and directional:
        professionals overestimate their augmentative use. Two behavioral baselines using
        different datasets and time periods both show the same pattern, but the magnitude differs.
      </p>

      <div aria-label={ariaLabel}>
        {isMobile ? (
          // Mobile: the desktop grouped bar (3 sources × 2 measures =
          // 6 bars in ~358 px) forced each bar to ~32 px wide with
          // category labels truncated under the X axis. Each source
          // now renders as a card with both percentages stacked as
          // full-width bars — easier to compare aug vs auto within a
          // source and easier to compare augmentation across sources
          // (the chart's primary insight: self-reported is the
          // outlier, behavioral baselines agree directionally).
          <MobileSelfReportList rows={data} />
        ) : (
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={data} margin={{ top: 16, right: 24, bottom: 8, left: 24 }} barCategoryGap="22%">
                <CartesianGrid stroke="rgb(var(--border-light))" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={AXIS_TICK_STYLE}
                  axisLine={{ stroke: 'rgb(var(--border-light))' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 80]}
                  tickFormatter={(v) => `${v}%`}
                  tick={AXIS_TICK_STYLE}
                  stroke="rgb(var(--border-light))"
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  itemStyle={TOOLTIP_ITEM_STYLE}
                  labelStyle={TOOLTIP_LABEL_STYLE}
                  cursor={{ fill: tokens.cursorFill }}
                  formatter={(value: number, name) => [`${value}%`, name === 'augmentation' ? 'Augmentation' : 'Automation']}
                />
                <Bar dataKey="augmentation" isAnimationActive={false}>
                  {data.map((d, i) => (
                    <Cell key={`aug-${i}`} fill={d.fill} />
                  ))}
                </Bar>
                <Bar dataKey="automation" isAnimationActive={false}>
                  {data.map((d, i) => (
                    <Cell key={`auto-${i}`} fill={d.fill} fillOpacity={0.4} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-1.5 font-mono text-[11px] text-tertiary">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="inline-block" style={{ width: 10, height: 10, background: tokens.secondary }} />
          Self-reported (Anthropic Interviewer, Dec 2025)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="inline-block" style={{ width: 10, height: 10, background: tokens.delegation }} />
          Behavioral (Handa et al., Feb 2025)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="inline-block" style={{ width: 10, height: 10, background: tokens.discernment }} />
          Behavioral (Aug 2025)
        </span>
      </div>

      {/* Gap annotations */}
      <div className="flex flex-wrap gap-3" aria-label="Augmentation gaps between self-report and behavioral data">
        <span
          className="inline-flex items-center gap-2 font-mono text-[11px]"
          style={{ padding: '6px 10px', background: 'rgb(var(--error-light))', color: tokens.error, border: `1px solid ${tokens.error}` }}
        >
          <strong className="font-bold">{v1Gap}pp gap</strong>
          <span>self-report vs. Jan 2025 behavioral</span>
        </span>
        <span
          className="inline-flex items-center gap-2 font-mono text-[11px]"
          style={{ padding: '6px 10px', background: 'rgb(var(--error-light))', color: tokens.error, border: `1px solid ${tokens.error}` }}
        >
          <strong className="font-bold">{latestGap}pp gap</strong>
          <span>self-report vs. Aug 2025 behavioral</span>
        </span>
      </div>

      {/* Methodology note (collapsible) */}
      <section style={{ background: 'rgb(var(--surface))', border: '1px solid rgb(var(--border-light))' }}>
        <button
          type="button"
          onClick={() => {
            const next = !methodOpen;
            setMethodOpen(next);
            if (next) track({ type: 'p3_methodology_expanded', moduleId: 2, sectionId: 3 });
          }}
          aria-expanded={methodOpen}
          className="flex w-full items-center gap-2 font-mono text-[11px] uppercase text-tertiary"
          style={{ padding: '10px 14px', letterSpacing: '0.08em' }}
        >
          <Icon name={methodOpen ? 'chevronDown' : 'chevronRight'} size={12} />
          About these two baselines
        </button>
        {methodOpen && (
          <div className="space-y-2 font-sans text-body-sm text-body" style={{ padding: '0 14px 14px' }}>
            <p className="m-0">
              Both behavioral measurements use the same approach, automated classification of real
              AI conversations, but draw on different datasets and time periods. OpenAI's 2026
              enterprise study takes the same approach, classifying messages automatically with no
              researcher reading individual messages, though it sorts them by task rather than by
              augmentation or automation
              <Citation ids="chatterji-2026" pageKey="automated-classification" />. The Jan 2025 data
              (Handa et al., February 2025) is the standalone published study with full
              methodology. The later figure is the August 2025 wave of the Anthropic Economic
              Index (Appel, McCrory &amp; Tamkin, September 2025), which the Interviewer paper
              cites as its latest analysis.
            </p>
            <p className="m-0">
              The samples also differ, which affects how to read the gap. The self-report figure
              comes from 1,000 working professionals in the general-workforce sample. The behavioral figures
              come from consumer conversations on one platform, where an occupational label does
              not mean the user works in that occupation, novices and professionals count alike,
              and, in the January 2025 sample, about a quarter of conversations were not work-related. The comparison is between
              how professionals describe their use and how a broad user base behaves, not a
              matched sample.
            </p>
            <p className="m-0">
              The directional finding is the same in both: professionals believe they augment more
              than they do. The gap ranges from 8 to 18 percentage points depending on the
              baseline. The August 2025 behavioral figures sum to 96%, with approximately 4% of
              conversations unclassified by the automated analysis. The November 2025 wave moved
              back toward augmentation (52% augmentation, 45% automation).
            </p>
            <p className="m-0">
              One limit runs the other way. The conversation classifier sees only what happens
              inside the chat. Anthropic's own researchers built the Interviewer because their
              usage tool could not show how people used outputs afterward
              <Citation ids="anthropic-interviewer-2025" pageKey="conversation-only-limit" />.
              Verification often happens there: in a survey of 319 knowledge workers, 114 said
              they cross-check AI output against external sources, and 23 said they check that
              cited sources exist
              <Citation ids="lee-2025" pageKey="verification-practices" />. Some of the 8 to 18
              point gap may be oversight the behavioral data cannot observe. The Interviewer
              authors list this as one of five possible explanations, alongside sample
              differences and the use of other AI providers
              <Citation ids="anthropic-interviewer-2025" pageKey="self-vs-behavioral" />. The
              direction holds against both baselines, but the size is uncertain, because the
              self-report describes use as a whole and the classifier sees only the conversation.
            </p>
          </div>
        )}
      </section>

      <p className="m-0 font-mono text-caption text-muted" style={{ letterSpacing: '0.02em' }}>
        Source: Handa et al., Feb 2025, pp. 13–14 (Jan 2025 behavioral); Anthropic Interviewer,
        Dec 2025 (self-report); Appel, McCrory &amp; Tamkin, Sep 2025, Figure 1.2, p. 10, and p. 11 n. 4 (Aug
        2025 behavioral); Appel, Massenkoff &amp; McCrory, Jan 2026, p. 5 (Nov 2025 wave). Classifier model differs slightly across the two behavioral
        measurements.
      </p>

      {/* Reflection 1 recall card */}
      <ReflectionRecallCard text={reflection1Text} />

      <ReflectionPrompt
        moduleId={2}
        sectionId={3}
        promptId="p3_reflection_2"
        engagedEvent="p3_reflection_2_engaged"
        savedEvent="p3_reflection_2_saved"
        promptText="Look back at your answer above. You estimated how many of your recent AI interactions were directive versus collaborative. Now compare that self-assessment against the data: the behavioral evidence shows that professionals typically overestimate their augmentative use by 8 to 18 percentage points. Does the data shift how you'd categorize any of those five interactions? If so, which ones, and what made them feel more collaborative than they were?"
      />
    </div>
  );
}

function ReflectionRecallCard({ text }: { text: string }): JSX.Element {
  const hasContent = text.trim().length > 0;
  return (
    <article
      aria-label="Your earlier reflection response"
      style={{
        background: 'rgb(var(--surface))',
        border: '1px solid rgb(var(--border))',
        padding: '12px 16px',
      }}
    >
      <div className="mb-1 font-sans text-body-sm font-semibold text-ink">Your earlier response</div>
      {hasContent ? (
        <div
          className="whitespace-pre-wrap font-sans text-body-sm text-secondary"
          style={{ lineHeight: 1.55 }}
        >
          {text}
        </div>
      ) : (
        <div className="font-sans text-body-sm italic text-muted">
          You didn't record a response to the earlier reflection. Consider your last five AI
          interactions and which collaboration patterns they fit before continuing.
        </div>
      )}
    </article>
  );
}

// Mobile rendering of the self-report-vs-behavioral grouped bar. Each
// data source (self-reported / behavioral V1 / behavioral V2) gets a
// card with augmentation + automation stacked as full-width bars,
// normalized to the same 80% domain the desktop chart uses so cards
// remain visually comparable. The source's fill color tints the
// augmentation bar; automation uses the same hue at reduced opacity,
// mirroring the desktop chart's cell treatment.
function MobileSelfReportList({ rows }: { rows: SeriesRow[] }): JSX.Element {
  const DOMAIN = 80;
  return (
    <div className="space-y-3">
      {rows.map((row) => {
        const augWidth = (row.augmentation / DOMAIN) * 100;
        const autoWidth = (row.automation / DOMAIN) * 100;
        return (
          <div
            key={row.label}
            style={{
              background: 'rgb(var(--white))',
              border: '1px solid rgb(var(--border))',
              padding: '12px 14px',
            }}
          >
            <div
              className="mb-3 font-sans text-body-sm font-semibold text-ink"
              style={{ lineHeight: 1.35 }}
            >
              {row.label}
            </div>

            <div className="mb-2">
              <div className="mb-1 flex items-baseline justify-between gap-3">
                <span
                  className="font-mono text-[10px] font-semibold uppercase text-tertiary"
                  style={{ letterSpacing: '0.08em' }}
                >
                  Augmentation
                </span>
                <span
                  className="font-mono text-caption font-semibold"
                  style={{ color: row.fill, letterSpacing: '0.02em' }}
                >
                  {row.augmentation}%
                </span>
              </div>
              <div
                className="h-2 w-full overflow-hidden"
                style={{ background: 'rgb(var(--border-light))' }}
              >
                <div
                  className="h-full"
                  style={{ width: `${augWidth}%`, background: row.fill }}
                />
              </div>
            </div>

            <div>
              <div className="mb-1 flex items-baseline justify-between gap-3">
                <span
                  className="font-mono text-[10px] font-semibold uppercase text-tertiary"
                  style={{ letterSpacing: '0.08em' }}
                >
                  Automation
                </span>
                <span
                  className="font-mono text-caption font-semibold text-secondary"
                  style={{ letterSpacing: '0.02em' }}
                >
                  {row.automation}%
                </span>
              </div>
              <div
                className="h-2 w-full overflow-hidden"
                style={{ background: 'rgb(var(--border-light))' }}
              >
                <div
                  className="h-full"
                  style={{ width: `${autoWidth}%`, background: row.fill, opacity: 0.4 }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
