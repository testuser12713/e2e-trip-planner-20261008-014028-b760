import { Link, useParams } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState';
import { BudgetChart } from '../features/budget/BudgetChart';
import { aggregateBudget } from '../features/budget/aggregate';
import { useTripStore } from '../store/TripStoreContext';

/** Budget of one trip: a hand-built bar per category plus the trip total. */
export function TripBudgetPage() {
  const { tripId } = useParams();
  const { activities } = useTripStore();

  const tripActivities = activities.filter(
    (activity) => activity.tripId === tripId,
  );
  const summary = aggregateBudget(tripActivities);

  return (
    <div className="container page--narrow">
      <div className="page-heading">
        <h1 className="page-title">Budget</h1>
        <p className="page-sub">Cost per category, scaled to the highest one.</p>
      </div>

      <section className="panel" data-od-id="budget-panel">
        {summary.categories.length === 0 ? (
          <EmptyState
            title="No costs yet"
            hint="Add activities to your itinerary to see your budget."
          >
            <Link to={`/trips/${tripId}`} className="btn btn--primary">
              Go to itinerary
            </Link>
          </EmptyState>
        ) : (
          <BudgetChart summary={summary} />
        )}
      </section>
    </div>
  );
}
