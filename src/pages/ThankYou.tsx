// ThankYou — standalone creator page outside the module structure.
//
// Two purposes: (1) a brief first-person origin story establishing
// credibility and care; (2) two soft calls to action — a Stripe tip
// link and a blog subscription. Linked from S10 (completion summary)
// and the landing page footer, but also reachable directly at
// `/#/thank-you`. Renders inside `PlatformShell` (so sidebar/top bar
// stay present) but is not listed in the sidebar's module section
// nav — it's a standalone page like the admin dashboard.
//
// Voice note: this page is the only place in the platform written in
// the creator's first person. Everything else uses the instructional
// "you" voice. Keep that distinction intact when editing — the warmth
// here is load-bearing.

import { useEffect, useRef } from 'react';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { renderMarkdownLite } from '../modules/module4/render-markdown-lite';

// The full diligence-statement prose lives in DILIGENCE.md at the repo
// root (rendered on GitHub for public visibility) and is loaded here via
// Vite's `?raw` import so the markdown file is the single source of
// truth — edits to DILIGENCE.md propagate to this page on the next
// build. The leading `# AI Diligence Statement` H1 is stripped before
// rendering since the section provides its own JSX heading.
import DILIGENCE_MARKDOWN from '../../DILIGENCE.md?raw';

// Stripe Payment Link — set this to the live URL once the Stripe
// account is configured. While the constant is empty, the tip section
// is hidden entirely so the page can ship before payment routing exists.
const STRIPE_TIP_URL = '';

// External blog URL — surface for future-course notifications and
// posts on learning design, AI literacy, and adjacent topics.
const BLOG_URL = 'https://ritchot.me/';

// Additional social channels surfaced in the blog card as a small
// "find me elsewhere" line. Treated as quiet secondary links rather
// than buttons — they're discovery affordances, not primary CTAs.
const LINKEDIN_URL = 'https://www.linkedin.com/in/mritchot/';
const X_URL = 'https://x.com/MichaelRitchot';
const GITHUB_URL = 'https://github.com/mritchot';

// Repo URL for the platform itself. Surfaced as a small footer link
// inside the DiligenceStatement card — the diligence statement says
// "here's how I built it," so "here's the source if you want to
// verify" sits in exactly the right context. Not in DILIGENCE.md
// itself (the canonical doc stays narrative-only); rendered in JSX so
// the in-app card can carry the in-app context without bloating the
// markdown source of truth.
const REPO_URL = 'https://github.com/mritchot/ai-literacy-platform';

// Course Hub on the website — the index of AI courses (this one and
// others). Surfaced inside the "What's next" card as a secondary
// affordance below the blog CTA. The link is hidden while this is empty
// (same conditional-render pattern as STRIPE_TIP_URL); now populated, so
// it renders.
const WRITEUP_URL = 'https://ritchot.me/ai-courses/';

// Direct email — surfaced as a personal sign-off before the closing
// line. The framing is intentionally low-stakes ("or just to chat")
// so readers feel invited rather than transactional.
const EMAIL = 'michael@ritchot.me';

// Diligence accent — the page's primary identity color. The tip card
// uses it as a top border, matching the "artifact / takeaway" treatment
// used elsewhere (S10 profile header, milestone block).
const DILIGENCE = '#7A6B80';

export default function ThankYou(): JSX.Element {
  const { track } = useAnalytics();

  // Page-view event fires once per mount (ref-guarded against
  // StrictMode double-invocation in dev).
  const viewedRef = useRef(false);
  useEffect(() => {
    if (viewedRef.current) return;
    viewedRef.current = true;
    track({ type: 'thank_you_page_viewed' });
  }, [track]);

  const onTipClick = () => track({ type: 'tip_link_clicked' });
  const onBlogClick = () => track({ type: 'blog_link_clicked' });
  const onLinkedInClick = () => track({ type: 'linkedin_link_clicked' });
  const onXClick = () => track({ type: 'x_link_clicked' });
  const onWriteupClick = () => track({ type: 'writeup_link_clicked' });
  const onEmailClick = () => track({ type: 'email_link_clicked' });

  const showTipSection = STRIPE_TIP_URL.trim().length > 0;
  const showWriteup = WRITEUP_URL.trim().length > 0;

  return (
    <div className="mx-auto max-w-reading px-4 py-14 sm:px-8 lg:px-16 lg:py-16">
      <OriginStory />

      <NeedsAnalysisBlock />

      {showTipSection && <TipCard onClick={onTipClick} />}

      <BlogCard
        showCourseHub={showWriteup}
        onCourseHubClick={onWriteupClick}
        onBlogClick={onBlogClick}
        onLinkedInClick={onLinkedInClick}
        onXClick={onXClick}
      />

      <EmailInvitation onClick={onEmailClick} />

      <ClosingLine />

      <DiligenceStatement />
    </div>
  );
}

// ─── Diligence statement ──────────────────────────────────────────
//
// Course-level AI diligence statement — the meta-disclosure about
// what AI did and didn't do in building this course. Eats the course's
// own dog food: the course teaches diligence statements as a practice,
// and this is one for the course itself.
//
// Placed at the very bottom of the page, beneath the closing line, so
// the warm first-person content (origin story → CTAs → sign-off) flows
// uninterrupted and the formal disclosure sits as an appendix the
// reader meets only after the personal voice has done its work. Card
// chrome with the DILIGENCE accent border frames it as a discrete
// document rather than continuation of the page's prose.
//
// The `id="diligence-statement"` anchor target is referenced by the
// landing-page footer link; HashRouter currently doesn't auto-scroll
// to in-page anchors, so for now the link drops the reader on the
// page and they scroll to reach the section.

function DiligenceStatement(): JSX.Element {
  // Strip the leading H1 from the markdown — the JSX heading below
  // provides one in the page's typography. The regex matches `# Title`
  // followed by any trailing blank lines.
  const body = DILIGENCE_MARKDOWN.replace(/^#\s+.+\n+/, '');
  return (
    <section
      aria-label="AI Diligence Statement"
      id="diligence-statement"
      className="mt-10 rounded-lg"
      style={{
        background: 'rgb(var(--white))',
        border: '1px solid rgb(var(--border))',
        borderTop: `3px solid ${DILIGENCE}`,
        padding: '24px 26px',
      }}
    >
      <h2
        className="m-0 mb-5 font-sans text-h3 font-semibold text-ink"
        style={{ letterSpacing: '-0.005em' }}
      >
        AI Diligence Statement
      </h2>
      <div className="font-sans text-body text-body" style={{ lineHeight: 1.65 }}>
        {renderMarkdownLite(body)}
      </div>
      {/* Source-code footer — in-app addition that doesn't live in
          DILIGENCE.md. Gives the diligence statement the equivalent
          of an "audit trail" footnote: read the disclosure, then verify
          against the source if you want. Divider + caption-sized link
          to keep the visual weight quiet relative to the statement
          body, and visually echoes the BlogCard's "Find me elsewhere"
          treatment elsewhere on the page. */}
      <div className="mt-6 border-t border-border-light pt-4 font-sans text-caption text-tertiary" style={{ lineHeight: 1.5 }}>
        Source code:{' '}
        <a
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-secondary no-underline hover:text-ink hover:underline"
        >
          github.com/mritchot/ai-literacy-platform
        </a>
      </div>
    </section>
  );
}

// ─── Origin story ─────────────────────────────────────────────────

function OriginStory(): JSX.Element {
  return (
    <div className="space-y-4 font-sans text-body text-body">
      <h1
        className="m-0 font-sans text-h2 font-semibold text-ink"
        style={{ marginBottom: '1.5rem' }}
      >
        {/* Kaomoji from the creator's blog branding ("( ・_・)ノ
            Ritchot's Corner"). The ノ is a waving hand, so it pairs
            naturally with the greeting. Rendered in mono so the
            middle-dot katakana characters fall back to a font that
            handles them cleanly (DM Sans is Latin-only). */}
        <span
          className="font-mono text-secondary"
          style={{ marginRight: '0.4em', fontWeight: 400 }}
          aria-hidden="true"
        >
          ( ・_・)ノ
        </span>
        Glad you're here
      </h1>

      <p className="m-0">
        This course started as part of my M.Ed. in Education Technology and Instructional
        Design, where I designed a curriculum that taught AI through its mechanics
        (tokenization, next-token prediction, context windows), not just its outputs. I was
        teaching high school students at an international school in Macao at the time, though I
        built it with working professionals in mind too — the reasons these tools fail don't
        change much between a teenager's history essay and a manager's quarterly report. None of
        the major labs had published a literacy program yet, and the research on how to teach
        this well barely existed. So I was guessing, partly: what to teach about AI, and how to
        teach it. People were using these tools every day without understanding why they break.
      </p>

      <p className="m-0">
        The version live here is a ground-up rebuild. The field has matured since (there's more
        research now, and the labs have begun to publish their own programs), so this course is
        my read on it: teach the mechanics as the base, ground the practice in transfer research
        and evaluation methodology, and treat learning design and technical implementation as
        one job rather than two. The platform itself, the code you're reading this on, is a
        custom build — every piece of it, from the data visualizations to the verification
        triage exercise to the diligence statement builder, designed and coded as one system. I
        think that integration matters more than any single feature.
      </p>

      <p className="m-0">
        I made this course free because foundational AI literacy shouldn't sit behind a paywall.
        The competencies here (the mechanics behind how LLMs fundamentally work, knowing what to
        delegate, how to specify it, how to evaluate what comes back, and how to document the
        process) are baseline professional skills now. They shouldn't cost money to learn.
      </p>

      <p className="m-0">
        If any of this resonates, now or after you've worked through the course, the options
        below are how to support the work and stay in touch.
      </p>
    </div>
  );
}

// ─── Needs-analysis block ─────────────────────────────────────────
//
// Links to the needs-analysis hub (`/#/needs-analysis`) — the four
// portfolio documents (problem statement, capability gap analysis,
// learner persona, action map) that make the research-and-design case
// behind the course. Sits directly under the origin story as the first
// "go deeper" affordance, framed as a card with the DILIGENCE accent so
// it reads as a discrete artifact set alongside the write-up and tip
// cards below. Internal hash link (no new-tab/rel) since it routes
// within the platform.

function NeedsAnalysisBlock(): JSX.Element {
  return (
    <section
      aria-label="The needs analysis"
      className="mt-10 rounded-lg"
      style={{
        background: 'rgb(var(--white))',
        border: '1px solid rgb(var(--border))',
        borderTop: `3px solid ${DILIGENCE}`,
        padding: '24px 26px',
      }}
    >
      <h2
        className="m-0 mb-3 font-sans text-h3 font-semibold text-ink"
        style={{ letterSpacing: '-0.005em' }}
      >
        The needs analysis
      </h2>
      <p className="m-0 mb-5 font-sans text-body-sm text-body" style={{ lineHeight: 1.6 }}>
        The research-and-design case behind this course: the problem it addresses, the market gap,
        the learner it targets, and the map from each documented gap to the behavior that closes it.
        Four documents, reproduced with their evidence and citations intact.
      </p>
      <a
        href="#/needs-analysis"
        className="inline-flex items-center gap-2 rounded-md font-sans text-[13px] font-semibold text-ink no-underline hover:bg-surface"
        style={{ background: 'transparent', border: '1.5px solid rgb(var(--border))', padding: '9px 18px' }}
      >
        Read the needs analysis →
      </a>
    </section>
  );
}

// ─── Tip card ─────────────────────────────────────────────────────

function TipCard({ onClick }: { onClick: () => void }): JSX.Element {
  return (
    <section
      aria-label="Support this work"
      className="mt-10 rounded-lg"
      style={{
        background: 'rgb(var(--white))',
        border: '1px solid rgb(var(--border))',
        borderTop: `3px solid ${DILIGENCE}`,
        padding: '24px 26px',
      }}
    >
      <h2
        className="m-0 mb-3 font-sans text-h3 font-semibold text-ink"
        style={{ letterSpacing: '-0.005em' }}
      >
        Support this work
      </h2>
      <p
        className="m-0 mb-5 font-sans text-body-sm text-body"
        style={{ lineHeight: 1.6 }}
      >
        This course is free and will stay free. Tips go directly toward the research, hosting, and
        development time behind future courses.
      </p>
      <a
        href={STRIPE_TIP_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className="inline-flex items-center gap-2 rounded-md font-sans text-[13px] font-semibold text-[rgb(var(--white))] no-underline hover:opacity-90"
        style={{
          background: DILIGENCE,
          padding: '10px 18px',
        }}
      >
        Leave a tip
      </a>
      <p
        className="m-0 mt-3 font-sans text-caption text-tertiary"
        style={{ lineHeight: 1.5 }}
      >
        Opens Stripe in a new tab. No account required.
      </p>
    </section>
  );
}

// ─── Blog card ────────────────────────────────────────────────────

function BlogCard({
  showCourseHub,
  onCourseHubClick,
  onBlogClick,
  onLinkedInClick,
  onXClick,
}: {
  showCourseHub: boolean;
  onCourseHubClick: () => void;
  onBlogClick: () => void;
  onLinkedInClick: () => void;
  onXClick: () => void;
}): JSX.Element {
  return (
    <section
      aria-label="Stay connected"
      className="mt-6 rounded-lg"
      style={{
        background: 'rgb(var(--white))',
        // Neutral top border — this card isn't tied to a specific 4D
        // competency, so it uses the standard border color rather than
        // an accent.
        border: '1px solid rgb(var(--border))',
        borderTop: '3px solid rgb(var(--border))',
        padding: '24px 26px',
      }}
    >
      <h2
        className="m-0 mb-3 font-sans text-h3 font-semibold text-ink"
        style={{ letterSpacing: '-0.005em' }}
      >
        What's next
      </h2>
      <p
        className="m-0 mb-5 font-sans text-body-sm text-body"
        style={{ lineHeight: 1.6 }}
      >
        I'm building more courses. The next one is in development — if you want to know when it
        ships, subscribe to my blog. I write about life, learning, research, and technology,
        mostly AI lately. You'll get posts when I have something worth saying, not spam or
        marketing emails.
      </p>
      <a
        href={BLOG_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onBlogClick}
        className="inline-flex items-center gap-2 rounded-md font-sans text-[13px] font-semibold text-ink no-underline hover:bg-surface"
        style={{
          background: 'transparent',
          border: '1.5px solid rgb(var(--border))',
          padding: '9px 18px',
        }}
      >
        Read the blog
      </a>
      <p
        className="m-0 mt-3 font-sans text-caption text-tertiary"
        style={{ lineHeight: 1.5 }}
      >
        Email subscription available on the blog — you'll get notified when new posts go live.
      </p>
      {/* Course hub — secondary affordance under the blog CTA. Same
          outlined-button treatment as "Read the blog"; the two sit as
          peer destinations (subscribe for what's coming / browse what's
          live). Hidden while WRITEUP_URL is empty. */}
      {showCourseHub && (
        <div className="mt-5">
          <a
            href={WRITEUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onCourseHubClick}
            className="inline-flex items-center gap-2 rounded-md font-sans text-[13px] font-semibold text-ink no-underline hover:bg-surface"
            style={{
              background: 'transparent',
              border: '1.5px solid rgb(var(--border))',
              padding: '9px 18px',
            }}
          >
            Explore the course hub →
          </a>
          <p
            className="m-0 mt-3 font-sans text-caption text-tertiary"
            style={{ lineHeight: 1.5 }}
          >
            All my AI courses in one place, on ritchot.me.
          </p>
        </div>
      )}
      {/* Secondary social channels — quiet caption-sized links rather
          than buttons. They share the "stay connected" theme with the
          blog but aren't primary CTAs; the visual weight stays on the
          blog button above. */}
      <div
        className="mt-4 flex flex-wrap items-center gap-2 font-sans text-caption"
        style={{ lineHeight: 1.5 }}
      >
        <span className="text-tertiary">Find me elsewhere:</span>
        <a
          href={LINKEDIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onLinkedInClick}
          className="font-medium text-secondary no-underline hover:text-ink hover:underline"
        >
          LinkedIn
        </a>
        <span aria-hidden="true" className="text-subtle">
          ·
        </span>
        <a
          href={X_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onXClick}
          className="font-medium text-secondary no-underline hover:text-ink hover:underline"
        >
          X
        </a>
        <span aria-hidden="true" className="text-subtle">
          ·
        </span>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-secondary no-underline hover:text-ink hover:underline"
        >
          GitHub
        </a>
      </div>
    </section>
  );
}

// ─── Email invitation ─────────────────────────────────────────────
//
// A personal, low-friction invitation to reach out by email. Sits
// between the help cards and the closing line — close enough to the
// sign-off that it reads as part of the personal voice, not as another
// "stay connected" channel. Deliberately phrased to lower the
// threshold for sending ("or just to chat") since the user explicitly
// wants people to feel comfortable emailing in.

function EmailInvitation({ onClick }: { onClick: () => void }): JSX.Element {
  return (
    <div
      className="mt-10 font-sans text-body-sm text-body"
      style={{ lineHeight: 1.6 }}
    >
      <p className="m-0">
        If you'd like to email me — about the course, what you wish you could learn next, or just
        to chat — I'm at{' '}
        <a
          href={`mailto:${EMAIL}`}
          onClick={onClick}
          className="font-medium text-secondary no-underline hover:text-ink hover:underline"
        >
          {EMAIL}
        </a>
        . I read everything that comes in.
      </p>
    </div>
  );
}

// ─── Closing line ─────────────────────────────────────────────────

function ClosingLine(): JSX.Element {
  return (
    <p
      className="m-0 mt-10 font-sans text-body-sm text-secondary"
      style={{ textAlign: 'center', lineHeight: 1.6 }}
    >
      It meant something to build this. Thanks for being here — whether you've finished the
      course or are still deciding whether to start.
    </p>
  );
}
