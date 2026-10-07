import { Link } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState';
import { TripHeaderActions } from '../features/trips/TripHeaderActions';
import { formatDateRange } from '../lib/dates';
import { useTripStore } from '../store/TripStoreContext';
import type { Trip } from '../types';

function PinIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
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

function TripCard({ trip }: { trip: Trip }) {
  return (
    <article className="trip-card">
      <Link className="trip-card__link" to={`/trips/${trip.id}`}>
        <div className="trip-card__name">{trip.name}</div>
        <div className="trip-card__destination">
          <PinIcon />
          <span>{trip.destination}</span>
        </div>
        <div className="trip-card__dates">
          {formatDateRange(trip.startDate, trip.endDate)}
        </div>
      </Link>
      <div className="trip-card__actions">
        <TripHeaderActions trip={trip} />
      </div>
    </article>
  );
}

/** Start page: every trip as a card, sorted by start date ascending. */
export function TripsPage() {
  const { trips } = useTripStore();

  const sortedTrips = [...trips].sort((a, b) =>
    a.startDate < b.startDate ? -1 : a.startDate > b.startDate ? 1 : 0,
  );

  return (
    <div className="container page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Your trips</h1>
          <p className="page-sub">
            Sorted by start date. Select a trip to open its itinerary.
          </p>
        </div>
        <Link to="/trips/new" className="btn btn--primary btn--responsive">
          New trip
        </Link>
      </div>

      {sortedTrips.length === 0 ? (
        <EmptyState
          title="No trips yet"
          hint="Create your first trip to start planning an itinerary, budget and packing list."
        >
          <Link to="/trips/new" className="btn btn--primary">
            New trip
          </Link>
        </EmptyState>
      ) : (
        <div className="trip-list">
          {sortedTrips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  );
}
