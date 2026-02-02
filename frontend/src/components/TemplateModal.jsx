import React, { useState } from "react";
import Modal from "./ui/modal";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { notesApi } from "../api/notes.api";
import { useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";

/* Template definitions — polished copy for usability */
const TEMPLATES = [
    {
        id: "meeting-minutes",
        name: "Meeting Minutes",
        description: "Focus: Decisions and Accountability. Clean action items and ownership.",
        content:
            `<h2>Meeting Minutes</h2>
<p><strong>Focus:</strong> Decisions and Accountability.</p>
<p><strong>Subject:</strong> [Meeting Name] &nbsp; <strong>Date:</strong> [Date] &nbsp; <strong>Attendees:</strong> [Names]</p>
<h3>Main Discussion</h3>
<p>[Notes]</p>
<h3>Decisions Made</h3>
<ul><li>[Decision 1]</li><li>[Decision 2]</li></ul>
<h3>✅ Action Items</h3>
<ul>
<li>[ ] [Task Name] — @Assignee</li>
<li>[ ] [Task Name] — @Assignee</li>
</ul>`
    },
    {
        id: "daily-reflection",
        name: "Daily Reflection / Journal",
        description: "Short prompts to reflect on wins, lessons, and plan for tomorrow.",
        content:
            `<h2>Daily Reflection</h2>
<p><strong>Date:</strong> [Date]</p>
<h3>Wins</h3>
<ul><li>[What went well today?]</li></ul>
<h3>Lessons</h3>
<ul><li>[What did I learn?]</li></ul>
<h3>Plan for Tomorrow</h3>
<ul><li>[Top priorities]</li></ul>
<p><em>Gratitude:</em> [One thing I'm thankful for]</p>`
    },
    {
        id: "weekly-meal-planner",
        name: "Weekly Meal Planner",
        description: "Plan meals, shopping list, and quick prep notes.",
        content:
            `<h2>Weekly Meal Planner</h2>
<p><strong>Week:</strong> [Start date – End date]</p>
<table>
<thead><tr><th>Day</th><th>Breakfast</th><th>Lunch</th><th>Dinner</th></tr></thead>
<tbody>
<tr><td>Monday</td><td></td><td></td><td></td></tr>
<tr><td>Tuesday</td><td></td><td></td><td></td></tr>
<tr><td>Wednesday</td><td></td><td></td><td></td></tr>
<tr><td>Thursday</td><td></td><td></td><td></td></tr>
<tr><td>Friday</td><td></td><td></td><td></td></tr>
<tr><td>Saturday</td><td></td><td></td><td></td></tr>
<tr><td>Sunday</td><td></td><td></td><td></td></tr>
</tbody>
</table>
<h3>Shopping List</h3>
<ul><li></li></ul>`
    },
    {
        id: "todo-list",
        name: "To-Do List",
        description: "Simple task list to capture work & personal tasks.",
        content:
            `<h2>To-Do</h2>
<ul>
<li>[ ] Task 1 — @Assignee</li>
<li>[ ] Task 2 — @Assignee</li>
<li>[ ] Task 3 — @Assignee</li>
</ul>`
    }
];

export default function TemplateModal({ open, onClose }) {
    const navigate = useNavigate();
    const [selected, setSelected] = useState(TEMPLATES[0].id);
    const [title, setTitle] = useState("");
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState("");

    async function onCreate() {
        setError("");
        setCreating(true);
        try {
            const tpl = TEMPLATES.find((t) => t.id === selected) || TEMPLATES[0];
            const payload = {
                title: title.trim() ? title.trim() : null,
                content: tpl.content,
                isFavorite: false,
            };
            const created = await notesApi.create(payload);
            onClose?.();
            navigate(`/notes/${created.id}`);
        } catch (err) {
            setError(err?.message || "Failed to create template note.");
        } finally {
            setCreating(false);
        }
    }

    return (
        <Modal open={open} onClose={onClose} title="Choose a template">
            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="flex-1">
                            <Input placeholder="Optional note title" value={title} onChange={(e) => setTitle(e.target.value)} />
                            <p className="mt-1 text-xs text-slate-500">You can give the note a title or leave it blank.</p>
                        </div>
                        <div>
                            <Button onClick={onCreate} disabled={creating}>
                                {creating ? "Creating..." : "Create"}
                            </Button>
                        </div>
                    </div>

                    {error ? <div className="text-sm text-red-600">{error}</div> : null}

                    <div className="mt-2 space-y-3">
                        {TEMPLATES.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setSelected(t.id)}
                                className={cn(
                                    "w-full rounded-lg border p-3 text-left transition",
                                    selected === t.id ? "border-slate-900 bg-slate-50 shadow" : "border-slate-200 hover:bg-slate-50"
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-semibold text-slate-900">{t.name}</div>
                                        <div className="mt-1 text-xs text-slate-600">{t.description}</div>
                                    </div>
                                    <div className="text-xs text-slate-500">{selected === t.id ? "Selected" : "Select"}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <div className="rounded-md border border-slate-200 bg-white p-4">
                        <div className="text-xs font-medium text-slate-700">Preview</div>
                        <div className="mt-3 max-h-[60vh] overflow-auto rounded-md border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700">
                            <div dangerouslySetInnerHTML={{ __html: (TEMPLATES.find(t => t.id === selected) || TEMPLATES[0]).content }} />
                        </div>
                    </div>

                    <div className="mt-4 text-xs text-slate-500">
                        Templates include helpful sections for fast note-taking. You can edit the note content after creation.
                    </div>
                </div>
            </div>
        </Modal>
    );
}
