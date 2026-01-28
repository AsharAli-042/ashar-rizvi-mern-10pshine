import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { ArrowLeft, Save, Trash2, Star } from "lucide-react";

import { notesApi } from "../api/notes.api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "../components/ui/alert-dialog";

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["blockquote", "code-block"],
    ["link"],
    ["clean"],
  ],
};

const quillFormats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "blockquote",
  "code-block",
  "link",
];

export default function NoteEditor() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("<p></p>"); // must be string
  const [isFavorite, setIsFavorite] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const pageTitle = useMemo(() => (isEdit ? "Edit note" : "New note"), [isEdit]);

  useEffect(() => {
    let ignore = false;

    async function loadNote() {
      if (!isEdit) return;
      setErrorMsg("");
      setSuccessMsg("");
      setLoading(true);
      try {
        const note = await notesApi.getById(id);
        if (ignore) return;

        setTitle(note?.title || "");
        setContent(typeof note?.content === "string" ? note.content : "<p></p>");
        setIsFavorite(!!note?.isFavorite);
      } catch (err) {
        if (!ignore) setErrorMsg(err?.message || "Failed to load note.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadNote();
    return () => {
      ignore = true;
    };
  }, [id, isEdit]);

  function buildPayload() {
    return {
      title: title.trim() ? title.trim() : null,
      content: typeof content === "string" ? content : String(content ?? ""),
      isFavorite: !!isFavorite,
    };
  }

  async function onSave() {
    setErrorMsg("");
    setSuccessMsg("");
    setSaving(true);

    try {
      const payload = buildPayload();

      // content must be string (backend contract)
      if (!payload.content) payload.content = "<p></p>";

      if (isEdit) {
        const updated = await notesApi.update(id, payload);
        setTitle(updated?.title || "");
        setContent(typeof updated?.content === "string" ? updated.content : payload.content);
        setIsFavorite(!!updated?.isFavorite);
        setSuccessMsg("Saved.");
      } else {
        const created = await notesApi.create(payload);
        // go to edit route right away
        navigate(`/notes/${created.id}`, { replace: true });
      }
    } catch (err) {
      setErrorMsg(err?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!isEdit) return;
    setErrorMsg("");
    setSuccessMsg("");
    setDeleting(true);

    try {
      await notesApi.remove(id);
      navigate("/dashboard");
    } catch (err) {
      setErrorMsg(err?.message || "Delete failed.");
    } finally {
      setDeleting(false);
    }
  }

  function onCancel() {
    navigate("/dashboard");
  }

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline">
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{pageTitle}</h1>
            <p className="mt-1 text-sm text-slate-600">
              {isEdit ? "Make changes and save them." : "Write something and save your new note."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={onCancel} disabled={saving || deleting}>
            Cancel
          </Button>

          {isEdit ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={saving || deleting}>
                  <Trash2 className="h-4 w-4" />
                  {deleting ? "Deleting..." : "Delete"}
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this note?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action can’t be undone. The note will be permanently removed.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    disabled={deleting}
                    onClick={(e) => {
                      e.preventDefault();
                      onDelete();
                    }}
                    className="bg-red-600 text-white hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null}

          <Button onClick={onSave} disabled={saving || deleting || loading}>
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {errorMsg ? (
        <Alert variant="destructive">
          <AlertTitle>Action failed</AlertTitle>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      ) : null}

      {successMsg ? (
        <Alert variant="success">
          <AlertTitle>Done</AlertTitle>
          <AlertDescription>{successMsg}</AlertDescription>
        </Alert>
      ) : null}

      {/* Editor Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-3">
            <span>Note</span>

            <button
              type="button"
              onClick={() => setIsFavorite((v) => !v)}
              className={[
                "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition",
                isFavorite
                  ? "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
              ].join(" ")}
              aria-label="Toggle favorite"
            >
              <Star className={`h-4 w-4 ${isFavorite ? "fill-amber-400 text-amber-600" : "text-slate-500"}`} />
              {isFavorite ? "Favorite" : "Mark favorite"}
            </button>
          </CardTitle>

          <CardDescription>
            Title is optional. Content is stored as an HTML string.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Input
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading || saving || deleting}
          />

          {loading ? (
            <div className="space-y-3">
              <div className="h-10 animate-pulse rounded-md border border-slate-200 bg-slate-50" />
              <div className="h-72 animate-pulse rounded-md border border-slate-200 bg-slate-50" />
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white">
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                modules={quillModules}
                formats={quillFormats}
                readOnly={saving || deleting}
              />
            </div>
          )}

          <p className="text-xs text-slate-500">
            Tip: Use <span className="font-medium">Save</span> to persist changes, or{" "}
            <span className="font-medium">Cancel</span> to return to dashboard.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
