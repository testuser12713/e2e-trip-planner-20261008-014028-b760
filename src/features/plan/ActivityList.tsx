import { useMemo, useState } from 'react';
import { useTripStore } from '../../store/TripStoreContext';
import type { Activity } from '../../types';
import { formatEuro } from '../../lib/format';
import { ActivityForm } from './ActivityForm';

export interface ActivityListProps {
  tripId: string;
  date: string;
}

/** Open form mode: undefined activity means "create", otherwise "edit". */
type FormState = { activity?: Activity } | null;

/**
 * Sorts activities by their 'HH:mm' time ascending. `sort` is stable, and the
 * original index is used as an explicit tie-breaker so identical times keep
 * their insertion order.
 */
function sortByTime(activities: Activity[]): Activity[] {
  return activities
    .map((activity, index) => ({ activity, index }))
    .sort((a, b) => {
      if (a.activity.time < b.activity.time) return -1;
      if (a.activity.time > b.activity.time) return 1;
      return a.index - b.index;
    })
    .map(({ activity }) => activity);
}

function PinIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 8.6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M8 14.5S12.5 11 12.5 7a4.5 4.5 0 1 0-9 0c0 4 4.5 7.5 4.5 7.5z"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
      />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12.5 3.5l2 2L6 14H4v-2l8.5-8.5z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M11 5l2 2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 5h12M8 5V3.5h2V5M5.5 5l.7 9h5.6l.7-9"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * The activity rows of a single day plus the inline create/edit form. Owns the
 * 'Add activity' trigger and collapses back to it once the form closes.
 */
export function ActivityList({ tripId, date }: ActivityListProps) {
  const { activities, deleteActivity } = useTripStore();
  const [form, setForm] = useState<FormState>(null);

  const dayActivities = useMemo(
    () =>
      sortByTime(
        activities.filter(
          (activity) => activity.tripId === tripId && activity.date === date,
        ),
      ),
    [activities, tripId, date],
  );

  return (
    <div className="activity-list">
      {dayActivities.map((activity) => (
        <div key={activity.id} className="activity-row">
          <span className="activity-row__time">{activity.time}</span>
          <span className="activity-row__main">
            <span className="activity-row__title">{activity.title}</span>
            {activity.location ? (
              <span className="activity-row__location">
                <PinIcon />
                <span>{activity.location}</span>
              </span>
            ) : null}
          </span>
          <span className="activity-row__cost">{formatEuro(activity.cost)}</span>
          <span className="badge">{activity.category}</span>
          <span className="activity-row__actions">
            <button
              type="button"
              className="btn btn--ghost btn--icon"
              aria-label="Edit activity"
              onClick={() => setForm({ activity })}
            >
              <EditIcon />
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--danger-ghost btn--icon"
              aria-label="Delete activity"
              onClick={() => deleteActivity(activity.id)}
            >
              <TrashIcon />
            </button>
          </span>
        </div>
      ))}

      {form ? (
        <ActivityForm
          tripId={tripId}
          date={date}
          activity={form.activity}
          onClose={() => setForm(null)}
        />
      ) : (
        <div className="activity-list__add">
          <button
            type="button"
            className="btn btn--secondary btn--responsive"
            onClick={() => setForm({})}
          >
            Add activity
          </button>
        </div>
      )}
    </div>
  );
}
