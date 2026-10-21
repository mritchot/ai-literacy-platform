// "Where to focus next" — turns the constructs a learner missed on the
// post-assessment into review steps: the section that teaches each one
// and the reference card to keep at hand. Persistent gaps (missed on
// both forms) come first, then the rest in program order. The list is
// capped so the panel stays compact on a dense page.

import { Link } from 'react-router-dom';
import { R4_META } from '../../components/reference/R4Trigger';
import { REFERENCE_ITEMS } from '../../components/reference/ReferenceTrigger';
import { Overline } from '../../components/shared/Overline';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { useLearnerProgress } from '../../contexts/LearnerProgressContext';
import { CONSTRUCT_ROUTES, type ConstructRoute, type ReferenceCardId } from '../../data/construct-routing';
import { POST_ASSESSMENT_ITEMS } from '../../data/post-assessment';
import { PRE_ASSESSMENT_ITEMS } from '../../data/pre-assessment';
import { getModule } from '../../data/program';

const MAX_ENTRIES = 3;

interface FocusEntry {
  constructKey: string;
  construct: string;
  persistent: boolean;
  route: ConstructRoute;
}

function referenceCard(id: ReferenceCardId): { title: string; pdfPath: string } {
  return id === 'R4' ? R4_META : REFERENCE_ITEMS[id];
}

function sectionTitle(route: ConstructRoute): string {
  return (
    getModule(route.moduleId)?.sections.find((s) => s.id === route.sectionId)?.title ??
    `Section ${route.sectionId}`
  );
}

export function FocusNextPanel(): JSX.Element {
  const { state } = useLearnerProgress();
  const { track } = useAnalytics();
  const pre = state.assessments?.pre;
  const post = state.assessments?.post;
  const postComplete = Boolean(post?.completedAt);

  const missed: FocusEntry[] = [];
  if (postComplete) {
    for (const item of POST_ASSESSMENT_ITEMS) {
      if (post?.responses[item.id]?.isCorrect) continue;
      const route = CONSTRUCT_ROUTES[item.constructKey];
      if (!route) continue;
      const preItem = PRE_ASSESSMENT_ITEMS.find((p) => p.constructKey === item.constructKey);
      const preResponse = preItem ? pre?.responses[preItem.id] : undefined;
      missed.push({
        constructKey: item.constructKey,
        construct: item.construct,
        persistent: preResponse !== undefined && !preResponse.isCorrect,
        route,
      });
    }
  }
  missed.sort(
    (a, b) =>
      Number(b.persistent) - Number(a.persistent) ||
      a.route.moduleId - b.route.moduleId ||
      a.route.sectionId - b.route.sectionId,
  );
  const shown = missed.slice(0, MAX_ENTRIES);
  const hiddenCount = missed.length - shown.length;

  return (
    <section
      aria-labelledby="focus-next-heading"
      className="px-4 py-[18px] sm:px-6 sm:py-5"
      style={{
        background: 'rgb(var(--white))',
        border: '1px solid rgb(var(--border))',
        borderTop: '3px solid rgb(var(--action))',
      }}
    >
      <Overline className="mb-1" style={{ letterSpacing: '0.1em' }}>
        Where to focus next
      </Overline>
      <h2
        id="focus-next-heading"
        className="m-0 mb-1 font-sans text-h2 font-semibold text-ink"
        style={{ letterSpacing: '-0.005em' }}
      >
        Your review plan
      </h2>

      {!postComplete ? (
        <p className="m-0 font-sans text-body-sm text-secondary">
          Complete the post-assessment to see which topics to review.
        </p>
      ) : shown.length === 0 ? (
        <p className="m-0 font-sans text-body-sm text-secondary">
          You answered every post-assessment scenario as intended. The refresher keeps it that
          way: it brings back the knowledge checks from all four modules, starting with any you
          missed.
        </p>
      ) : (
        <>
          <p className="m-0 mb-4 font-sans text-body-sm text-secondary">
            Built from the post-assessment scenarios you missed. Each one points to the section
            that teaches it and the reference card to keep at hand.
          </p>
          <ol className="m-0 list-none space-y-3 p-0">
            {shown.map((entry) => {
              const { route } = entry;
              const card = referenceCard(route.referenceId);
              return (
                <li
                  key={entry.constructKey}
                  className="px-4 py-3"
                  style={{
                    background: 'rgb(var(--surface))',
                    border: '1px solid rgb(var(--border-light))',
                    minWidth: 0,
                  }}
                >
                  <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-sans text-body-sm font-semibold text-ink">
                      {entry.construct}
                    </span>
                    <span
                      className="font-mono text-[10px] font-bold uppercase"
                      style={{
                        color: entry.persistent ? 'rgb(var(--error))' : 'rgb(var(--caution))',
                        letterSpacing: '0.08em',
                      }}
                    >
                      {entry.persistent ? 'Missed on both assessments' : 'Missed on the post-assessment'}
                    </span>
                  </div>
                  <p className="m-0 mb-2 font-sans text-body-sm text-body" style={{ lineHeight: 1.55 }}>
                    {entry.route.focus}
                  </p>
                  <p className="m-0 font-sans text-body-sm" style={{ lineHeight: 1.6 }}>
                    <Link
                      to={`/module/${route.moduleId}/section/${route.sectionId}`}
                      onClick={() =>
                        track({
                          type: 'focus_next_link_clicked',
                          moduleId: 4,
                          sectionId: 10,
                          payload: {
                            constructKey: entry.constructKey,
                            moduleId: route.moduleId,
                            sectionId: route.sectionId,
                          },
                        })
                      }
                      className="font-medium text-action no-underline hover:underline"
                    >
                      Review Module {route.moduleId}, Section {route.sectionId}: {sectionTitle(route)} →
                    </Link>
                    <br />
                    <a
                      href={card.pdfPath}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        track({
                          type: 'focus_next_reference_opened',
                          moduleId: 4,
                          sectionId: 10,
                          payload: { constructKey: entry.constructKey, referenceId: route.referenceId },
                        })
                      }
                      className="text-secondary no-underline hover:text-ink hover:underline"
                    >
                      Reference card {route.referenceId}: {card.title} (PDF)
                    </a>
                  </p>
                </li>
              );
            })}
          </ol>
          {hiddenCount > 0 && (
            <p className="m-0 mt-3 font-sans text-body-sm text-secondary">
              You missed {hiddenCount} more. The assessment comparison above lists every
              scenario.
            </p>
          )}
        </>
      )}
    </section>
  );
}
