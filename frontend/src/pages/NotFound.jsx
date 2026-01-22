import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl rounded-lg border bg-white p-6">
      <h1 className="text-xl font-semibold">404</h1>
      <p className="mt-2 text-sm text-slate-600">Page not found.</p>
      <div className="mt-6 text-sm">
        <Link className="underline" to="/dashboard">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
