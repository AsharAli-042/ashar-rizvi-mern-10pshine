import React, { useState } from "react";
import Modal, { ModalFooter } from "./ui/modal";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { notesApi } from "../api/notes.api";
import { useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";
import { FileText, Clipboard, Calendar, CheckSquare, Sparkles } from "lucide-react";

/* Template definitions with icons and colors */
const TEMPLATES = [
    {
        id: "meeting-minutes",
        name: "Meeting Minutes",
        icon: Clipboard,
        color: "#FFF500", // Yellow
        shadowColor: "#FF00FF", // Magenta
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
        name: "Daily Reflection",
        icon: Sparkles,
        color: "#00FFFF", // Cyan
        shadowColor: "#FF6B00", // Orange
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
        name: "Meal Planner",
        icon: Calendar,
        color: "#FF00FF", // Magenta
        shadowColor: "#00FF00", // Lime
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
        icon: CheckSquare,
        color: "#FF6B00", // Orange
        shadowColor: "#00FFFF", // Cyan
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

    const selectedTemplate = TEMPLATES.find((t) => t.id === selected) || TEMPLATES[0];

    async function onCreate() {
        setError("");
        setCreating(true);
        try {
            const tpl = TEMPLATES.find((t) => t.id === selected) || TEMPLATES[0];
            const payload = {
                title: title.trim() ? title.trim() : tpl.name,
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

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !creating) {
            onCreate();
        }
    };

    return (
        <Modal 
            open={open} 
            onClose={onClose} 
            title="☀️ Choose Template" 
            description="Start with a pre-built structure or customize your own"
            maxWidth="max-w-5xl"
        >
            <div className="grid gap-6 lg:grid-cols-[1fr,1.2fr]">
                {/* Left side - Template selection */}
                <div className="space-y-5">
                    {/* Title input */}
                    <div className="space-y-2">
                        <Label htmlFor="note-title">Note Title (Optional)</Label>
                        <Input 
                            id="note-title"
                            placeholder="Enter custom title..." 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                        <p className="text-xs font-medium text-black/60">
                            Leave blank to use template name
                        </p>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="border-[3px] border-[#FF0000] bg-[#FF0000]/10 px-4 py-3 shadow-[4px_4px_0px_0px_#FF0000]">
                            <p className="text-sm font-bold text-[#FF0000]">⚠️ {error}</p>
                        </div>
                    )}

                    {/* Template cards */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-bold uppercase text-black">Select Template</h4>
                        {TEMPLATES.map((t) => {
                            const Icon = t.icon;
                            const isSelected = selected === t.id;
                            
                            return (
                                <button
                                    key={t.id}
                                    onClick={() => setSelected(t.id)}
                                    className={cn(
                                        "group w-full border-[3px] border-black p-4 text-left transition-all",
                                        isSelected 
                                            ? "translate-x-[-2px] translate-y-[-2px]"
                                            : "hover:translate-x-[-1px] hover:translate-y-[-1px]"
                                    )}
                                    style={{
                                        backgroundColor: isSelected ? t.color : "#FFFFFF",
                                        boxShadow: isSelected 
                                            ? `6px 6px 0px 0px ${t.shadowColor}`
                                            : `4px 4px 0px 0px ${t.shadowColor}`,
                                    }}
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Icon */}
                                        <div 
                                            className="flex h-12 w-12 flex-shrink-0 items-center justify-center border-[2px] border-black"
                                            style={{
                                                backgroundColor: isSelected ? "#000000" : t.color,
                                                color: isSelected ? t.color : "#000000",
                                            }}
                                        >
                                            <Icon className="h-6 w-6" strokeWidth={2.5} />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <h5 className="font-bold uppercase text-black text-sm">
                                                    {t.name}
                                                </h5>
                                                {isSelected && (
                                                    <span className="flex-shrink-0 bg-black px-2 py-0.5 text-xs font-bold uppercase" style={{ color: t.color }}>
                                                        ✓ Selected
                                                    </span>
                                                )}
                                            </div>
                                            <p className="mt-1 text-xs font-medium text-black/80 leading-relaxed">
                                                {t.description}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Right side - Preview */}
                <div className="flex flex-col">
                    <div className="flex-1 border-[4px] border-black bg-white p-5 shadow-[8px_8px_0px_0px_#000000]">
                        {/* Preview header */}
                        <div className="flex items-center justify-between border-b-[3px] border-black pb-3 mb-4">
                            <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                <h4 className="font-bold uppercase text-black">Preview</h4>
                            </div>
                            <div 
                                className="px-3 py-1 border-[2px] border-black text-xs font-bold uppercase"
                                style={{ 
                                    backgroundColor: selectedTemplate.color,
                                    color: "#000000" 
                                }}
                            >
                                {selectedTemplate.name}
                            </div>
                        </div>

                        {/* Preview content */}
                        <div 
                            className="prose prose-sm max-w-none overflow-auto border-[3px] border-black bg-[#FFFEF7] p-4"
                            style={{
                                maxHeight: "420px",
                                boxShadow: `inset 0 0 20px rgba(0,0,0,0.05)`,
                            }}
                        >
                            <style>{`
                                .prose h2 {
                                    font-size: 1.25rem;
                                    font-weight: bold;
                                    text-transform: uppercase;
                                    color: #000000;
                                    margin-bottom: 0.75rem;
                                    border-bottom: 3px solid #000000;
                                    padding-bottom: 0.5rem;
                                }
                                .prose h3 {
                                    font-size: 1rem;
                                    font-weight: bold;
                                    text-transform: uppercase;
                                    color: #000000;
                                    margin-top: 1rem;
                                    margin-bottom: 0.5rem;
                                }
                                .prose p {
                                    font-size: 0.875rem;
                                    font-weight: 500;
                                    color: #000000;
                                    margin-bottom: 0.75rem;
                                }
                                .prose ul, .prose ol {
                                    font-size: 0.875rem;
                                    font-weight: 500;
                                    color: #000000;
                                    margin-left: 1.5rem;
                                }
                                .prose li {
                                    margin-bottom: 0.25rem;
                                }
                                .prose strong {
                                    font-weight: bold;
                                    color: #000000;
                                }
                                .prose em {
                                    font-style: italic;
                                }
                                .prose table {
                                    width: 100%;
                                    border-collapse: collapse;
                                    font-size: 0.875rem;
                                    margin: 1rem 0;
                                }
                                .prose th {
                                    background: #000000;
                                    color: #FFF500;
                                    font-weight: bold;
                                    text-transform: uppercase;
                                    padding: 0.5rem;
                                    border: 2px solid #000000;
                                    font-size: 0.75rem;
                                }
                                .prose td {
                                    border: 2px solid #000000;
                                    padding: 0.5rem;
                                    background: white;
                                }
                            `}</style>
                            <div dangerouslySetInnerHTML={{ __html: selectedTemplate.content }} />
                        </div>

                        {/* Info text */}
                        <div className="mt-4 border-t-[3px] border-black pt-3">
                            <p className="text-xs font-bold uppercase text-black/60">
                                💡 Tip: All templates are fully editable after creation
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer with action button */}
            <ModalFooter>
                <Button variant="secondary" onClick={onClose} disabled={creating}>
                    Cancel
                </Button>
                <Button onClick={onCreate} disabled={creating}>
                    {creating ? "Creating..." : "🚀 Create Note"}
                </Button>
            </ModalFooter>
        </Modal>
    );
}