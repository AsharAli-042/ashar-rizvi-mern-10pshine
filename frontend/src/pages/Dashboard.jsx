import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="rounded-lg border bg-white p-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <Link
          to="/notes/new"
          className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          New Note
        </Link>
      </div>

      <p className="mt-2 text-sm text-slate-600">
        Placeholder — Screen 2 branch will implement GET /notes + quick create.
      </p>
    </div>
  );
}
