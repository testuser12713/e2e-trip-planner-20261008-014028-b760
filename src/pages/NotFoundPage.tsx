import { Link } from 'react-router-dom';

/**
 * Shown for an unknown route and for a trip id that does not exist.
 * The wording fits both cases, and the link always leads back to the list.
 */
export function NotFoundPage() {
  return (
    <section className="not-found" data-od-id="not-found">
      <p className="not-found__marker" data-od-id="not-found-marker">
        404
      </p>
      <h1 className="not-found__title" data-od-id="not-found-title">
        Page not found
      </h1>
      <p className="not-found__body" data-od-id="not-found-body">
        The page or trip you are looking for does not exist.
      </p>
      <Link
        to="/"
        className="btn btn--secondary"
        data-od-id="back-to-trips"
      >
        Back to trips
      </Link>
    </section>
  );
}
