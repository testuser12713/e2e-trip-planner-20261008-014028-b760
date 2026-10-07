import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { TripDetailPage } from './TripDetailPage';
import { TripStoreProvider } from '../store/TripStoreContext';
import { formatDate } from '../lib/dates';
import { formatEuro } from '../lib/format';
import { STORAGE_KEYS, type Activity, type Trip } from '../types';

const trip: Trip = {
  id: 'trip-1',
  name: 'Amalfi Coast',
  destination: 'Positano, Italy',
  startDate: '2025-05-12',
  endDate: '2025-05-14',
};

function activity(partial: Partial<Activity> & Pick<Activity, 'id' | 'date'>): Activity {
  return {
    tripId: trip.id,
    title: 'Activity',
    time: '09:00',
    location: '',
    cost: 0,
    category: 'Activities',
    ...partial,
  };
}

function seed(activities: Activity[] = []): void {
  window.localStorage.setItem(STORAGE_KEYS.trips, JSON.stringify([trip]));
  window.localStorage.setItem(STORAGE_KEYS.activities, JSON.stringify(activities));
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={[`/trips/${trip.id}`]}>
      <TripStoreProvider>
        <Routes>
          <Route path="/trips/:tripId" element={<TripDetailPage />} />
        </Routes>
      </TripStoreProvider>
    </MemoryRouter>,
  );
}

function sectionFor(date: string): HTMLElement {
  const heading = screen.getByText(formatDate(date));
  const section = heading.closest('.day-section');
  if (!section) throw new Error(`no day section for ${date}`);
  return section as HTMLElement;
}

function metaFor(date: string): string {
  const meta = sectionFor(date).querySelector('.day-section__meta');
  return meta?.textContent ?? '';
}

describe('TripDetailPage', () => {
  it('renders the page title and the add-activity action', () => {
    seed();
    renderPage();

    expect(screen.getByRole('heading', { name: 'Itinerary' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Add activity' }).length).toBeGreaterThan(0);
  });

  it('renders one section per day of the range, in order and without gaps', () => {
    seed();
    renderPage();

    const headings = screen
      .getAllByRole('heading', { level: 2 })
      .map((heading) => heading.textContent);

    expect(headings).toEqual([
      'Mon, 12 May 2025',
      'Tue, 13 May 2025',
      'Wed, 14 May 2025',
    ]);
  });

  it('shows the empty hint and an add control on every day without activities', () => {
    seed();
    renderPage();

    expect(screen.getAllByText('No activities yet')).toHaveLength(3);
    for (const date of ['2025-05-12', '2025-05-13', '2025-05-14']) {
      expect(
        within(sectionFor(date)).getByRole('button', { name: 'Add activity' }),
      ).toBeInTheDocument();
    }
  });

  it('reports the activity count and the day cost sum from the store', () => {
    seed([
      activity({ id: 'a1', date: '2025-05-12', time: '09:30', cost: 89, title: 'Flight' }),
      activity({ id: 'a2', date: '2025-05-12', time: '14:30', cost: 640, title: 'Check in' }),
      activity({ id: 'a3', date: '2025-05-13', time: '10:00', cost: 34, title: 'Tour' }),
    ]);
    renderPage();

    expect(metaFor('2025-05-12')).toBe(`2 activities · ${formatEuro(729)}`);
    expect(metaFor('2025-05-13')).toBe(`1 activity · ${formatEuro(34)}`);
    expect(metaFor('2025-05-14')).toBe(`0 activities · ${formatEuro(0)}`);
  });

  it('ignores activities that belong to another trip', () => {
    seed([
      activity({ id: 'a1', date: '2025-05-12', cost: 89 }),
      activity({ id: 'a2', date: '2025-05-12', cost: 500, tripId: 'other-trip' }),
    ]);
    renderPage();

    expect(metaFor('2025-05-12')).toBe(`1 activity · ${formatEuro(89)}`);
  });
});
