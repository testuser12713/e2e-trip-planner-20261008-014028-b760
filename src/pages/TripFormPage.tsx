import { TripForm } from '../features/trips/TripForm';

export function TripFormPage() {
  return (
    <div className="container page page--narrow">
      <div>
        <h1 className="page-title">New trip</h1>
        <p className="page-sub">
          Plan a trip with a destination and a date range.
        </p>
      </div>
      <TripForm />
    </div>
  );
}
