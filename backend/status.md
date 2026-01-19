## What to Change:

* **Frontend integration fixes:** CORS issues, payload shapes, edge cases (empty title/content), status codes expected by UI.
* **Real forgot-password flow:** right now the backend returns the reset token in the response (dev-friendly) but I will email it as that is how it is done in production.
* **Refresh tokens / logout behavior (optional):** we kept logout stateless (client discards token). If later I server-side token invalidation, that’s a backend change.

## What to do:

## What could become a problem:

* **localhost:5000/:** Visiting "/" could become a problem. Solution is to add a root route and remove auto-routes in app.js.