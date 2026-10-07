import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { TripStoreProvider } from '../../store/TripStoreContext';
import { ActivityList } from './ActivityList';

const TRIP_ID = 'trip-1';
const DATE = '2025-05-12';

function renderList() {
  return render(
    <TripStoreProvider>
      <ActivityList tripId={TRIP_ID} date={DATE} />
    </TripStoreProvider>,
  );
}

interface ActivityFields {
  title: string;
  time: string;
  cost?: string;
  location?: string;
  category?: string;
}

async function addActivity(
  user: ReturnType<typeof userEvent.setup>,
  fields: ActivityFields,
) {
  await user.click(screen.getByRole('button', { name: 'Add activity' }));
  await user.type(screen.getByLabelText('Title'), fields.title);
  fireEvent.change(screen.getByLabelText('Time'), {
    target: { value: fields.time },
  });
  if (fields.location) {
    await user.type(screen.getByLabelText('Location'), fields.location);
  }
  if (fields.cost !== undefined) {
    fireEvent.change(screen.getByLabelText('Cost (€)'), {
      target: { value: fields.cost },
    });
  }
  if (fields.category) {
    await user.selectOptions(
      screen.getByLabelText('Category'),
      fields.category,
    );
  }
  await user.click(screen.getByRole('button', { name: 'Save activity' }));
}

function rowTitles(): (string | null)[] {
  return Array.from(document.querySelectorAll('.activity-row__title')).map(
    (node) => node.textContent,
  );
}

describe('ActivityList', () => {
  it('creates an activity that appears in its day', async () => {
    const user = userEvent.setup();
    renderList();

    await addActivity(user, {
      title: 'Flight to Naples',
      time: '09:30',
      cost: '89',
      location: 'Naples airport',
      category: 'Travel',
    });

    expect(screen.getByText('Flight to Naples')).toBeInTheDocument();
    expect(screen.getByText('09:30')).toBeInTheDocument();
    expect(screen.getByText('€89.00')).toBeInTheDocument();
    expect(screen.getByText('Travel')).toBeInTheDocument();
    expect(screen.getByText('Naples airport')).toBeInTheDocument();
    // The form collapsed back to its trigger.
    expect(
      screen.getByRole('button', { name: 'Add activity' }),
    ).toBeInTheDocument();
  });

  it('orders the day by time ascending and keeps insertion order for ties', async () => {
    const user = userEvent.setup();
    renderList();

    await addActivity(user, { title: 'Dinner', time: '19:30', category: 'Food' });
    await addActivity(user, {
      title: 'Museum',
      time: '10:00',
      category: 'Activities',
    });
    await addActivity(user, {
      title: 'Breakfast',
      time: '10:00',
      category: 'Food',
    });

    expect(rowTitles()).toEqual(['Museum', 'Breakfast', 'Dinner']);
  });

  it('edits an activity in place', async () => {
    const user = userEvent.setup();
    renderList();

    await addActivity(user, {
      title: 'Museum',
      time: '10:00',
      cost: '15',
      category: 'Activities',
    });

    await user.click(screen.getByRole('button', { name: 'Edit activity' }));
    const titleInput = screen.getByLabelText('Title');
    expect(titleInput).toHaveValue('Museum');

    await user.clear(titleInput);
    await user.type(titleInput, 'Museum tour');
    fireEvent.change(screen.getByLabelText('Cost (€)'), {
      target: { value: '25' },
    });
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(screen.getByText('Museum tour')).toBeInTheDocument();
    expect(screen.queryByText('Museum')).not.toBeInTheDocument();
    expect(screen.getByText('€25.00')).toBeInTheDocument();
  });

  it('deletes an activity', async () => {
    const user = userEvent.setup();
    renderList();

    await addActivity(user, {
      title: 'Museum',
      time: '10:00',
      category: 'Activities',
    });

    await user.click(screen.getByRole('button', { name: 'Delete activity' }));

    expect(screen.queryByText('Museum')).not.toBeInTheDocument();
    expect(rowTitles()).toEqual([]);
  });

  it('keeps created activities after a fresh mount', async () => {
    const user = userEvent.setup();
    const first = renderList();

    await addActivity(user, {
      title: 'Museum',
      time: '10:00',
      category: 'Activities',
    });
    await addActivity(user, { title: 'Dinner', time: '19:30', category: 'Food' });
    first.unmount();

    renderList();

    expect(screen.getByText('Museum')).toBeInTheDocument();
    expect(screen.getByText('Dinner')).toBeInTheDocument();
    expect(rowTitles()).toEqual(['Museum', 'Dinner']);
  });

  it('keeps an empty form neutral and validates after submitting', async () => {
    const user = userEvent.setup();
    renderList();

    await user.click(screen.getByRole('button', { name: 'Add activity' }));
    expect(screen.queryByText('Please enter a title')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Save activity' }));

    expect(screen.getByText('Please enter a title')).toBeInTheDocument();
    expect(rowTitles()).toEqual([]);
  });

  it('rejects a negative cost', async () => {
    const user = userEvent.setup();
    renderList();

    await user.click(screen.getByRole('button', { name: 'Add activity' }));
    await user.type(screen.getByLabelText('Title'), 'Museum');
    fireEvent.change(screen.getByLabelText('Cost (€)'), {
      target: { value: '-5' },
    });
    await user.click(screen.getByRole('button', { name: 'Save activity' }));

    expect(
      screen.getByText('Please enter a cost of 0 or more'),
    ).toBeInTheDocument();
    expect(rowTitles()).toEqual([]);
  });
});
