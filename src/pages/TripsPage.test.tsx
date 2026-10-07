import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { App } from '../App';
import { TripStoreProvider } from '../store/TripStoreContext';
import { STORAGE_KEYS } from '../types';

function renderApp(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <TripStoreProvider>
        <App />
      </TripStoreProvider>
    </MemoryRouter>,
  );
}

function fillField(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

function saveTrip() {
  fireEvent.click(screen.getByRole('button', { name: 'Save trip' }));
}

function storedTrips(): unknown[] {
  const raw = window.localStorage.getItem(STORAGE_KEYS.trips);
  return raw ? (JSON.parse(raw) as unknown[]) : [];
}

describe('TripsPage', () => {
  it('shows the empty state with a New trip action when there are no trips', () => {
    renderApp('/');

    expect(screen.getByText('No trips yet')).toBeInTheDocument();
    const newTripLinks = screen.getAllByRole('link', { name: 'New trip' });
    expect(newTripLinks.length).toBeGreaterThan(0);
    expect(newTripLinks[0]).toHaveAttribute('href', '/trips/new');
  });

  it('creates a trip from the New trip form and lists it with name, destination and dates', () => {
    renderApp('/');

    fireEvent.click(screen.getAllByRole('link', { name: 'New trip' })[0]);
    expect(screen.getByRole('heading', { name: 'New trip' })).toBeInTheDocument();

    fillField('Trip name', 'Amalfi Coast');
    fillField('Destination', 'Positano, Italy');
    fillField('Start date', '2025-05-12');
    fillField('End date', '2025-05-18');
    saveTrip();

    // Back on the list with the new card.
    expect(screen.getByRole('heading', { name: 'Your trips' })).toBeInTheDocument();
    expect(screen.getByText('Amalfi Coast')).toBeInTheDocument();
    expect(screen.getByText('Positano, Italy')).toBeInTheDocument();
    expect(screen.getByText('12 May 2025 – 18 May 2025')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Amalfi Coast/ })).toHaveAttribute(
      'href',
      expect.stringContaining('/trips/'),
    );
  });

  it('uses real native date controls for both date fields', () => {
    renderApp('/trips/new');

    expect(screen.getByLabelText('Start date')).toHaveAttribute('type', 'date');
    expect(screen.getByLabelText('End date')).toHaveAttribute('type', 'date');
  });

  it('keeps an untouched form neutral', () => {
    renderApp('/trips/new');

    expect(screen.queryByText('Please enter a trip name')).toBeNull();
    expect(screen.queryByText('Please enter a destination')).toBeNull();
    expect(
      screen.queryByText('The end date must not be before the start date'),
    ).toBeNull();
  });

  it('refuses to save an empty form and shows the errors at their fields', () => {
    renderApp('/trips/new');

    saveTrip();

    expect(screen.getByText('Please enter a trip name')).toBeInTheDocument();
    expect(screen.getByText('Please enter a destination')).toBeInTheDocument();
    // Still on the form, and nothing was persisted.
    expect(screen.getByRole('heading', { name: 'New trip' })).toBeInTheDocument();
    expect(storedTrips()).toHaveLength(0);
    // Focus moves to the first invalid field.
    expect(screen.getByLabelText('Trip name')).toHaveFocus();
  });

  it('rejects an end date that lies before the start date', () => {
    renderApp('/trips/new');

    fillField('Trip name', 'Weekend');
    fillField('Destination', 'Berlin, Germany');
    fillField('Start date', '2025-05-18');
    fillField('End date', '2025-05-12');
    saveTrip();

    expect(
      screen.getByText('The end date must not be before the start date'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('End date')).toHaveFocus();
    expect(storedTrips()).toHaveLength(0);
  });

  it('lists trips sorted by start date ascending', () => {
    window.localStorage.setItem(
      STORAGE_KEYS.trips,
      JSON.stringify([
        {
          id: 'later',
          name: 'Later trip',
          destination: 'Oslo, Norway',
          startDate: '2025-09-01',
          endDate: '2025-09-05',
        },
        {
          id: 'earlier',
          name: 'Earlier trip',
          destination: 'Lisbon, Portugal',
          startDate: '2025-05-01',
          endDate: '2025-05-05',
        },
      ]),
    );

    const { container } = renderApp('/');

    const names = Array.from(
      container.querySelectorAll('.trip-card__name'),
    ).map((node) => node.textContent);
    expect(names).toEqual(['Earlier trip', 'Later trip']);
  });

  it('keeps a created trip after a fresh mount (storage round-trip)', () => {
    const { unmount } = renderApp('/trips/new');

    fillField('Trip name', 'Kyoto');
    fillField('Destination', 'Kyoto, Japan');
    fillField('Start date', '2025-11-02');
    fillField('End date', '2025-11-11');
    saveTrip();

    expect(screen.getByText('Kyoto')).toBeInTheDocument();

    unmount();
    renderApp('/');

    expect(screen.getByText('Kyoto')).toBeInTheDocument();
    expect(screen.getByText('2 Nov 2025 – 11 Nov 2025')).toBeInTheDocument();
  });
});
