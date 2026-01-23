export default function Loading({ label = "Loading..." }) {
    return (
      <div className="flex items-center gap-3 rounded-md border bg-white px-4 py-3">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
        <div className="text-sm text-slate-700">{label}</div>
      </div>
    );
  }
  