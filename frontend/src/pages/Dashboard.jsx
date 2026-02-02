import { useEffect, /*useRef,*/ useState } from "react";
import { Link, /*useNavigate*/ } from "react-router-dom";
import { Plus } from "lucide-react";

import { notesApi } from "../api/notes.api";
import { useAuth } from "../auth/useAuth";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import NoteList from "../components/NoteList";
import TemplateModal from "../components/TemplateModal";

/* sortNotes helper */
function sortNotes(notes = []) {
  return [...notes].sort((a, b) => {
    const aPinned = a?.isPinned ? 1 : 0;
    const bPinned = b?.isPinned ? 1 : 0;
    if (aPinned !== bPinned) return bPinned - aPinned;

    if (aPinned && bPinned) {
      const aDate = new Date(a?.pinnedAt || a?.updatedAt || a?.createdAt || 0);
      const bDate = new Date(b?.pinnedAt || b?.updatedAt || b?.createdAt || 0);
      return bDate - aDate;
    }

    return new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0);
  });
}

export default function Dashboard() {
  const { user } = useAuth();
  // const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [query, setQuery] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  // eslint-disable-next-line no-unused-vars
  const [searchLoading, setSearchLoading] = useState(false);
  const [hintMsg, setHintMsg] = useState("");

  const [templateOpen, setTemplateOpen] = useState(false);

  // const didMountRef = useRef(false);

  useEffect(() => {
    loadNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadNotes() {
    setErrorMsg("");
    setLoading(true);
    try {
      const data = await notesApi.list();
      setNotes(sortNotes(Array.isArray(data) ? data : []));
    } catch (err) {
      setErrorMsg(err?.message || "Failed to load notes.");
    } finally {
      setLoading(false);
    }
  }

  async function performSearch({ q = "", favorites = false } = {}) {
    setErrorMsg("");
    setSearchLoading(true);
    setHintMsg("");
    try {
      const params = {};
      if (q && q.trim() !== "") params.q = q.trim();
      if (favorites) params.favorites = true;

      const data = await notesApi.list(params);
      setNotes(sortNotes(Array.isArray(data) ? data : []));
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      try {
        const data = await notesApi.search(q || "", favorites || false);
        setNotes(sortNotes(Array.isArray(data) ? data : []));
      } catch (err2) {
        setErrorMsg(err2?.message || "Search failed.");
      }
    } finally {
      setSearchLoading(false);
    }
  }

  function onSearchKeyDown(e) {
    if (e.key === "Enter") {
      performSearch({ q: query, favorites: favoritesOnly });
    }
  }

  async function onToggleFavorites(v) {
    setFavoritesOnly(v);
    setHintMsg("");
    if (!query || query.trim() === "") {
      await performSearch({ q: "", favorites: v });
    } else {
      setHintMsg("Press Enter to apply filters");
    }
  }

  // pin optimistic update
  async function onTogglePin(id, newIsPinned) {
    setErrorMsg("");
    const prev = notes;
    const optimistic = notes.map((n) =>
      n.id === id ? { ...n, isPinned: newIsPinned, pinnedAt: newIsPinned ? new Date().toISOString() : null } : n
    );
    setNotes(sortNotes(optimistic));

    try {
      const updated = await notesApi.pinNote(id, newIsPinned);
      setNotes((prevNotes) => sortNotes(prevNotes.map((n) => (n.id === id ? updated : n))));
    } catch (err) {
      setNotes(sortNotes(prev));
      setErrorMsg(err?.message || "Pin action failed.");
    }
  }

  // favorite optimistic update using update endpoint
  async function onToggleFavorite(id, newIsFavorite) {
    setErrorMsg("");
    const prev = notes;
    const optimistic = notes.map((n) => (n.id === id ? { ...n, isFavorite: newIsFavorite } : n));
    setNotes(sortNotes(optimistic));

    try {
      const updated = await notesApi.update(id, { isFavorite: newIsFavorite });
      setNotes((prevNotes) => sortNotes(prevNotes.map((n) => (n.id === id ? updated : n))));
    } catch (err) {
      setNotes(sortNotes(prev));
      setErrorMsg(err?.message || "Favorite action failed.");
    }
  }

  // delete with a simple confirm and optimistic removal
  async function onDelete(id) {
    setErrorMsg("");
    const confirmed = window.confirm("Are you sure you want to delete this note? This action cannot be undone.");
    if (!confirmed) return;

    const prev = notes;
    setNotes((prevNotes) => prevNotes.filter((n) => n.id !== id));

    try {
      await notesApi.remove(id);
      // success: already removed from UI
    } catch (err) {
      setNotes(prev);
      setErrorMsg(err?.message || "Delete failed.");
    }
  }

  function openTemplateModal() {
    setTemplateOpen(true);
  }

  return (
    <div className="space-y-6">
      <TemplateModal open={templateOpen} onClose={() => setTemplateOpen(false)} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">{user?.name ? `Welcome back, ${user.name}.` : "Your notes, all in one place."}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild>
            <Link to="/notes/new">
              <Plus className="h-4 w-4" />
              New note
            </Link>
          </Button>

          <Button onClick={openTemplateModal}>Template</Button>
        </div>
      </div>

      {errorMsg ? (
        <Alert variant="destructive">
          <AlertTitle>Action failed</AlertTitle>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick actions</CardTitle>
          <CardDescription>Open an editor or create a templated note for common workflows.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <Input
                placeholder={favoritesOnly ? "Search favorites… (press Enter to apply)" : "Search notes… (press Enter to apply)"}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onSearchKeyDown}
              />
              {hintMsg ? <div className="mt-1 text-xs text-slate-500">{hintMsg}</div> : null}
            </div>

            <div className="flex items-center gap-2">
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input aria-label="Favorites only" type="checkbox" checked={favoritesOnly} onChange={(e) => onToggleFavorites(e.target.checked)} />
                Favorites only
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl border border-slate-200 bg-white" />
          ))}
        </div>
      ) : (
        <div>
          <NoteList notes={notes} onTogglePin={onTogglePin} onToggleFavorite={onToggleFavorite} onDelete={onDelete} />
        </div>
      )}
    </div>
  );
}