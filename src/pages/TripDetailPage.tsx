import { useParams } from 'react-router-dom';
import { useTripStore } from '../store/TripStoreContext';
import { DaySection, requestAddActivity } from '../features/plan/DaySection';
import { tripDays } from '../features/plan/dateRange';

/** Itinerary page: one section per day of the trip's range. */
export function TripDetailPage() {
  const { tripId } = useParams();
  const { trips } = useTripStore();
  const trip = tripId
    ? trips.find((candidate) => candidate.id === tripId)
    : undefined;

  // TripLayout already guards unknown ids; this keeps the page safe on its own.
  if (!trip) {
    return null;
  }

  const days = tripDays(trip);
  const firstDay = days[0];

  return (
    <div className="container page page--narrow">
      <div className="page-header">
        <h1 style={{ fontSize: 'var(--size-xl)' }}>Itinerary</h1>
        <button
          type="button"
          className="btn btn--secondary btn--responsive"
          disabled={firstDay === undefined}
          onClick={() => {
            if (firstDay !== undefined) {
              requestAddActivity(trip.id, firstDay);
            }
          }}
        >
          Add activity
        </button>
      </div>
      <p
        style={{ color: 'var(--color-muted)', fontSize: 'var(--size-base)' }}
      >
        Every day of your trip, including days without activities.
      </p>
      <div>
        {days.map((date) => (
          <DaySection key={date} tripId={trip.id} date={date} />
        ))}
      </div>
    </div>
  );
}
