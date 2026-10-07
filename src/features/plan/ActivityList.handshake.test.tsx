import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { TripStoreProvider } from '../../store/TripStoreContext';
import { ADD_ACTIVITY_EVENT, ActivityList } from './ActivityList';
import { DaySection } from './DaySection';

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

  it('opens the form from an empty day section for that day', async () => {
    const user = userEvent.setup();
    render(
      <TripStoreProvider>
        <DaySection tripId={TRIP_ID} date={DATE} />
      </TripStoreProvider>,
    );

    expect(screen.getByText('No activities yet')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Add activity' }));

    expect(screen.getByLabelText('Title')).toBeInTheDocument();
  });
});
