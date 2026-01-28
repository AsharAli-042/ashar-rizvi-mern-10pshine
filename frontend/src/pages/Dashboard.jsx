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

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [quickTitle, setQuickTitle] = useState("");
  const [query, setQuery] = useState("");

  async function loadNotes() {
    setErrorMsg("");
    setLoading(true);
    try {
      const data = await notesApi.list();
      setNotes(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorMsg(err?.message || "Failed to load notes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotes();
  }, []);

  const filteredNotes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;

    return notes.filter((n) => {
      const title = (n.title || "").toLowerCase();
      const content = (n.content || "").toLowerCase();
      return title.includes(q) || content.includes(q);
    });
  }, [notes, query]);

  async function quickCreate() {
    setErrorMsg("");
    setCreating(true);
    try {
      const payload = {
        title: quickTitle.trim() ? quickTitle.trim() : null,
        content: "<p></p>", // content is required and must be a string
        isFavorite: false,
      };

      const created = await notesApi.create(payload);

      // update list state immediately
      setNotes((prev) => [created, ...prev]);
      setQuickTitle("");

      // take user to editor instantly
      navigate(`/notes/${created.id}`);
    } catch (err) {
      setErrorMsg(err?.message || "Failed to create note.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Dashboard
          </h1>
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

      {/* Error */}
      {errorMsg ? (
        <Alert variant="destructive">
          <AlertTitle>Action failed</AlertTitle>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      ) : null}

      {/* Quick Create + Search */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick actions</CardTitle>
          <CardDescription>
            Create a blank note instantly, or search your existing notes.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <Input
                placeholder="Optional title for quick create…"
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
              />
            </div>
            <Button onClick={quickCreate} disabled={creating}>
              <Plus className="h-4 w-4" />
              {creating ? "Creating..." : "Quick create"}
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="sm:col-span-3">
              <Input
                placeholder="Search notes by title or content…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes List */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      ) : (
        <NoteList notes={filteredNotes} />
      )}
    </div>
  );
}
