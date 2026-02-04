import NoteCard from "./NoteCard";
import { FileText, Sparkles } from "lucide-react";

export default function NoteList({ notes, onTogglePin, onToggleFavorite, onDelete }) {
  if (!notes?.length) {
    return (
      <div className="border-[4px] border-dashed border-black bg-[#FFE5B4] p-12 text-center shadow-[6px_6px_0px_0px_#000000]">
        <div className="mx-auto max-w-sm">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center border-[3px] border-black bg-white">
              <FileText className="h-10 w-10 text-black" />
            </div>
          </div>

          {/* Message */}
          <h3 className="text-xl font-bold uppercase text-black">No Notes Yet</h3>
          <p className="mt-3 text-sm font-medium text-black/80">
            Create your first note or use a template to start quickly.
          </p>

          {/* Decorative element */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 text-black" />
            <span className="text-xs font-bold uppercase text-black/70">
              Get Started!
            </span>
            <Sparkles className="h-5 w-5 text-black" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {notes.map((n, index) => (
        <NoteCard
          key={n.id}
          note={n}
          index={index}
          onTogglePin={onTogglePin}
          onToggleFavorite={onToggleFavorite}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}