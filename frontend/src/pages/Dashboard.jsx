import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Star, Sun, Sparkles } from "lucide-react";

import { notesApi } from "../api/notes.api";
import { useAuth } from "../auth/useAuth";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import NoteList from "../components/NoteList";
import TemplateModal from "../components/TemplateModal";
import Loading, { SkeletonLoader } from "../components/Loading";

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

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [query, setQuery] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const [searchLoading, setSearchLoading] = useState(false);

  const [templateOpen, setTemplateOpen] = useState(false);

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

  function onSearchClick() {
    performSearch({ q: query, favorites: favoritesOnly });
  }

  async function onToggleFavorites(v) {
    setFavoritesOnly(v);
    await performSearch({ q: query, favorites: v });
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

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="min-h-screen bg-[#FFF500] p-6 pb-24">
      <TemplateModal open={templateOpen} onClose={() => setTemplateOpen(false)} />

      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="border-[4px] border-black bg-white p-6 shadow-[6px_6px_0px_0px_#000000]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center border-[3px] border-black bg-[#FFF500]">
                <Sun className="h-9 w-9 text-black" />
              </div>
              <div>
                <h1 className="text-3xl font-bold uppercase tracking-tight text-black">
                  {getGreeting()}
                  {user?.name && ", " + user.name.split(" ")[0]}!
                </h1>
                <p className="mt-1 text-sm font-medium text-black/70">
                  {notes.length} {notes.length === 1 ? "note" : "notes"} in your workspace
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              <Button onClick={openTemplateModal} variant="secondary">
                <Sparkles className="h-4 w-4" />
                Template
              </Button>
              <Button asChild>
                <Link to="/notes/new">
                  <Plus className="h-4 w-4" />
                  New Note
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg ? (
          <Alert variant="destructive" onDismiss={() => setErrorMsg("")}>
            <AlertTitle>⚠️ Action Failed</AlertTitle>
            <AlertDescription>{errorMsg}</AlertDescription>
          </Alert>
        ) : null}

        {/* Search & Filter Card */}
        <Card className="border-[4px] border-black bg-white shadow-[6px_6px_0px_0px_#FF00FF]">
          <CardHeader className="border-b-[3px] border-black">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center border-[3px] border-black bg-[#00FFFF]">
                <Search className="h-5 w-5 text-black" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold uppercase">Search & Filter</CardTitle>
                <CardDescription className="text-sm font-medium text-black/70">
                  Find your notes quickly
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="flex flex-col gap-3 sm:flex-row">
              {/* Search input */}
              <div className="flex-1">
                <Input
                  placeholder="Search notes..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onSearchKeyDown}
                />
              </div>

              {/* Favorites checkbox */}
              <label className="flex items-center gap-3 border-[3px] border-black bg-white px-4 py-3 cursor-pointer hover:bg-[#FFD6E8] transition-colors">
                <input
                  type="checkbox"
                  checked={favoritesOnly}
                  onChange={(e) => onToggleFavorites(e.target.checked)}
                  className="h-5 w-5 cursor-pointer border-[2px] border-black accent-[#FFF500]"
                />
                <div className="flex items-center gap-2">
                  <Star className={`h-4 w-4 ${favoritesOnly ? 'fill-[#FFF500] text-[#FFF500]' : 'text-black'}`} />
                  <span className="text-sm font-bold uppercase text-black whitespace-nowrap">
                    Favorites Only
                  </span>
                </div>
              </label>

              {/* Search button */}
              <Button onClick={onSearchClick} disabled={searchLoading} variant="secondary">
                {searchLoading ? "Searching..." : "Search"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notes List */}
        {loading ? (
          <div className="space-y-4">
            <Loading label="Loading your notes..." />
            <SkeletonLoader count={3} />
          </div>
        ) : (
          <div>
            <NoteList
              notes={notes}
              onTogglePin={onTogglePin}
              onToggleFavorite={onToggleFavorite}
              onDelete={onDelete}
            />
          </div>
        )}
      </div>
    </div>
  );
}