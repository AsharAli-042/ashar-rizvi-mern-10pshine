/* eslint-disable no-undef */
import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import NoteEditor from "../pages/NoteEditor";

// Mock API
const mockNotesGetById = jest.fn();
const mockNotesCreate = jest.fn();
const mockNotesUpdate = jest.fn();
const mockNotesRemove = jest.fn();

jest.mock("../api/notes.api", () => ({
  notesApi: {
    getById: (...args) => mockNotesGetById(...args),
    create: (...args) => mockNotesCreate(...args),
    update: (...args) => mockNotesUpdate(...args),
    remove: (...args) => mockNotesRemove(...args),
  },
}));

// Mock useAuth
jest.mock("../auth/useAuth", () => ({
  useAuth: () => ({
    user: { name: "Test User", email: "test@example.com" },
  }),
}));

// Mock ReactQuill to avoid rendering issues in tests
jest.mock("react-quill", () => {
  return function MockReactQuill({ value, onChange, readOnly, placeholder }) {
    return (
      <textarea
        data-testid="quill-editor"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={readOnly}
        placeholder={placeholder}
      />
    );
  };
});

// Mock useNavigate and useParams
const mockNavigate = jest.fn();
let mockParams = {};

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useParams: () => mockParams,
  useLocation: () => ({ pathname: "/notes/new" }),
}));

// Sample test data
const mockNote = {
  id: "note-123",
  title: "Test Note",
  content: "<p>Test content</p>",
  isFavorite: false,
  createdAt: "2025-01-15T10:00:00Z",
  updatedAt: "2025-01-15T10:00:00Z",
};

describe("NoteEditor - Functional Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockParams = {};
  });

  // ============================================
  // NOTE CREATION FUNCTIONALITY
  // ============================================

  describe("Note Creation", () => {
    test("should render new note editor with empty fields", async () => {
      mockParams = {}; // No id = new note

      render(
        <MemoryRouter initialEntries={["/notes/new"]}>
          <Routes>
            <Route path="/notes/new" element={<NoteEditor />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/new note/i)).toBeInTheDocument();
      });

      const titleInput = screen.getByPlaceholderText(/title \(optional\)/i);
      const editor = screen.getByTestId("quill-editor");

      expect(titleInput).toHaveValue("");
      expect(editor).toHaveValue("<p></p>"); // ReactQuill initializes with empty paragraph tag
    });

    test("should create a new note with title and content", async () => {
      const user = userEvent.setup();
      mockParams = {};
      const createdNote = { ...mockNote, id: "new-note-id" };
      mockNotesCreate.mockResolvedValueOnce(createdNote);

      render(
        <MemoryRouter initialEntries={["/notes/new"]}>
          <Routes>
            <Route path="/notes/new" element={<NoteEditor />} />
            <Route path="/notes/:id" element={<div>Editor for {createdNote.id}</div>} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/new note/i)).toBeInTheDocument();
      });

      const titleInput = screen.getByPlaceholderText(/title \(optional\)/i);
      const editor = screen.getByTestId("quill-editor");

      await user.type(titleInput, "My New Note");
      await user.type(editor, "<p>This is my note content</p>");

      const saveButton = screen.getByRole("button", { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockNotesCreate).toHaveBeenCalledWith({
          title: "My New Note",
          content: "<p></p><p>This is my note content</p>", // ReactQuill prepends initial tag
          isFavorite: false,
        });
        expect(mockNavigate).toHaveBeenCalledWith("/notes/new-note-id", { replace: true });
      });
    });

    test("should create note without title when title is empty", async () => {
      const user = userEvent.setup();
      mockParams = {};
      mockNotesCreate.mockResolvedValueOnce({ ...mockNote, title: null });

      render(
        <MemoryRouter initialEntries={["/notes/new"]}>
          <Routes>
            <Route path="/notes/new" element={<NoteEditor />} />
            <Route path="/notes/:id" element={<div>Created</div>} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/new note/i)).toBeInTheDocument();
      });

      const editor = screen.getByTestId("quill-editor");
      await user.type(editor, "<p>Content only</p>");

      const saveButton = screen.getByRole("button", { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockNotesCreate).toHaveBeenCalledWith({
          title: null,
          content: "<p></p><p>Content only</p>", // ReactQuill prepends initial tag
          isFavorite: false,
        });
      });
    });

    test("should display error when note creation fails", async () => {
      const user = userEvent.setup();
      mockParams = {};
      const errorMessage = "Failed to create note";
      mockNotesCreate.mockRejectedValueOnce({ message: errorMessage });

      render(
        <MemoryRouter initialEntries={["/notes/new"]}>
          <Routes>
            <Route path="/notes/new" element={<NoteEditor />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/new note/i)).toBeInTheDocument();
      });

      const editor = screen.getByTestId("quill-editor");
      await user.type(editor, "<p>Content</p>");

      const saveButton = screen.getByRole("button", { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(new RegExp(errorMessage, "i"))).toBeInTheDocument();
      });
    });
  });

  // ============================================
  // NOTE EDITING FUNCTIONALITY
  // ============================================

  describe("Note Editing", () => {
    test("should load existing note for editing", async () => {
      mockParams = { id: "note-123" };
      mockNotesGetById.mockResolvedValueOnce(mockNote);

      render(
        <MemoryRouter initialEntries={["/notes/note-123"]}>
          <Routes>
            <Route path="/notes/:id" element={<NoteEditor />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(mockNotesGetById).toHaveBeenCalledWith("note-123");
        expect(screen.getByText(/edit note/i)).toBeInTheDocument();
      });

      const titleInput = screen.getByPlaceholderText(/title \(optional\)/i);
      const editor = screen.getByTestId("quill-editor");

      expect(titleInput).toHaveValue("Test Note");
      expect(editor).toHaveValue("<p>Test content</p>");
    });

    test("should display error when note fails to load", async () => {
      mockParams = { id: "note-123" };
      const errorMessage = "Failed to load note";
      mockNotesGetById.mockRejectedValueOnce({ message: errorMessage });

      render(
        <MemoryRouter initialEntries={["/notes/note-123"]}>
          <Routes>
            <Route path="/notes/:id" element={<NoteEditor />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(new RegExp(errorMessage, "i"))).toBeInTheDocument();
      });
    });

    test("should update existing note successfully", async () => {
      const user = userEvent.setup();
      mockParams = { id: "note-123" };
      mockNotesGetById.mockResolvedValueOnce(mockNote);
      const updatedNote = { ...mockNote, title: "Updated Title", content: "<p>Updated content</p>" };
      mockNotesUpdate.mockResolvedValueOnce(updatedNote);

      render(
        <MemoryRouter initialEntries={["/notes/note-123"]}>
          <Routes>
            <Route path="/notes/:id" element={<NoteEditor />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue("Test Note")).toBeInTheDocument();
      });

      const titleInput = screen.getByPlaceholderText(/title \(optional\)/i);
      const editor = screen.getByTestId("quill-editor");

      await user.clear(titleInput);
      await user.type(titleInput, "Updated Title");
      await user.clear(editor);
      await user.type(editor, "<p>Updated content</p>");

      const saveButton = screen.getByRole("button", { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockNotesUpdate).toHaveBeenCalledWith("note-123", {
          title: "Updated Title",
          content: "<p>Updated content</p>",
          isFavorite: false,
        });
        expect(screen.getByText(/saved/i)).toBeInTheDocument();
      });
    });

    test("should display error when note update fails", async () => {
      const user = userEvent.setup();
      mockParams = { id: "note-123" };
      mockNotesGetById.mockResolvedValueOnce(mockNote);
      const errorMessage = "Save failed";
      mockNotesUpdate.mockRejectedValueOnce({ message: errorMessage });

      render(
        <MemoryRouter initialEntries={["/notes/note-123"]}>
          <Routes>
            <Route path="/notes/:id" element={<NoteEditor />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue("Test Note")).toBeInTheDocument();
      });

      const saveButton = screen.getByRole("button", { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(new RegExp(errorMessage, "i"))).toBeInTheDocument();
      });
    });
  });

  // ============================================
  // FAVORITE FUNCTIONALITY
  // ============================================

  describe("Favorite Functionality", () => {
    test("should toggle favorite status on", async () => {
      const user = userEvent.setup();
      mockParams = { id: "note-123" };
      mockNotesGetById.mockResolvedValueOnce(mockNote);
      mockNotesUpdate.mockResolvedValueOnce({ ...mockNote, isFavorite: true });

      render(
        <MemoryRouter initialEntries={["/notes/note-123"]}>
          <Routes>
            <Route path="/notes/:id" element={<NoteEditor />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue("Test Note")).toBeInTheDocument();
      });

      const favoriteButton = screen.getByRole("button", { name: /favorite/i });
      await user.click(favoriteButton);

      const saveButton = screen.getByRole("button", { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockNotesUpdate).toHaveBeenCalledWith("note-123", {
          title: "Test Note",
          content: "<p>Test content</p>",
          isFavorite: true,
        });
      });
    });

    test("should toggle favorite status off", async () => {
      const user = userEvent.setup();
      mockParams = { id: "note-123" };
      const favoriteNote = { ...mockNote, isFavorite: true };
      mockNotesGetById.mockResolvedValueOnce(favoriteNote);
      mockNotesUpdate.mockResolvedValueOnce({ ...favoriteNote, isFavorite: false });

      render(
        <MemoryRouter initialEntries={["/notes/note-123"]}>
          <Routes>
            <Route path="/notes/:id" element={<NoteEditor />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue("Test Note")).toBeInTheDocument();
      });

      const favoriteButton = screen.getByRole("button", { name: /toggle favorite/i });
      await user.click(favoriteButton);

      const saveButton = screen.getByRole("button", { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockNotesUpdate).toHaveBeenCalledWith("note-123", {
          title: "Test Note",
          content: "<p>Test content</p>",
          isFavorite: false,
        });
      });
    });
  });

  // ============================================
  // DELETE FUNCTIONALITY
  // ============================================

  describe("Delete Functionality", () => {
    test("should delete note successfully", async () => {
      const user = userEvent.setup();
      mockParams = { id: "note-123" };
      mockNotesGetById.mockResolvedValueOnce(mockNote);
      mockNotesRemove.mockResolvedValueOnce({});

      render(
        <MemoryRouter initialEntries={["/notes/note-123"]}>
          <Routes>
            <Route path="/notes/:id" element={<NoteEditor />} />
            <Route path="/dashboard" element={<div>Dashboard</div>} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue("Test Note")).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole("button", { name: /delete/i });
      await user.click(deleteButton);

      // Confirmation dialog should appear
      await waitFor(() => {
        expect(screen.getByText(/delete this note/i)).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole("button", { name: /^delete$/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockNotesRemove).toHaveBeenCalledWith("note-123");
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
      });
    });

    test("should cancel delete when user clicks cancel", async () => {
      const user = userEvent.setup();
      mockParams = { id: "note-123" };
      mockNotesGetById.mockResolvedValueOnce(mockNote);

      render(
        <MemoryRouter initialEntries={["/notes/note-123"]}>
          <Routes>
            <Route path="/notes/:id" element={<NoteEditor />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue("Test Note")).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole("button", { name: /delete/i });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText(/delete this note/i)).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(mockNotesRemove).not.toHaveBeenCalled();
        expect(screen.queryByText(/delete this note/i)).not.toBeInTheDocument();
      });
    });

    test("should display error when delete fails", async () => {
      const user = userEvent.setup();
      mockParams = { id: "note-123" };
      mockNotesGetById.mockResolvedValueOnce(mockNote);
      const errorMessage = "Delete failed";
      mockNotesRemove.mockRejectedValueOnce({ message: errorMessage });

      render(
        <MemoryRouter initialEntries={["/notes/note-123"]}>
          <Routes>
            <Route path="/notes/:id" element={<NoteEditor />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue("Test Note")).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole("button", { name: /delete/i });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText(/delete this note/i)).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole("button", { name: /^delete$/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(new RegExp(errorMessage, "i"))).toBeInTheDocument();
      });
    });
  });

  // ============================================
  // NAVIGATION FUNCTIONALITY
  // ============================================

  describe("Navigation Functionality", () => {
    test("should navigate to dashboard when cancel is clicked", async () => {
      const user = userEvent.setup();
      mockParams = {};

      render(
        <MemoryRouter initialEntries={["/notes/new"]}>
          <Routes>
            <Route path="/notes/new" element={<NoteEditor />} />
            <Route path="/dashboard" element={<div>Dashboard</div>} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/new note/i)).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
      });
    });

    test("should have back link to dashboard", async () => {
      mockParams = {};

      render(
        <MemoryRouter initialEntries={["/notes/new"]}>
          <Routes>
            <Route path="/notes/new" element={<NoteEditor />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/new note/i)).toBeInTheDocument();
      });

      const backLink = screen.getByRole("link", { name: /back/i });
      expect(backLink).toHaveAttribute("href", "/dashboard");
    });
  });
});