import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TripStoreProvider } from '../../store/TripStoreContext';
import { ADD_ACTIVITY_EVENT, ActivityList } from './ActivityList';

const TRIP_ID = 'trip-1';
const DATE = '2025-05-12';

function renderList() {
  return render(
    <TripStoreProvider>
      <ActivityList tripId={TRIP_ID} date={DATE} />
    </TripStoreProvider>,
  );
}

function dispatchAddActivity(tripId: string, date: string) {
  act(() => {
    window.dispatchEvent(
      new CustomEvent(ADD_ACTIVITY_EVENT, { detail: { tripId, date } }),
    );
  });
}

describe('ActivityList add-activity handshake', () => {
  it('opens the form when the event matches its own trip and day', () => {
    renderList();
    expect(screen.queryByLabelText('Title')).not.toBeInTheDocument();

    dispatchAddActivity(TRIP_ID, DATE);

    expect(screen.getByLabelText('Title')).toBeInTheDocument();
  });

  it('ignores the event for another day or another trip', () => {
    renderList();

    dispatchAddActivity(TRIP_ID, '2025-05-13');
    dispatchAddActivity('trip-2', DATE);

    expect(screen.queryByLabelText('Title')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Add activity' }),
    ).toBeInTheDocument();
  });
});
