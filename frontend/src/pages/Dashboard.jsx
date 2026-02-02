// frontend/src/pages/Dashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, RefreshCw } from "lucide-react";

import { notesApi } from "../api/notes.api";
import { useAuth } from "../auth/useAuth";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import NoteList from "../components/NoteList";

/* Sorting helper: pinned first (pinnedAt desc) then createdAt desc */
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
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [quickTitle, setQuickTitle] = useState("");
  const [query, setQuery] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  async function loadNotes() {
    setErrorMsg("");
    setLoading(true);
    try {
      const data = await notesApi.list();
      // note: request(...) returns the data payload already
      setNotes(sortNotes(Array.isArray(data) ? data : []));
    } catch (err) {
      setErrorMsg(err?.message || "Failed to load notes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Search/load when favoritesOnly toggles or query changes (manual submit is optional) */
  async function performSearch() {
    setErrorMsg("");
    setSearchLoading(true);
    try {
      if (favoritesOnly) {
        const data = await notesApi.searchFavoriteNotes(query || "");
        setNotes(sortNotes(Array.isArray(data) ? data : []));
      } else {
        // Optional: backend may support ?q= param; we'll call list() for now
        const data = await notesApi.list({ q: query || "" });
        setNotes(sortNotes(Array.isArray(data) ? data : []));
      }
    } catch (err) {
      setErrorMsg(err?.message || "Search failed.");
    } finally {
      setSearchLoading(false);
    }
  }

  const filteredNotes = useMemo(() => notes, [notes]); // already handled on load/search

  /* Optimistic pin toggling handled here: update local state immediately,
     call API, then merge backend response (or revert on error). */
  async function onTogglePin(id, newIsPinned) {
    setErrorMsg("");

    // optimistic update: set isPinned and pinnedAt
    const previousNotes = notes;
    const optimisticNotes = notes.map((n) =>
      n.id === id ? { ...n, isPinned: newIsPinned, pinnedAt: newIsPinned ? new Date().toISOString() : null } : n
    );
    setNotes(sortNotes(optimisticNotes));

    try {
      const updated = await notesApi.pinNote(id, newIsPinned);
      // merge updated note from backend
      setNotes((prev) => sortNotes(prev.map((n) => (n.id === id ? updated : n))));
    } catch (err) {
      // revert
      setNotes(sortNotes(previousNotes));
      setErrorMsg(err?.message || "Pin action failed.");
    }
  }

  async function quickCreate() {
    setErrorMsg("");
    setCreating(true);
    try {
      const payload = {
        title: quickTitle.trim() ? quickTitle.trim() : null,
        content: "<p></p>",
        isFavorite: false,
      };

      const created = await notesApi.create(payload);

      setNotes((prev) => sortNotes([created, ...prev]));
      setQuickTitle("");
      navigate(`/notes/${created.id}`);
    } catch (err) {
      setErrorMsg(err?.message || "Failed to create note.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">
            {user?.name ? `Welcome back, ${user.name}.` : "Your notes, all in one place."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadNotes} disabled={loading}>
            <RefreshCw className="h-4 w-4" />
            {loading ? "Refreshing..." : "Refresh"}
          </Button>

          <Button asChild>
            <Link to="/notes/new">
              <Plus className="h-4 w-4" />
              New note
            </Link>
          </Button>
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
          <CardDescription>Create a blank note or search favorites.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <Input placeholder="Optional title for quick create…" value={quickTitle} onChange={(e) => setQuickTitle(e.target.value)} />
            </div>
            <Button onClick={quickCreate} disabled={creating}>
              {creating ? "Creating..." : "Quick create"}
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <Input placeholder={favoritesOnly ? "Search favorites…" : "Search notes…"} value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={performSearch} disabled={searchLoading}>
                {searchLoading ? "Searching..." : "Search"}
              </Button>

              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={favoritesOnly} onChange={(e) => setFavoritesOnly(e.target.checked)} />
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
        // Pass onTogglePin to NoteList via NoteCard props
        <div>
          <NoteList notes={filteredNotes} onTogglePin={onTogglePin} />
        </div>
      )}
    </div>
  );
}
