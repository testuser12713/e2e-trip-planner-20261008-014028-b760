import { act, render, renderHook, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import type { ReactNode } from 'react';
import { App } from './App';
import {
  TripStoreProvider,
  useTripStore,
  type TripStore,
} from './store/TripStoreContext';
import { STORAGE_KEYS } from './types';
import { formatEuro } from './lib/format';
import { daysBetween } from './lib/dates';

function renderStore() {
  return renderHook(() => useTripStore(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <TripStoreProvider>{children}</TripStoreProvider>
    ),
  });
}

function renderApp(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <TripStoreProvider>
        <App />
      </TripStoreProvider>
    </MemoryRouter>,
  );
}

const tripFields = {
  name: 'Rome',
  destination: 'Rome, Italy',
  startDate: '2025-05-12',
  endDate: '2025-05-18',
};

function readStored<T>(key: string): T[] {
  const raw = window.localStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T[]) : [];
}

describe('TripStore', () => {
  it('creates a trip and persists it to localStorage', () => {
    const { result } = renderStore();

    let created: TripStore['trips'][number] | undefined;
    act(() => {
      created = result.current.createTrip(tripFields);
    });

    expect(created).toBeDefined();
    expect(created?.id).toBeTruthy();
    expect(result.current.trips).toHaveLength(1);
    expect(result.current.trips[0].name).toBe('Rome');

    const stored = readStored<{ name: string }>(STORAGE_KEYS.trips);
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe('Rome');
  });

  it('reloads persisted trips into a fresh provider', () => {
    const first = renderStore();
    act(() => {
      first.result.current.createTrip(tripFields);
    });
    first.unmount();

    const second = renderStore();
    expect(second.result.current.trips).toHaveLength(1);
    expect(second.result.current.trips[0].destination).toBe('Rome, Italy');
  });

  it('renames a trip and persists the new name', () => {
    const { result } = renderStore();
    let id = '';
    act(() => {
      id = result.current.createTrip(tripFields).id;
    });
    act(() => {
      result.current.renameTrip(id, 'Rome & Naples');
    });

    expect(result.current.trips[0].name).toBe('Rome & Naples');
    expect(readStored<{ name: string }>(STORAGE_KEYS.trips)[0].name).toBe(
      'Rome & Naples',
    );
  });

  it('deletes a trip together with its activities and packing items', () => {
    const { result } = renderStore();
    let tripId = '';
    let otherTripId = '';
    act(() => {
      tripId = result.current.createTrip(tripFields).id;
      otherTripId = result.current.createTrip({
        ...tripFields,
        name: 'Kyoto',
      }).id;
      result.current.addActivity({
        tripId,
        title: 'Colosseum',
        date: '2025-05-13',
        time: '10:00',
        location: 'Rome',
        cost: 18,
        category: 'Activities',
      });
      result.current.addPackingItem(tripId, 'Passport');
      result.current.addActivity({
        tripId: otherTripId,
        title: 'Fushimi Inari',
        date: '2025-05-13',
        time: '08:00',
        location: 'Kyoto',
        cost: 0,
        category: 'Activities',
      });
    });

    expect(result.current.activities).toHaveLength(2);
    expect(result.current.packing).toHaveLength(1);

    act(() => {
      result.current.deleteTrip(tripId);
    });

    expect(result.current.trips).toHaveLength(1);
    expect(result.current.trips[0].id).toBe(otherTripId);
    expect(result.current.activities).toHaveLength(1);
    expect(result.current.activities[0].tripId).toBe(otherTripId);
    expect(result.current.packing).toHaveLength(0);
  });

  it('adds, updates and deletes an activity', () => {
    const { result } = renderStore();
    let tripId = '';
    let activityId = '';
    act(() => {
      tripId = result.current.createTrip(tripFields).id;
      activityId = result.current.addActivity({
        tripId,
        title: 'Colosseum',
        date: '2025-05-13',
        time: '10:00',
        location: 'Rome',
        cost: 18,
        category: 'Activities',
      }).id;
    });

    expect(result.current.activities).toHaveLength(1);
    expect(result.current.activities[0].cost).toBe(18);

    act(() => {
      result.current.updateActivity(activityId, { title: 'Colosseum tour' });
    });
    expect(result.current.activities[0].title).toBe('Colosseum tour');

    act(() => {
      result.current.deleteActivity(activityId);
    });
    expect(result.current.activities).toHaveLength(0);
  });

  it('supports the packing lifecycle and reports the right counts', () => {
    const { result } = renderStore();
    let tripId = '';
    act(() => {
      tripId = result.current.createTrip(tripFields).id;
      result.current.addPackingItem(tripId, 'Passport');
      result.current.addPackingItem(tripId, 'Charger');
    });

    const ids = result.current.packing.map((item) => item.id);
    act(() => {
      result.current.togglePackingItem(ids[0]);
    });

    const packed = result.current.packing.filter((item) => item.packed);
    expect(result.current.packing).toHaveLength(2);
    expect(packed).toHaveLength(1);
    expect(packed[0].name).toBe('Passport');

    act(() => {
      result.current.removePackingItem(ids[1]);
    });
    expect(result.current.packing).toHaveLength(1);
  });

  it('starts empty when localStorage holds corrupt data', () => {
    window.localStorage.setItem(STORAGE_KEYS.trips, '{not valid json');
    const { result } = renderStore();
    expect(result.current.trips).toEqual([]);
  });

  it('loads trips that already exist in localStorage', () => {
    window.localStorage.setItem(
      STORAGE_KEYS.trips,
      JSON.stringify([{ id: 'abc', ...tripFields }]),
    );
    const { result } = renderStore();
    expect(result.current.trips).toHaveLength(1);
    expect(result.current.trips[0].id).toBe('abc');
  });
});

describe('formatEuro', () => {
  it('formats a value as euro with two decimals', () => {
    expect(formatEuro(1234.5)).toMatch(/€\s?1,234\.50/);
  });

  it('renders zero as an amount, never a raw number', () => {
    expect(formatEuro(0)).toMatch(/€\s?0\.00/);
  });
});

describe('daysBetween', () => {
  it('returns every day of the range inclusive and ascending', () => {
    expect(daysBetween('2025-05-12', '2025-05-14')).toEqual([
      '2025-05-12',
      '2025-05-13',
      '2025-05-14',
    ]);
  });

  it('returns a single day for a one-day range', () => {
    expect(daysBetween('2025-05-12', '2025-05-12')).toEqual(['2025-05-12']);
  });

  it('returns an empty list when the end is before the start', () => {
    expect(daysBetween('2025-05-14', '2025-05-12')).toEqual([]);
  });
});

describe('App shell', () => {
  it('renders the header with the title and the Trips link on the list page', () => {
    renderApp('/');

    expect(screen.getByText('Trip Planner')).toBeInTheDocument();
    const tripsLink = screen.getByRole('link', { name: 'Trips' });
    expect(tripsLink).toHaveAttribute('href', '/');
    // The title is not a control on its own page (no link to the current page).
    expect(screen.queryByRole('link', { name: 'Trip Planner' })).toBeNull();
  });

  it('marks the active section in the header on a trip route', () => {
    const tripId = 'trip-under-test';
    window.localStorage.setItem(
      STORAGE_KEYS.trips,
      JSON.stringify([{ id: tripId, ...tripFields }]),
    );

    renderApp(`/trips/${tripId}`);

    const itinerary = screen.getByRole('link', { name: 'Itinerary' });
    expect(itinerary).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('Rome')).toBeInTheDocument();
    // Away from the list the title is a working link back to it.
    expect(screen.getByRole('link', { name: 'Trip Planner' })).toHaveAttribute(
      'href',
      '/',
    );
  });

  it('does not crash on an unknown trip id', () => {
    renderApp('/trips/does-not-exist');

    expect(screen.getByText('Trip Planner')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Budget' })).toBeNull();
  });

  it('does not crash on an unknown route', () => {
    renderApp('/some/unknown/route');

    expect(screen.getByText('Trip Planner')).toBeInTheDocument();
  });
});
