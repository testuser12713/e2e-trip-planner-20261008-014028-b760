import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useTripStore } from '../store/TripStoreContext';
import { formatDateRange } from '../lib/dates';

function useActiveTripId(): string | undefined {
  const location = useLocation();
  const match = /^\/trips\/([^/]+)/.exec(location.pathname);
  const id = match?.[1];
  if (!id || id === 'new') return undefined;
  return id;
}

function navLinkClass({ isActive }: { isActive: boolean }): string {
  return isActive ? 'app-nav__link app-nav__link--active' : 'app-nav__link';
}

/** Sticky top bar with the product name and the trip navigation. */
export function AppShell() {
  const { trips } = useTripStore();
  const tripId = useActiveTripId();
  const trip = tripId ? trips.find((candidate) => candidate.id === tripId) : undefined;

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__inner container">
          <Link to="/" className="app-header__brand">
            Trip Planner
          </Link>
          <nav className="app-nav" aria-label="Main">
            <NavLink to="/" end className={navLinkClass}>
              Trips
            </NavLink>
            {trip ? (
              <>
                <NavLink to={`/trips/${trip.id}`} end className={navLinkClass}>
                  Itinerary
                </NavLink>
                <NavLink to={`/trips/${trip.id}/budget`} className={navLinkClass}>
                  Budget
                </NavLink>
                <NavLink to={`/trips/${trip.id}/packing`} className={navLinkClass}>
                  Packing
                </NavLink>
              </>
            ) : null}
          </nav>
        </div>
        {trip ? (
          <div className="app-context container">
            <span className="app-context__name">{trip.name}</span>
            <span className="app-context__dates">
              {formatDateRange(trip.startDate, trip.endDate)}
            </span>
          </div>
        ) : null}
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
