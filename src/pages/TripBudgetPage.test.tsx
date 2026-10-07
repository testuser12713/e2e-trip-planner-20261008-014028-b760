import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { TripBudgetPage } from './TripBudgetPage';
import { TripStoreProvider } from '../store/TripStoreContext';
import { STORAGE_KEYS, type Activity, type Trip } from '../types';
import { formatEuro } from '../lib/format';

const trip: Trip = {
  id: 'trip-1',
  name: 'Amalfi Coast',
  destination: 'Italy',
  startDate: '2025-05-12',
  endDate: '2025-05-18',
};

const activities: Activity[] = [
  { id: 'a1', tripId: trip.id, title: 'Hotel', date: '2025-05-12', time: '15:00', location: '', cost: 640, category: 'Accommodation' },
  { id: 'a2', tripId: trip.id, title: 'Flight', date: '2025-05-12', time: '08:00', location: '', cost: 270, category: 'Travel' },
  { id: 'a3', tripId: trip.id, title: 'Dinner', date: '2025-05-13', time: '19:00', location: '', cost: 130.5, category: 'Food' },
  { id: 'a4', tripId: trip.id, title: 'Museum', date: '2025-05-14', time: '11:00', location: '', cost: 129, category: 'Activities' },
  { id: 'a5', tripId: trip.id, title: 'Souvenir', date: '2025-05-15', time: '16:00', location: '', cost: 120, category: 'Shopping' },
];

function seedStorage(trips: Trip[], items: Activity[]) {
  window.localStorage.setItem(STORAGE_KEYS.trips, JSON.stringify(trips));
  window.localStorage.setItem(STORAGE_KEYS.activities, JSON.stringify(items));
}

function renderBudget(tripId: string) {
  return render(
    <MemoryRouter initialEntries={[`/trips/${tripId}/budget`]}>
      <TripStoreProvider>
        <Routes>
          <Route path="/trips/:tripId/budget" element={<TripBudgetPage />} />
        </Routes>
      </TripStoreProvider>
    </MemoryRouter>,
  );
}

describe('TripBudgetPage', () => {
  it('shows the trip total and one bar per occurring category', () => {
    seedStorage([trip], activities);
    const { container } = renderBudget(trip.id);

    expect(screen.getByText('Budget')).toBeInTheDocument();
    expect(screen.getByText(formatEuro(1289.5))).toBeInTheDocument();

    const rows = container.querySelectorAll('.budget-bar');
    expect(rows).toHaveLength(5);
    // Descending by sum: Accommodation leads with the full-width bar.
    expect(rows[0].textContent).toContain('Accommodation');
    expect(rows[4].textContent).toContain('Shopping');
    // A category without activities gets no bar.
    expect(screen.queryByText('Other')).toBeNull();
  });

  it('scales every bar to the largest category', () => {
    seedStorage([trip], activities);
    const { container } = renderBudget(trip.id);

    const rows = Array.from(container.querySelectorAll('.budget-bar'));
    const fillWidth = (category: string): string => {
      const row = rows.find((entry) =>
        entry.querySelector('.budget-bar__label')?.textContent === category,
      );
      const fill = row?.querySelector('.budget-bar__fill');
      return (fill as HTMLElement).style.width;
    };

    expect(fillWidth('Accommodation')).toBe('100%');
    expect(fillWidth('Travel')).toBe('42.19%');

    const accommodation = rows[0];
    const fill = accommodation.querySelector('.budget-bar__fill');
    expect(fill).toHaveAttribute('aria-label', `Accommodation: ${formatEuro(640)}`);
  });

  it('renders the shared empty state with an itinerary link when no activity exists', () => {
    seedStorage([trip], []);
    const { container } = renderBudget(trip.id);

    expect(screen.getByText('No costs yet')).toBeInTheDocument();
    expect(container.querySelectorAll('.budget-bar')).toHaveLength(0);

    const link = screen.getByRole('link', { name: /itinerary/i });
    expect(link).toHaveAttribute('href', `/trips/${trip.id}`);
  });
});
