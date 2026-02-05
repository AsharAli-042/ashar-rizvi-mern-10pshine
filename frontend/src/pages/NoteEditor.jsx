import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { ArrowLeft, Save, Trash2, Star, FileText } from "lucide-react";

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
    [{ indent: "-1" }, { indent: "+1" }],
    ["blockquote", "code-block"],
    ["link", "image"],
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
  "indent",
  "blockquote",
  "code-block",
  "link",
  "image",
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

  const pageTitle = useMemo(() => (isEdit ? "Edit Note" : "New Note"), [isEdit]);

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
        setSuccessMsg("Saved successfully!");
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
      {/* Top toolbar */}
      <div className="border-[4px] border-black bg-white p-4 shadow-[6px_6px_0px_0px_#000000]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: Back button and title */}
          <div className="flex items-center gap-4">
            <Button asChild variant="secondary" size="sm">
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center border-[3px] border-black bg-[#B4E4FF]">
                <FileText className="h-5 w-5 text-black" />
              </div>
              <div>
                <h1 className="text-xl font-bold uppercase tracking-tight text-black">
                  {pageTitle}
                </h1>
                <p className="text-xs font-medium text-black/70">
                  {isEdit ? "Make changes and save them" : "Write something new"}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={onCancel} disabled={saving || deleting} size="sm">
              Cancel
            </Button>

            {isEdit ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="danger" disabled={saving || deleting} size="sm">
                    <Trash2 className="h-4 w-4" />
                    {deleting ? "Deleting..." : "Delete"}
                  </Button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete This Note?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action can't be undone. The note will be permanently removed.
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
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : null}

            <Button onClick={onSave} disabled={saving || deleting || loading} size="sm">
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {errorMsg ? (
        <Alert variant="destructive" onDismiss={() => setErrorMsg("")}>
          <AlertTitle>⚠️ Error</AlertTitle>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      ) : null}

      {successMsg ? (
        <Alert variant="success" onDismiss={() => setSuccessMsg("")}>
          <AlertTitle>✅ Success</AlertTitle>
          <AlertDescription>{successMsg}</AlertDescription>
        </Alert>
      ) : null}

      {/* Editor Card */}
      <Card className="border-[4px] border-black bg-white shadow-[6px_6px_0px_0px_#FFD6E8]">
        <CardHeader className="border-b-[3px] border-black">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold uppercase">Note Content</CardTitle>
              <CardDescription className="text-sm font-medium text-black/70">
                Title is optional. Write your content below.
              </CardDescription>
            </div>

            {/* Favorite toggle */}
            <button
              type="button"
              onClick={() => setIsFavorite((v) => !v)}
              className={`inline-flex items-center gap-2 border-[3px] border-black px-3 py-2 font-bold uppercase text-sm transition-all shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#000000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[0px_0px_0px_0px_#000000] ${
                isFavorite
                  ? "bg-[#FFF500] text-black"
                  : "bg-white text-black"
              }`}
              aria-label="Toggle favorite"
            >
              <Star className={`h-4 w-4 ${isFavorite ? "fill-black text-black" : "text-black"}`} />
              {isFavorite ? "Favorited" : "Favorite"}
            </button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 p-6">
          {/* Title input */}
          <div>
            <Input
              placeholder="Title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading || saving || deleting}
            />
          </div>

          {/* Editor */}
          {loading ? (
            <div className="space-y-3">
              <div className="h-12 animate-pulse border-[3px] border-black bg-[#FFE5B4]" />
              <div className="h-96 animate-pulse border-[3px] border-black bg-[#B4E4FF]" />
            </div>
          ) : (
            <div className="solar-editor border-[3px] border-black bg-white shadow-[4px_4px_0px_0px_#FFF500]">
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                modules={quillModules}
                formats={quillFormats}
                readOnly={saving || deleting}
                placeholder="Start writing your note..."
              />
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}