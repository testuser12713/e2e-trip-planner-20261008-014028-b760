import { formatDate } from '../../lib/dates';
import { formatEuro } from '../../lib/format';
import { useTripStore } from '../../store/TripStoreContext';
import { ActivityList } from './ActivityList';
import {
  activitiesForDay,
  activityCountLabel,
  dayTotal,
} from './dateRange';

/**
 * Name of the DOM event a day section raises when the user asks to add an
 * activity. The activity dialog (owned by the activity feature) listens for it
 * so every 'Add activity' control opens on the right day. The detail lives in
 * the event payload rather than in a callback prop because both the page-top
 * action and the per-day action share the same trigger while `ActivityList`
 * keeps its agreed `{tripId, date}` signature.
 */
export const ADD_ACTIVITY_EVENT = 'trip-planner:add-activity';

export interface AddActivityEventDetail {
  tripId: string;
  date: string;
}

/** Ask the activity dialog to open for a given trip day. */
export function requestAddActivity(tripId: string, date: string): void {
  window.dispatchEvent(
    new CustomEvent<AddActivityEventDetail>(ADD_ACTIVITY_EVENT, {
      detail: { tripId, date },
    }),
  );
}

export interface DaySectionProps {
  tripId: string;
  date: string;
}

/**
 * One day of the itinerary: the date, the activity count and cost sum, and
 * either the day's activities or the dashed empty box with its own add action.
 */
export function DaySection({ tripId, date }: DaySectionProps) {
  const { activities } = useTripStore();
  const dayActivities = activitiesForDay(activities, tripId, date);
  const meta = `${activityCountLabel(dayActivities.length)} · ${formatEuro(
    dayTotal(dayActivities),
  )}`;

  return (
    <section className="day-section" data-date={date}>
      <div className="day-section__header">
        <h2 className="day-section__date">{formatDate(date)}</h2>
        <span className="day-section__meta">{meta}</span>
      </div>
      {dayActivities.length === 0 ? (
        <div className="day-section__empty">
          <p>No activities yet</p>
          <button
            type="button"
            className="btn btn--secondary btn--responsive"
            onClick={() => requestAddActivity(tripId, date)}
          >
            Add activity
          </button>
        </div>
      ) : (
        <ActivityList tripId={tripId} date={date} />
      )}
    </section>
  );
}
