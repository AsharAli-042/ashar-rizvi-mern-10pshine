import React from "react";
import { Link } from "react-router-dom";
import { Star, Trash2, Pin, PinOff } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { cn } from "../lib/utils";
import { formatDate } from "../utils/formatDate";

// Bright color palette for note cards - rotates based on index
const NOTE_COLORS = [ 
  { bg: "#00FFFF", shadow: "#FF6B00", border: "#000000" }, // Cyan + Orange shadow
  { bg: "#FF00FF", shadow: "#00FF00", border: "#000000" }, // Magenta + Lime shadow
  { bg: "#FF6B00", shadow: "#00FFFF", border: "#000000" }, // Orange + Cyan shadow
  { bg: "#00FF00", shadow: "#FF00FF", border: "#000000" }, // Lime + Magenta shadow
  { bg: "#FFFFFF", shadow: "#FFF500", border: "#000000" }, // White + Yellow shadow
];

/**
 * Extract formatted preview from HTML content with proper structure
 */
function extractFormattedPreview(htmlContent) {
  if (!htmlContent) return null;
  
  // Create a temporary div to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  
  // Get all elements
  const elements = Array.from(tempDiv.children);
  
  // Limit to first 5 elements or 200 characters total
  const preview = [];
  let totalLength = 0;
  const maxLength = 200;
  const maxElements = 5;
  
  for (let i = 0; i < elements.length && i < maxElements && totalLength < maxLength; i++) {
    const el = elements[i];
    const tagName = el.tagName.toLowerCase();
    const text = el.textContent?.trim() || '';
    
    if (!text) continue;
    
    // Skip if this would exceed max length
    if (totalLength + text.length > maxLength && preview.length > 0) break;
    
    // Handle different element types
    if (tagName === 'h1' || tagName === 'h2' || tagName === 'h3') {
      preview.push({ type: 'heading', text: text.slice(0, 60) });
      totalLength += text.length;
    } else if (tagName === 'p') {
      preview.push({ type: 'paragraph', text: text.slice(0, 100) });
      totalLength += text.length;
    } else if (tagName === 'ul' || tagName === 'ol') {
      const items = Array.from(el.querySelectorAll('li'))
        .slice(0, 3)
        .map(li => li.textContent?.trim() || '')
        .filter(Boolean);
      if (items.length > 0) {
        preview.push({ type: 'list', items });
        totalLength += items.join('').length;
      }
    } else if (tagName === 'pre' || tagName === 'code') {
      preview.push({ type: 'code', text: '[Code]' });
      totalLength += 6;
    } else if (tagName === 'blockquote') {
      preview.push({ type: 'quote', text: text.slice(0, 80) });
      totalLength += text.length;
    } else {
      // Default paragraph for other elements
      preview.push({ type: 'paragraph', text: text.slice(0, 100) });
      totalLength += text.length;
    }
  }
  
  return preview.length > 0 ? preview : null;
}

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
  
  // Extract formatted preview
  const previewElements = extractFormattedPreview(note?.content);
  
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
          "group transition-all duration-200 h-full",
          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black focus-visible:ring-offset-4"
        )}
        style={{
          backgroundColor: colorScheme.bg,
          boxShadow: `6px 6px 0px 0px ${colorScheme.shadow}`,
        }}
      >
        <CardContent className="p-5 flex flex-col h-full">
          {/* Header with title */}
          <div className="flex items-start justify-between gap-3 border-b-[3px] border-black pb-3">
            <h3 className="text-base font-bold uppercase text-black line-clamp-2 flex-1 leading-tight">
              {title}
            </h3>

            {/* Date badge */}
            {updated && (
              <div className="flex-shrink-0 bg-black px-2 py-1 border-[2px] border-black">
                <p className="text-[10px] font-bold uppercase whitespace-nowrap" style={{ color: colorScheme.bg }}>
                  {updated}
                </p>
              </div>
            )}
          </div>

          {/* Preview with proper formatting */}
          <div className="flex-1 py-4 min-h-[100px] overflow-hidden">
            {previewElements && previewElements.length > 0 ? (
              <div className="space-y-2">
                {previewElements.map((item, idx) => {
                  if (item.type === 'heading') {
                    return (
                      <div key={idx} className="font-bold text-sm text-black leading-tight">
                        {item.text}
                      </div>
                    );
                  } else if (item.type === 'paragraph') {
                    return (
                      <div key={idx} className="text-xs font-medium text-black/90 leading-relaxed">
                        {item.text}
                      </div>
                    );
                  } else if (item.type === 'list') {
                    return (
                      <div key={idx} className="text-xs font-medium text-black/90 space-y-1 pl-3">
                        {item.items.map((listItem, listIdx) => (
                          <div key={listIdx} className="flex gap-2">
                            <span>•</span>
                            <span className="flex-1">{listItem}</span>
                          </div>
                        ))}
                      </div>
                    );
                  } else if (item.type === 'code') {
                    return (
                      <div key={idx} className="inline-block bg-black/10 border-[2px] border-black px-2 py-1">
                        <span className="text-xs font-bold text-black">{item.text}</span>
                      </div>
                    );
                  } else if (item.type === 'quote') {
                    return (
                      <div key={idx} className="border-l-[3px] border-black pl-3 italic text-xs font-medium text-black/80">
                        {item.text}
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            ) : (
              <p className="text-xs font-medium text-black/60 italic">
                No content yet. Click to start writing…
              </p>
            )}
          </div>

          {/* Footer with badges and actions */}
          <div className="flex items-center justify-between gap-3 border-t-[3px] border-black pt-3">
            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {note?.isPinned && (
                <span className="inline-flex items-center gap-1 bg-black px-2 py-1 border-[2px] border-black">
                  <Pin className="h-3 w-3 fill-[#FF6B00] text-[#FF6B00]" />
                  <span className="text-[10px] font-bold uppercase text-[#FF6B00]">Pin</span>
                </span>
              )}
              
              {note?.isFavorite && (
                <span className="inline-flex items-center gap-1 bg-black px-2 py-1 border-[2px] border-black">
                  <Star className="h-3 w-3 fill-[#FFF500] text-[#FFF500]" />
                  <span className="text-[10px] font-bold uppercase text-[#FFF500]">Fav</span>
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
                  "flex h-7 w-7 items-center justify-center border-[2px] border-black transition-all",
                  "hover:translate-x-[1px] hover:translate-y-[1px]",
                  "active:translate-x-[2px] active:translate-y-[2px]",
                  "shadow-[2px_2px_0px_0px_#000000] hover:shadow-[1px_1px_0px_0px_#000000] active:shadow-[0px_0px_0px_0px_#000000]",
                  note.isPinned ? "bg-[#FF6B00]" : "bg-white"
                )}
                onMouseDown={(e) => e.preventDefault()}
              >
                {note.isPinned ? (
                  <PinOff className="h-3.5 w-3.5 text-white" />
                ) : (
                  <Pin className="h-3.5 w-3.5 text-black" />
                )}
              </button>

              {/* Favorite toggle */}
              <button
                onClick={handleFavorite}
                aria-label={note.isFavorite ? "Remove favorite" : "Favorite note"}
                className={cn(
                  "flex h-7 w-7 items-center justify-center border-[2px] border-black transition-all",
                  "hover:translate-x-[1px] hover:translate-y-[1px]",
                  "active:translate-x-[2px] active:translate-y-[2px]",
                  "shadow-[2px_2px_0px_0px_#000000] hover:shadow-[1px_1px_0px_0px_#000000] active:shadow-[0px_0px_0px_0px_#000000]",
                  note.isFavorite ? "bg-[#FFF500]" : "bg-white"
                )}
                onMouseDown={(e) => e.preventDefault()}
              >
                <Star className={cn(
                  "h-3.5 w-3.5",
                  note.isFavorite ? "fill-black text-black" : "text-black"
                )} />
              </button>

              {/* Delete */}
              <button
                onClick={handleDelete}
                aria-label="Delete note"
                className={cn(
                  "flex h-7 w-7 items-center justify-center border-[2px] border-black bg-[#FF0000] transition-all",
                  "hover:translate-x-[1px] hover:translate-y-[1px]",
                  "active:translate-x-[2px] active:translate-y-[2px]",
                  "shadow-[2px_2px_0px_0px_#000000] hover:shadow-[1px_1px_0px_0px_#000000] active:shadow-[0px_0px_0px_0px_#000000]"
                )}
                onMouseDown={(e) => e.preventDefault()}
              >
                <Trash2 className="h-3.5 w-3.5 text-white" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}