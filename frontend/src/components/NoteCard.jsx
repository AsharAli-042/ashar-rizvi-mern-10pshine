import React from "react";
import { Link } from "react-router-dom";
import { Star, Trash2, Pin, PinOff } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { cn } from "../lib/utils";
import { formatDate } from "../utils/formatDate";

// Bright color palette for note cards - rotates based on index
const NOTE_COLORS = [
  { bg: "#FFF500", shadow: "#FF00FF", border: "#000000" }, // Yellow + Magenta shadow
  { bg: "#00FFFF", shadow: "#FF6B00", border: "#000000" }, // Cyan + Orange shadow
  { bg: "#FF00FF", shadow: "#00FF00", border: "#000000" }, // Magenta + Lime shadow
  { bg: "#FF6B00", shadow: "#00FFFF", border: "#000000" }, // Orange + Cyan shadow
  { bg: "#00FF00", shadow: "#FF00FF", border: "#000000" }, // Lime + Magenta shadow
  { bg: "#FFFFFF", shadow: "#FFF500", border: "#000000" }, // White + Yellow shadow
];

/**
 * Props:
 * - note: note object
 * - onTogglePin(noteId, newIsPinned)
 * - onToggleFavorite(noteId, newIsFavorite)
 * - onDelete(noteId)
 * - index: (optional) for color rotation
 */
export default function NoteCard({ note, onTogglePin, onToggleFavorite, onDelete, index = 0 }) {
  const title = note?.title?.trim() || "Untitled";
  const preview = (note?.content || "").replace(/<[^>]*>/g, "").slice(0, 140);
  const updated = note?.updatedAt ? formatDate(note.updatedAt) : "";

  // Get color based on index
  const colorScheme = NOTE_COLORS[index % NOTE_COLORS.length];

  const handlePin = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof onTogglePin === "function") onTogglePin(note.id, !note.isPinned);
  };

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof onToggleFavorite === "function") onToggleFavorite(note.id, !note.isFavorite);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof onDelete === "function") onDelete(note.id);
  };

  return (
    <Link to={`/notes/${note.id}`} className="block">
      <Card
        className={cn(
          "group transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black focus-visible:ring-offset-4"
        )}
        style={{
          backgroundColor: colorScheme.bg,
          boxShadow: `8px 8px 0px 0px ${colorScheme.shadow}`,
        }}
      >
        <CardContent className="p-6">
          {/* Header with title and date badge */}
          <div className="flex items-start justify-between gap-3 border-b-[3px] border-black pb-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-bold uppercase text-black truncate">
                {title}
              </h3>
            </div>

            {/* Date badge */}
            {updated && (
              <div className="flex-shrink-0 bg-black px-3 py-1 border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">
                <p className="text-xs font-bold uppercase" style={{ color: colorScheme.bg }}>
                  {updated}
                </p>
              </div>
            )}
          </div>

          {/* Preview text */}
          <p className="mt-4 text-sm font-medium text-black line-clamp-3 leading-relaxed">
            {preview || "No content yet. Open to start writing…"}
          </p>

          {/* Footer with badges and actions */}
          <div className="mt-4 flex items-center justify-between gap-3 border-t-[3px] border-black pt-3">
            {/* Badges */}
            <div className="flex items-center gap-2">
              {note?.isFavorite && (
                <span className="inline-flex items-center gap-1 bg-black px-2 py-1 border-[2px] border-black">
                  <Star className="h-3 w-3 fill-[#FFF500] text-[#FFF500]" />
                  <span className="text-xs font-bold uppercase text-[#FFF500]">Fav</span>
                </span>
              )}
              
              {note?.isPinned && (
                <span className="inline-flex items-center gap-1 bg-black px-2 py-1 border-[2px] border-black">
                  <Pin className="h-3 w-3 fill-[#FF6B00] text-[#FF6B00]" />
                  <span className="text-xs font-bold uppercase text-[#FF6B00]">Pinned</span>
                </span>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {/* Pin toggle */}
              <button
                onClick={handlePin}
                aria-label={note.isPinned ? "Unpin note" : "Pin note"}
                className={cn(
                  "flex h-8 w-8 items-center justify-center border-[2px] border-black transition-all",
                  "hover:translate-x-[1px] hover:translate-y-[1px]",
                  "active:translate-x-[2px] active:translate-y-[2px]",
                  "shadow-[2px_2px_0px_0px_#000000] hover:shadow-[1px_1px_0px_0px_#000000] active:shadow-[0px_0px_0px_0px_#000000]",
                  note.isPinned ? "bg-[#FF6B00]" : "bg-white"
                )}
                onMouseDown={(e) => e.preventDefault()}
              >
                {note.isPinned ? (
                  <PinOff className="h-4 w-4 text-white" />
                ) : (
                  <Pin className="h-4 w-4 text-black" />
                )}
              </button>

              {/* Favorite toggle */}
              <button
                onClick={handleFavorite}
                aria-label={note.isFavorite ? "Remove favorite" : "Favorite note"}
                className={cn(
                  "flex h-8 w-8 items-center justify-center border-[2px] border-black transition-all",
                  "hover:translate-x-[1px] hover:translate-y-[1px]",
                  "active:translate-x-[2px] active:translate-y-[2px]",
                  "shadow-[2px_2px_0px_0px_#000000] hover:shadow-[1px_1px_0px_0px_#000000] active:shadow-[0px_0px_0px_0px_#000000]",
                  note.isFavorite ? "bg-[#FFF500]" : "bg-white"
                )}
                onMouseDown={(e) => e.preventDefault()}
              >
                <Star className={cn(
                  "h-4 w-4",
                  note.isFavorite ? "fill-black text-black" : "text-black"
                )} />
              </button>

              {/* Delete */}
              <button
                onClick={handleDelete}
                aria-label="Delete note"
                className={cn(
                  "flex h-8 w-8 items-center justify-center border-[2px] border-black bg-[#FF0000] transition-all",
                  "hover:translate-x-[1px] hover:translate-y-[1px]",
                  "active:translate-x-[2px] active:translate-y-[2px]",
                  "shadow-[2px_2px_0px_0px_#000000] hover:shadow-[1px_1px_0px_0px_#000000] active:shadow-[0px_0px_0px_0px_#000000]"
                )}
                onMouseDown={(e) => e.preventDefault()}
              >
                <Trash2 className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}