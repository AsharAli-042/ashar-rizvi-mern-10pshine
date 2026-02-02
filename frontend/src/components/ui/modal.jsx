import React from "react";
import { cn } from "../../lib/utils";

/**
 * Simple Modal component.
 * Props:
 * - open (bool)
 * - onClose (fn)
 * - title (string)
 * - children
 */
export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* content */}
      <div className={cn("relative z-10 w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl")}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-600">Choose a template to start faster.</p>
          </div>

          <button
            aria-label="Close"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-slate-50"
          >
            ✕
          </button>
        </div>

        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
