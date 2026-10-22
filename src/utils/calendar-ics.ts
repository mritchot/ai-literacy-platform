// Builds an iCalendar (RFC 5545) file of all-day reminders and hands it
// to the browser as a download. Client-side only: no calendar service
// is contacted, and the learner decides where the file goes.

export interface CalendarReminder {
  /** Local calendar day the reminder falls on. */
  date: Date;
  title: string;
  description: string;
  url: string;
}

const CRLF = '\r\n';
const MAX_LINE_OCTETS = 75;

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function dateValue(d: Date): string {
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}

function utcStamp(d: Date): string {
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

function escapeText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

// RFC 5545 §3.1: lines longer than 75 octets fold onto continuation
// lines that start with a space. Counted in UTF-8 bytes, never splitting
// a character.
function fold(line: string): string {
  const encoder = new TextEncoder();
  const parts: string[] = [];
  let current = '';
  let currentBytes = 0;
  for (const ch of line) {
    const bytes = encoder.encode(ch).length;
    const limit = parts.length === 0 ? MAX_LINE_OCTETS : MAX_LINE_OCTETS - 1;
    if (currentBytes + bytes > limit) {
      parts.push(current);
      current = '';
      currentBytes = 0;
    }
    current += ch;
    currentBytes += bytes;
  }
  parts.push(current);
  return parts.join(`${CRLF} `);
}

export function addDays(base: Date, days: number): Date {
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  d.setDate(d.getDate() + days);
  return d;
}

function uid(index: number, stamp: string): string {
  const random =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return `${stamp}-${index}-${random}@ai-literacy-refresher`;
}

export function buildReminderCalendar(reminders: CalendarReminder[], now: Date = new Date()): string {
  const stamp = utcStamp(now);
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AI Literacy for the Modern Workforce//Refresher reminders//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];
  reminders.forEach((r, i) => {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${uid(i, stamp)}`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${dateValue(r.date)}`,
      `DTEND;VALUE=DATE:${dateValue(addDays(r.date, 1))}`,
      `SUMMARY:${escapeText(r.title)}`,
      `DESCRIPTION:${escapeText(`${r.description}\n\n${r.url}`)}`,
      `URL:${r.url}`,
      'TRANSP:TRANSPARENT',
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      // Relative to the all-day start (local midnight): 9:00 that day.
      'TRIGGER:PT9H',
      `DESCRIPTION:${escapeText(r.title)}`,
      'END:VALARM',
      'END:VEVENT',
    );
  });
  lines.push('END:VCALENDAR');
  return lines.map(fold).join(CRLF) + CRLF;
}

export function downloadCalendarFile(filename: string, ics: string): void {
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const href = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke after the click has been handled; some browsers read the URL
  // asynchronously.
  window.setTimeout(() => URL.revokeObjectURL(href), 1000);
}
