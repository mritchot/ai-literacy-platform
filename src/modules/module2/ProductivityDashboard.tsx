// P4: Productivity Distributions Dashboard. Tabbed two-view component
// followed by an action commitment card that sits below both views as a
// fixed destination (4A spec §5.1–5.2).

import { useEffect, useState, type KeyboardEvent } from 'react';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { useLearnerProgress } from '../../contexts/LearnerProgressContext';
import { useChartTokens } from '../../hooks/useChartTokens';
import { ActionCommitment } from './ActionCommitment';
import { ProductivityViewA } from './ProductivityViewA';
import { ProductivityViewB } from './ProductivityViewB';

type TabId = 'occupation' | 'tasks';

interface Tab {
  id: TabId;
  label: string;
  event: string;
}

const TABS: Tab[] = [
  { id: 'occupation', label: 'By Occupation', event: 'p4_view_a_viewed' },
  { id: 'tasks', label: 'Task-Level Examples', event: 'p4_view_b_viewed' },
];

interface OccupationRow {
  occupation: string;
  time_without_ai_hours: number;
  avg_wage_per_hour: number;
  avg_task_cost_usd: number;
  time_savings_pct: number;
}

interface TaskExample {
  occupation: string;
  task: string;
  time_without_ai_hours: number;
  hourly_wage: number;
  task_cost_usd: number;
  time_savings_pct: number;
}

interface ProductivityDashboardProps {
  occupationRows: OccupationRow[];
  taskExamples: TaskExample[];
}

export function ProductivityDashboard({
  occupationRows,
  taskExamples,
}: ProductivityDashboardProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<TabId>('occupation');
  const { track } = useAnalytics();
  const { markTabViewed } = useLearnerProgress();
  const tokens = useChartTokens();

  useEffect(() => {
    const tab = TABS.find((t) => t.id === activeTab);
    if (!tab) return;
    track({ type: tab.event, moduleId: 2, sectionId: 5 });
    markTabViewed(2, 5, activeTab);
  }, [activeTab, track, markTabViewed]);

  // Roving tabindex: activation must move DOM focus with it (see
  // AugAutoDashboard for the failure mode this prevents).
  const activateTab = (tab: (typeof TABS)[number] | undefined) => {
    if (!tab) return;
    setActiveTab(tab.id);
    document.getElementById(`p4-tab-${tab.id}`)?.focus();
  };

  const onTabKeyDown = (e: KeyboardEvent<HTMLButtonElement>, idx: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      activateTab(TABS[(idx + 1) % TABS.length]);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      activateTab(TABS[(idx - 1 + TABS.length) % TABS.length]);
    }
  };

  return (
    <div className="space-y-6">
      <section
        aria-label="Productivity dashboard"
        className="bg-[rgb(var(--white))]"
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
                id={`p4-tab-${tab.id}`}
                aria-selected={active}
                aria-controls={`p4-panel-${tab.id}`}
                tabIndex={active ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={(e) => onTabKeyDown(e, idx)}
                className="font-sans text-[13px] transition-colors duration-[160ms]"
                style={{
                  padding: '14px 22px',
                  background: active ? 'rgb(var(--white))' : 'transparent',
                  color: active ? 'rgb(var(--ink))' : 'rgb(var(--secondary))',
                  fontWeight: active ? 600 : 500,
                  borderBottom: active ? `2px solid ${tokens.secondary}` : '2px solid transparent',
                  marginBottom: '-1px',
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div style={{ padding: '20px 22px' }}>
          {activeTab === 'occupation' && (
            <div role="tabpanel" id="p4-panel-occupation" aria-labelledby="p4-tab-occupation">
              <ProductivityViewA rows={occupationRows} />
            </div>
          )}
          {activeTab === 'tasks' && (
            <div role="tabpanel" id="p4-panel-tasks" aria-labelledby="p4-tab-tasks">
              <ProductivityViewB tasks={taskExamples} />
            </div>
          )}
        </div>
      </section>

      <ActionCommitment />
    </div>
  );
}
