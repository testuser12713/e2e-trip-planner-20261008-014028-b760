import { daysBetween } from '../../lib/dates';
import type { Activity, Trip } from '../../types';

/**
 * Every calendar day of a trip's range, inclusive and ascending.
 *
 * Delegates to `daysBetween` so the itinerary renders exactly the days the
 * trip stores: a one-day trip yields one entry, a backwards range yields none.
 */
export function tripDays(trip: Trip): string[] {
  return daysBetween(trip.startDate, trip.endDate);
}

/** The activities of one trip that fall on one day, in stored order. */
export function activitiesForDay(
  activities: readonly Activity[],
  tripId: string,
  date: string,
): Activity[] {
  return activities.filter(
    (activity) => activity.tripId === tripId && activity.date === date,
  );
}

/** Sum of a day's activity costs; a non-finite cost counts as zero. */
export function dayTotal(activities: readonly Activity[]): number {
  return activities.reduce(
    (sum, activity) => sum + (Number.isFinite(activity.cost) ? activity.cost : 0),
    0,
  );
}

/** '1 activity' / '2 activities' — the singular/plural label of a day header. */
export function activityCountLabel(count: number): string {
  return `${count} ${count === 1 ? 'activity' : 'activities'}`;
}
