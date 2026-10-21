// Check-in reminders for after the program: a calendar file with one
// all-day reminder at each milestone interval, each linking to the
// refresher route. Reminder text stays generic, with none of the
// learner's own answers, because calendar entries are often visible to
// colleagues.

import { useState } from 'react';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { MILESTONES } from '../../modules/module4/milestones';
import { addDays, buildReminderCalendar, downloadCalendarFile } from '../../utils/calendar-ics';

interface RefresherRemindersProps {
  /** Where the control sits, for analytics. */
  placement: 'profile' | 'refresher';
}

// Links back to the deployment the learner is using, so a self-hosted
// copy of the program reminds people to open that copy.
function refresherUrl(days: number): string {
  return `${window.location.origin}${window.location.pathname}#/refresher?at=${days}`;
}

export function RefresherReminders({ placement }: RefresherRemindersProps): JSX.Element {
  const { track } = useAnalytics();
  const [downloaded, setDownloaded] = useState(false);
  const intervals = MILESTONES.map((m) => m.days);

  const onDownload = () => {
    const today = new Date();
    const ics = buildReminderCalendar(
      intervals.map((days) => ({
        date: addDays(today, days),
        title: `AI literacy check-in: ${days} days`,
        description: `Your ${days}-day check-in. Open the refresher to answer a few knowledge checks from memory and review your milestone. Bring one specific example from your work: the situation, what you did, and what happened.`,
        url: refresherUrl(days),
      })),
      today,
    );
    downloadCalendarFile('ai-literacy-check-ins.ics', ics);
    setDownloaded(true);
    track({ type: 'refresher_reminders_downloaded', payload: { placement } });
  };

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <button
        type="button"
        onClick={onDownload}
        className="bg-action px-4 py-2.5 font-sans text-[12.5px] font-semibold text-[rgb(var(--white))] transition-colors duration-[160ms] hover:bg-action-hover dark:text-[rgb(var(--canvas))]"
      >
        Add check-in reminders to your calendar
      </button>
      <p className="m-0 min-w-0 flex-1 font-sans text-caption text-tertiary" style={{ minWidth: 200 }}>
        Downloads a calendar file with all-day reminders {intervals.slice(0, -1).join(', ')}, and{' '}
        {intervals[intervals.length - 1]} days from today. Each links to the refresher. Nothing is
        sent from this page.
      </p>
      <span aria-live="polite" className="sr-only">
        {downloaded ? 'Calendar file downloaded.' : ''}
      </span>
    </div>
  );
}
