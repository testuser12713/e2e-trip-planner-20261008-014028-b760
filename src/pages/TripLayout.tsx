import { Outlet, useParams } from 'react-router-dom';
import { useTripStore } from '../store/TripStoreContext';
import { NotFoundPage } from './NotFoundPage';

/** Resolves :tripId from the store and guards the trip's nested routes. */
export function TripLayout() {
  const { tripId } = useParams();
  const { trips } = useTripStore();
  const exists = tripId !== undefined && trips.some((trip) => trip.id === tripId);

  if (!exists) {
    return <NotFoundPage />;
  }

  return <Outlet />;
}
