import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { TripHeaderActions } from './TripHeaderActions';
import { TripStoreProvider, useTripStore } from '../../store/TripStoreContext';
import {
  STORAGE_KEYS,
  type Activity,
  type PackingItem,
  type Trip,
} from '../../types';

const TRIP: Trip = {
  id: 'trip-1',
  name: 'Amalfi Coast',
  destination: 'Positano, Italy',
  startDate: '2025-05-12',
  endDate: '2025-05-14',
};

const ACTIVITY: Activity = {
  id: 'activity-1',
  tripId: TRIP.id,
  title: 'Flight to Naples',
  date: '2025-05-12',
  time: '09:30',
  location: 'Naples',
  cost: 89,
  category: 'Travel',
};

const PACKING: PackingItem = {
  id: 'packing-1',
  tripId: TRIP.id,
  name: 'Passport',
  packed: false,
};

function seed(): void {
  window.localStorage.setItem(STORAGE_KEYS.trips, JSON.stringify([TRIP]));
  window.localStorage.setItem(
    STORAGE_KEYS.activities,
    JSON.stringify([ACTIVITY]),
  );
  window.localStorage.setItem(STORAGE_KEYS.packing, JSON.stringify([PACKING]));
}

function read<T>(key: string): T[] {
  const raw = window.localStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T[]) : [];
}

/** Mirrors the real detail page: the header name and the actions read the store. */
function DetailHarness() {
  const { trips } = useTripStore();
  const trip = trips.find((candidate) => candidate.id === TRIP.id);
  if (!trip) {
    return <p>Detail gone</p>;
  }
  return (
    <div>
      <span data-testid="header-name">{trip.name}</span>
      <TripHeaderActions trip={trip} />
    </div>
  );
}

function renderApp() {
  return render(
    <MemoryRouter initialEntries={[`/trips/${TRIP.id}`]}>
      <TripStoreProvider>
        <Routes>
          <Route path="/" element={<p>Trip list</p>} />
          <Route path="/trips/:tripId" element={<DetailHarness />} />
        </Routes>
      </TripStoreProvider>
    </MemoryRouter>,
  );
}

describe('TripHeaderActions', () => {
  it('renames a trip immediately and keeps the new name over a fresh mount', async () => {
    const user = userEvent.setup();
    seed();
    const first = renderApp();

    expect(screen.getByTestId('header-name')).toHaveTextContent('Amalfi Coast');

    await user.click(screen.getByRole('button', { name: 'Rename' }));
    const input = screen.getByLabelText('Trip name');
    expect(input).toHaveValue('Amalfi Coast');

    await user.clear(input);
    await user.type(input, 'Amalfi 2026');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.getByTestId('header-name')).toHaveTextContent('Amalfi 2026');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(read<Trip>(STORAGE_KEYS.trips)[0].name).toBe('Amalfi 2026');

    first.unmount();
    renderApp();

    expect(screen.getByTestId('header-name')).toHaveTextContent('Amalfi 2026');
  });

  it('rejects an empty name only after the form is submitted', async () => {
    const user = userEvent.setup();
    seed();
    renderApp();

    await user.click(screen.getByRole('button', { name: 'Rename' }));

    // An untouched form is neutral.
    expect(screen.queryByText('Please enter a trip name')).not.toBeInTheDocument();

    const input = screen.getByLabelText('Trip name');
    await user.clear(input);
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.getByText('Please enter a trip name')).toBeInTheDocument();
    expect(screen.getByLabelText('Trip name')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    // The dialog stays open and the trip is unchanged.
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(read<Trip>(STORAGE_KEYS.trips)[0].name).toBe('Amalfi Coast');
  });

  it('asks before deleting, then removes the trip with its activities and packing', async () => {
    const user = userEvent.setup();
    seed();
    renderApp();

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    const dialog = screen.getByRole('alertdialog');
    expect(
      within(dialog).getByText(
        'This deletes the trip and all of its activities and packing items.',
      ),
    ).toBeInTheDocument();

    // Nothing is deleted until the user confirms.
    expect(read<Trip>(STORAGE_KEYS.trips)).toHaveLength(1);
    expect(read<Activity>(STORAGE_KEYS.activities)).toHaveLength(1);
    expect(read<PackingItem>(STORAGE_KEYS.packing)).toHaveLength(1);

    await user.click(
      within(dialog).getByRole('button', { name: 'Delete trip' }),
    );

    expect(screen.getByText('Trip list')).toBeInTheDocument();
    expect(read<Trip>(STORAGE_KEYS.trips)).toHaveLength(0);
    expect(read<Activity>(STORAGE_KEYS.activities)).toHaveLength(0);
    expect(read<PackingItem>(STORAGE_KEYS.packing)).toHaveLength(0);
  });

  it('keeps the trip when the delete confirmation is cancelled', async () => {
    const user = userEvent.setup();
    seed();
    renderApp();

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    const dialog = screen.getByRole('alertdialog');
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(screen.getByTestId('header-name')).toHaveTextContent('Amalfi Coast');
    expect(read<Trip>(STORAGE_KEYS.trips)).toHaveLength(1);
  });
});
