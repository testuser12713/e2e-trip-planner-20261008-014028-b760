import { Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { TripsPage } from './pages/TripsPage';
import { TripFormPage } from './pages/TripFormPage';
import { TripLayout } from './pages/TripLayout';
import { TripDetailPage } from './pages/TripDetailPage';
import { TripBudgetPage } from './pages/TripBudgetPage';
import { TripPackingPage } from './pages/TripPackingPage';
import { NotFoundPage } from './pages/NotFoundPage';

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<TripsPage />} />
        <Route path="/trips/new" element={<TripFormPage />} />
        <Route path="/trips/:tripId" element={<TripLayout />}>
          <Route index element={<TripDetailPage />} />
          <Route path="budget" element={<TripBudgetPage />} />
          <Route path="packing" element={<TripPackingPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
