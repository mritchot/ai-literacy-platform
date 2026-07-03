// P3: Augmentation vs. Automation Dashboard. Tabbed three-view component
// with view-tracking analytics (4A spec §4.1–4.2). View tabs use distinct
// accent colors to signal narrative phase: neutral (context), Delegation
// olive (patterns), Discernment blue-gray (self-report confrontation).

import { useEffect, useState, type KeyboardEvent } from 'react';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { useLearnerProgress } from '../../contexts/LearnerProgressContext';
import { TOKEN_HEX } from '../../utils/chart-config';
import { useChartTokens } from '../../hooks/useChartTokens';
import { AugAutoViewA } from './AugAutoViewA';
import { AugAutoViewB } from './AugAutoViewB';
import { AugAutoViewC } from './AugAutoViewC';

type TabId = 'adoption' | 'patterns' | 'self-report';

interface Tab {
  id: TabId;
  label: string;
  event: string;
}

const TABS: Tab[] = [
  { id: 'adoption', label: 'Adoption by Occupation', event: 'p3_view_a_viewed' },
  { id: 'patterns', label: 'Collaboration Patterns', event: 'p3_view_b_viewed' },
  { id: 'self-report', label: 'Self-Report vs. Behavioral Data', event: 'p3_view_c_viewed' },
];

interface OccupationCategory {
  occupation: string;
  claude_pct: number;
  us_workforce_pct: number;
  overrepresentation_ratio: number;
}

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

interface AugAutoDashboardProps {
  occupationCategories: OccupationCategory[];
  occupationDepthInsight: string;
  collaborationCategories: CollaborationCategory[];
  jobZones: JobZone[];
  jobZoneInsight: string;
  selfReportAug: number;
  selfReportAuto: number;
  v1Aug: number;
  v1Auto: number;
  latestAug: number;
  latestAuto: number;
}

export function AugAutoDashboard(props: AugAutoDashboardProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<TabId>('adoption');
  const { track } = useAnalytics();
  const { markTabViewed } = useLearnerProgress();
  const tokens = useChartTokens();

  // Active-tab underline accents. The neutral View A underline flips
  // with the theme; the Delegation/Discernment underlines stay on the
  // static 4D brand hexes — mid-tones that read on both canvases (same
  // convention as CompetencyDot and the reference-item accents).
  const tabAccent: Record<TabId, string> = {
    adoption: tokens.secondary,
    patterns: TOKEN_HEX.delegation,
    'self-report': TOKEN_HEX.discernment,
  };

  // Fire view-tracking event whenever a tab becomes active.
  useEffect(() => {
    const tab = TABS.find((t) => t.id === activeTab);
    if (!tab) return;
    track({ type: tab.event, moduleId: 2, sectionId: 3 });
    markTabViewed(2, 3, activeTab);
  }, [activeTab, track, markTabViewed]);

  // Roving tabindex: activation must move DOM focus with it, or the
  // keydown target stays on the old (now tabIndex=-1) tab and repeated
  // arrows recompute from the same index — stranding keyboard users.
  const activateTab = (tab: (typeof TABS)[number] | undefined) => {
    if (!tab) return;
    setActiveTab(tab.id);
    document.getElementById(`p3-tab-${tab.id}`)?.focus();
  };

  const onTabKeyDown = (e: KeyboardEvent<HTMLButtonElement>, idx: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      activateTab(TABS[(idx + 1) % TABS.length]);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      activateTab(TABS[(idx - 1 + TABS.length) % TABS.length]);
    } else if (e.key === 'Home') {
      e.preventDefault();
      activateTab(TABS[0]);
    } else if (e.key === 'End') {
      e.preventDefault();
      activateTab(TABS[TABS.length - 1]);
    }
  };

  return (
    <section
      aria-label="Augmentation vs. Automation dashboard"
      className="rounded-xl bg-[rgb(var(--white))]"
      style={{ border: '1px solid rgb(var(--border))', overflow: 'hidden' }}
    >
      <div
        role="tablist"
        aria-label="Dashboard views"
        className="flex flex-wrap"
        style={{ borderBottom: '1px solid rgb(var(--border-light))' }}
      >
        {TABS.map((tab, idx) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              type="button"
              id={`p3-tab-${tab.id}`}
              aria-selected={active}
              aria-controls={`p3-panel-${tab.id}`}
              tabIndex={active ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(e) => onTabKeyDown(e, idx)}
              className="flex-1 font-sans text-[13px] transition-colors duration-150"
              style={{
                padding: '14px 18px',
                background: active ? 'rgb(var(--white))' : 'transparent',
                color: active ? 'rgb(var(--ink))' : 'rgb(var(--secondary))',
                fontWeight: active ? 600 : 500,
                borderBottom: active ? `2px solid ${tabAccent[tab.id]}` : '2px solid transparent',
                marginBottom: '-1px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                minWidth: 'fit-content',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div style={{ padding: '20px 22px' }}>
        {activeTab === 'adoption' && (
          <div role="tabpanel" id="p3-panel-adoption" aria-labelledby="p3-tab-adoption">
            <AugAutoViewA
              categories={props.occupationCategories}
              occupationDepthInsight={props.occupationDepthInsight}
            />
          </div>
        )}
        {activeTab === 'patterns' && (
          <div role="tabpanel" id="p3-panel-patterns" aria-labelledby="p3-tab-patterns">
            <AugAutoViewB
              categories={props.collaborationCategories}
              jobZones={props.jobZones}
              jobZoneInsight={props.jobZoneInsight}
            />
          </div>
        )}
        {activeTab === 'self-report' && (
          <div role="tabpanel" id="p3-panel-self-report" aria-labelledby="p3-tab-self-report">
            <AugAutoViewC
              selfReportAug={props.selfReportAug}
              selfReportAuto={props.selfReportAuto}
              v1Aug={props.v1Aug}
              v1Auto={props.v1Auto}
              latestAug={props.latestAug}
              latestAuto={props.latestAuto}
            />
          </div>
        )}
      </div>
    </section>
  );
}
