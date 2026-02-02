import NoteCard from "./NoteCard";

export default function NoteList({ notes, onTogglePin }) {
  if (!notes?.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center">
        <div className="mx-auto max-w-sm">
          <h3 className="text-base font-semibold text-slate-900">No notes yet</h3>
          <p className="mt-2 text-sm text-slate-600">Create your first note or use Quick Create.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {notes.map((n) => (
        <NoteCard key={n.id} note={n} onTogglePin={onTogglePin} />
      ))}
    </div>
  );
}
