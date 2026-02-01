import React from "react";
import { Link } from "react-router-dom";
import { Star, Pin, PinIcon } from "lucide-react"; 
import { Card, CardContent } from "./ui/card";
import { cn } from "../lib/utils";
import { formatDate } from "../utils/formatDate";

function stripHtml(html) {
  if (!html) return "";
  return String(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function NoteCard({ note, onTogglePin }) {
  const title = note?.title?.trim() || "Untitled";
  const preview = stripHtml(note?.content).slice(0, 140);
  const updated = note?.updatedAt ? formatDate(note.updatedAt) : "";

  const handlePinClick = (e) => {
    e.preventDefault();
    if (typeof onTogglePin === "function") {
      onTogglePin(note.id, !note.isPinned);
    }
  };

  return (
    <Link to={`/notes/${note.id}`} className="block">
      <Card
        className={cn(
          "group transition hover:-translate-y-0.5 hover:shadow-md",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
        )}
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-sm font-semibold text-slate-900">{title}</h3>

                {note?.isFavorite ? (
                  <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                    <Star className="mr-1 h-3.5 w-3.5 fill-amber-400 text-amber-600" />
                    Favorite
                  </span>
                ) : null}
              </div>

              {updated ? (
                <p className="mt-1 text-xs text-slate-500">Updated {updated}</p>
              ) : (
                <p className="mt-1 text-xs text-slate-500">—</p>
              )}
            </div>

            {/* Pin button (do not navigate) */}
            <div className="ml-2 flex items-center">
              <button
                onClick={handlePinClick}
                aria-label={note.isPinned ? "Unpin note" : "Pin note"}
                className="rounded-md p-1 text-slate-600 hover:bg-slate-100"
                onMouseDown={(e) => e.preventDefault()} // prevent Link focus/navigation
              >
                {/* simple visuals: filled pin for pinned */}
                {note.isPinned ? (
                  <span className="text-amber-600">📌</span>
                ) : (
                  <span className="text-slate-400">📍</span>
                )}
              </button>
            </div>
          </div>

          <p className="mt-3 line-clamp-3 text-sm text-slate-600">
            {preview || "No content yet. Open to start writing…"}
          </p>

          <div className="mt-4 text-xs text-slate-400">Click to open →</div>
        </CardContent>
      </Card>
    </Link>
  );
}
