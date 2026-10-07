import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { App } from '../App';
import { TripStoreProvider } from '../store/TripStoreContext';

function LocationProbe() {
  const location = useLocation();
  return <span data-testid="location">{location.pathname}</span>;
}

function renderApp(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <TripStoreProvider>
        <App />
        <LocationProbe />
      </TripStoreProvider>
    </MemoryRouter>,
  );
}

describe('NotFoundPage', () => {
  it('renders the not-found view on an unknown route', () => {
    renderApp('/some/unknown/route');

    expect(
      screen.getByRole('heading', { name: 'Page not found' }),
    ).toBeInTheDocument();
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(
      screen.getByText('The page or trip you are looking for does not exist.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Back to trips' }),
    ).toHaveAttribute('href', '/');
  });

  it('renders the not-found view for a non-existent trip id', () => {
    renderApp('/trips/does-not-exist');

    expect(
      screen.getByRole('heading', { name: 'Page not found' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Back to trips' }),
    ).toHaveAttribute('href', '/');
  });

  it('returns to the trip list when the link is clicked', async () => {
    const user = userEvent.setup();
    renderApp('/trips/does-not-exist');

    expect(screen.getByTestId('location').textContent).toBe(
      '/trips/does-not-exist',
    );

    await user.click(screen.getByRole('link', { name: 'Back to trips' }));

    expect(screen.getByTestId('location').textContent).toBe('/');
    expect(
      screen.queryByRole('heading', { name: 'Page not found' }),
    ).not.toBeInTheDocument();
  });
});
