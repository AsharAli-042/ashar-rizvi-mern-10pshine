export default function Input({ label, error, className = "", ...props }) {
    return (
      <label className="block">
        {label ? <div className="mb-1 text-sm font-medium">{label}</div> : null}
        <input
          className={`w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500 ${className}`}
          {...props}
        />
        {error ? <div className="mt-1 text-xs text-red-600">{error}</div> : null}
      </label>
    );
  }
  