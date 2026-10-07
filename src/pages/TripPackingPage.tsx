import { useParams } from 'react-router-dom';
import { PackingList } from '../features/packing/PackingList';

export function TripPackingPage() {
  const { tripId } = useParams<{ tripId: string }>();

  if (!tripId) {
    return null;
  }

  return (
    <div className="container page--narrow">
      <h1 className="page-title">Packing</h1>
      <p className="page-sub">Check off what you have packed.</p>
      <PackingList tripId={tripId} />
    </div>
  );
}
