const MS_PER_DAY = 24 * 60 * 60 * 1000;

// A hard ceiling so a mistyped year cannot make daysBetween loop forever.
const MAX_RANGE_DAYS = 3660;

function parseISODate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

function toISODate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Every calendar day from startDate to endDate inclusive, ascending.
 * Returns an empty array for malformed input or a range that runs backwards.
 */
export function daysBetween(startDate: string, endDate: string): string[] {
  const start = parseISODate(startDate);
  const end = parseISODate(endDate);
  if (!start || !end || start.getTime() > end.getTime()) return [];

  const days: string[] = [];
  for (
    let cursor = start.getTime();
    cursor <= end.getTime() && days.length < MAX_RANGE_DAYS;
    cursor += MS_PER_DAY
  ) {
    days.push(toISODate(new Date(cursor)));
  }
  return days;
}

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

/** e.g. '2025-05-12' -> 'Mon, 12 May 2025'. */
export function formatDate(value: string): string {
  const parsed = parseISODate(value);
  if (!parsed) return value;
  return dateFormatter.format(parsed);
}

const shortDateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

/** e.g. '2025-05-12' -> '12 May 2025' (no weekday). */
export function formatShortDate(value: string): string {
  const parsed = parseISODate(value);
  if (!parsed) return value;
  return shortDateFormatter.format(parsed);
}

/** e.g. '2025-05-12'..'2025-05-18' -> '12 May 2025 – 18 May 2025'. */
export function formatDateRange(startDate: string, endDate: string): string {
  return `${formatShortDate(startDate)} – ${formatShortDate(endDate)}`;
}
