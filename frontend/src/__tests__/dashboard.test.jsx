/* eslint-disable no-undef */
import "@testing-library/jest-dom";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "../pages/Dashboard";

// Mock API
const mockNotesList = jest.fn();
const mockNotesSearch = jest.fn();
const mockNotesPinNote = jest.fn();
const mockNotesUpdate = jest.fn();
const mockNotesRemove = jest.fn();

jest.mock("../api/notes.api", () => ({
  notesApi: {
    list: (...args) => mockNotesList(...args),
    search: (...args) => mockNotesSearch(...args),
    pinNote: (...args) => mockNotesPinNote(...args),
    update: (...args) => mockNotesUpdate(...args),
    remove: (...args) => mockNotesRemove(...args),
  },
}));

// Mock useAuth
const mockUser = { name: "Test User", email: "test@example.com" };
jest.mock("../auth/useAuth", () => ({
  useAuth: () => ({
    user: mockUser,
  }),
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: "/dashboard" }),
}));

// Sample test data
const mockNotes = [
  {
    id: "note-1",
    title: "Meeting Notes",
    content: "<p>Discuss Q1 goals</p>",
    isPinned: false,
    isFavorite: false,
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "note-2",
    title: "Project Plan",
    content: "<p>Build new feature</p>",
    isPinned: true,
    isFavorite: true,
    pinnedAt: "2025-01-16T10:00:00Z",
    createdAt: "2025-01-14T10:00:00Z",
    updatedAt: "2025-01-16T10:00:00Z",
  },
  {
    id: "note-3",
    title: "Shopping List",
    content: "<p>Milk, Eggs, Bread</p>",
    isPinned: false,
    isFavorite: true,
    createdAt: "2025-01-13T10:00:00Z",
    updatedAt: "2025-01-13T10:00:00Z",
  },
];

describe("Dashboard - Functional Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNotesList.mockResolvedValue([...mockNotes]);
  });

  // ============================================
  // NOTES LOADING FUNCTIONALITY
  // ============================================

  describe("Notes Loading", () => {
    test("should load and display notes on mount", async () => {
      render(
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(mockNotesList).toHaveBeenCalledTimes(1);
      });

      expect(screen.getByText("Meeting Notes")).toBeInTheDocument();
      expect(screen.getByText("Project Plan")).toBeInTheDocument();
      expect(screen.getByText("Shopping List")).toBeInTheDocument();
    });

    test("should display error message when notes fail to load", async () => {
      const errorMessage = "Failed to load notes";
      mockNotesList.mockRejectedValueOnce({ message: errorMessage });

      render(
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(new RegExp(errorMessage, "i"))).toBeInTheDocument();
      });
    });

    test("should display empty state when no notes exist", async () => {
      mockNotesList.mockResolvedValueOnce([]);

      render(
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/no notes yet/i)).toBeInTheDocument();
      });
    });

  });

  // ============================================
  // SEARCH FUNCTIONALITY
  // ============================================

  describe("Search Functionality", () => {
    test("should search notes by query", async () => {
      const user = userEvent.setup();
      const searchResults = [mockNotes[0]]; // Only "Meeting Notes"
      mockNotesList.mockResolvedValueOnce(mockNotes).mockResolvedValueOnce(searchResults);

      render(
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText("Meeting Notes")).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search notes/i);
      await user.type(searchInput, "Meeting");
      await user.click(screen.getByRole("button", { name: /search/i }));

      await waitFor(() => {
        expect(mockNotesList).toHaveBeenCalledWith({ q: "Meeting" });
        expect(screen.getByText("Meeting Notes")).toBeInTheDocument();
        expect(screen.queryByText("Shopping List")).not.toBeInTheDocument();
      });
    });

    test("should trigger search on Enter key", async () => {
      const user = userEvent.setup();
      mockNotesList.mockResolvedValueOnce(mockNotes).mockResolvedValueOnce([mockNotes[0]]);

      render(
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(mockNotesList).toHaveBeenCalledTimes(1);
      });

      const searchInput = screen.getByPlaceholderText(/search notes/i);
      await user.type(searchInput, "Meeting{Enter}");

      await waitFor(() => {
        expect(mockNotesList).toHaveBeenCalledWith({ q: "Meeting" });
      });
    });

    test("should handle search errors gracefully", async () => {
      const user = userEvent.setup();
      mockNotesList.mockResolvedValueOnce(mockNotes);
      mockNotesSearch.mockRejectedValueOnce({ message: "Search failed" });
      mockNotesList.mockRejectedValueOnce({ message: "Search failed" });

      render(
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(mockNotesList).toHaveBeenCalledTimes(1);
      });

      const searchInput = screen.getByPlaceholderText(/search notes/i);
      await user.type(searchInput, "test");
      await user.click(screen.getByRole("button", { name: /search/i }));

      await waitFor(() => {
        expect(screen.getByText(/search failed/i)).toBeInTheDocument();
      });
    });
  });

  // ============================================
  // FILTER FUNCTIONALITY
  // ============================================

  describe("Filter Functionality", () => {
    test("should filter notes by favorites", async () => {
      const user = userEvent.setup();
      const favoriteNotes = mockNotes.filter((n) => n.isFavorite);
      mockNotesList.mockResolvedValueOnce(mockNotes).mockResolvedValueOnce(favoriteNotes);

      render(
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText("Meeting Notes")).toBeInTheDocument();
      });

      const checkbox = screen.getByRole("checkbox", { name: /favorites only/i });
      await user.click(checkbox);

      await waitFor(() => {
        expect(mockNotesList).toHaveBeenCalledWith({ favorites: true });
        expect(screen.getByText("Project Plan")).toBeInTheDocument();
        expect(screen.queryByText("Meeting Notes")).not.toBeInTheDocument();
      });
    });

    test("should combine search and favorites filter", async () => {
      const user = userEvent.setup();
      mockNotesList
        .mockResolvedValueOnce(mockNotes)
        .mockResolvedValueOnce([mockNotes[1]]); // Project Plan (favorite + matches search)

      render(
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(mockNotesList).toHaveBeenCalledTimes(1);
      });

      const searchInput = screen.getByPlaceholderText(/search notes/i);
      await user.type(searchInput, "Project");

      const checkbox = screen.getByRole("checkbox", { name: /favorites only/i });
      await user.click(checkbox);

      await waitFor(() => {
        expect(mockNotesList).toHaveBeenCalledWith({ q: "Project", favorites: true });
      });
    });
  });

  // ============================================
  // PIN FUNCTIONALITY
  // ============================================

  describe("Pin Functionality", () => {
    test("should pin a note successfully", async () => {
      const user = userEvent.setup();
      const updatedNote = { ...mockNotes[0], isPinned: true, pinnedAt: new Date().toISOString() };
      mockNotesPinNote.mockResolvedValueOnce(updatedNote);

      render(
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText("Meeting Notes")).toBeInTheDocument();
      });

      const noteCard = screen.getByText("Meeting Notes").closest("a");
      const pinButton = within(noteCard).getByRole("button", { name: /pin note/i });
      await user.click(pinButton);

      await waitFor(() => {
        expect(mockNotesPinNote).toHaveBeenCalledWith("note-1", true);
      });
    });

    test("should unpin a note successfully", async () => {
      const user = userEvent.setup();
      const updatedNote = { ...mockNotes[1], isPinned: false, pinnedAt: null };
      mockNotesPinNote.mockResolvedValueOnce(updatedNote);

      render(
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText("Project Plan")).toBeInTheDocument();
      });

      const noteCard = screen.getByText("Project Plan").closest("a");
      const unpinButton = within(noteCard).getByRole("button", { name: /unpin note/i });
      await user.click(unpinButton);

      await waitFor(() => {
        expect(mockNotesPinNote).toHaveBeenCalledWith("note-2", false);
      });
    });

    test("should display error message when pin action fails", async () => {
      const user = userEvent.setup();
      mockNotesPinNote.mockRejectedValueOnce({ message: "Pin action failed" });

      render(
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText("Meeting Notes")).toBeInTheDocument();
      });

      const noteCard = screen.getByText("Meeting Notes").closest("a");
      const pinButton = within(noteCard).getByRole("button", { name: /pin note/i });
      await user.click(pinButton);

      await waitFor(() => {
        expect(screen.getByText(/pin action failed/i)).toBeInTheDocument();
      });
    });
  });

  // ============================================
  // FAVORITE FUNCTIONALITY
  // ============================================

  describe("Favorite Functionality", () => {
    test("should favorite a note successfully", async () => {
      const user = userEvent.setup();
      const updatedNote = { ...mockNotes[0], isFavorite: true };
      mockNotesUpdate.mockResolvedValueOnce(updatedNote);

      render(
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText("Meeting Notes")).toBeInTheDocument();
      });

      const noteCard = screen.getByText("Meeting Notes").closest("a");
      const favoriteButton = within(noteCard).getByRole("button", { name: /favorite note/i });
      await user.click(favoriteButton);

      await waitFor(() => {
        expect(mockNotesUpdate).toHaveBeenCalledWith("note-1", { isFavorite: true });
      });
    });

    test("should unfavorite a note successfully", async () => {
      const user = userEvent.setup();
      const updatedNote = { ...mockNotes[1], isFavorite: false };
      mockNotesUpdate.mockResolvedValueOnce(updatedNote);

      render(
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText("Project Plan")).toBeInTheDocument();
      });

      const noteCard = screen.getByText("Project Plan").closest("a");
      const unfavoriteButton = within(noteCard).getByRole("button", { name: /remove favorite/i });
      await user.click(unfavoriteButton);

      await waitFor(() => {
        expect(mockNotesUpdate).toHaveBeenCalledWith("note-2", { isFavorite: false });
      });
    });

    test("should display error message when favorite action fails", async () => {
      const user = userEvent.setup();
      mockNotesUpdate.mockRejectedValueOnce({ message: "Favorite action failed" });

      render(
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText("Meeting Notes")).toBeInTheDocument();
      });

      const noteCard = screen.getByText("Meeting Notes").closest("a");
      const favoriteButton = within(noteCard).getByRole("button", { name: /favorite note/i });
      await user.click(favoriteButton);

      await waitFor(() => {
        expect(screen.getByText(/favorite action failed/i)).toBeInTheDocument();
      });
    });
  });

  // ============================================
  // DELETE FUNCTIONALITY
  // ============================================

  describe("Delete Functionality", () => {
    test("should delete a note successfully", async () => {
      const user = userEvent.setup();
      mockNotesRemove.mockResolvedValueOnce({});

      render(
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText("Meeting Notes")).toBeInTheDocument();
      });

      const noteCard = screen.getByText("Meeting Notes").closest("a");
      const deleteButton = within(noteCard).getByRole("button", { name: /delete note/i });
      await user.click(deleteButton);

      // Confirmation dialog should appear
      await waitFor(() => {
        expect(screen.getByText(/delete this note/i)).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole("button", { name: /^delete$/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockNotesRemove).toHaveBeenCalledWith("note-1");
        expect(screen.queryByText("Meeting Notes")).not.toBeInTheDocument();
      });
    });

    test("should cancel delete when user clicks cancel", async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText("Meeting Notes")).toBeInTheDocument();
      });

      const noteCard = screen.getByText("Meeting Notes").closest("a");
      const deleteButton = within(noteCard).getByRole("button", { name: /delete note/i });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText(/delete this note/i)).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(mockNotesRemove).not.toHaveBeenCalled();
        expect(screen.getByText("Meeting Notes")).toBeInTheDocument();
      });
    });

    test("should display error message when delete fails", async () => {
      const user = userEvent.setup();
      mockNotesRemove.mockRejectedValueOnce({ message: "Delete failed" });

      render(
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText("Meeting Notes")).toBeInTheDocument();
      });

      const noteCard = screen.getByText("Meeting Notes").closest("a");
      const deleteButton = within(noteCard).getByRole("button", { name: /delete note/i });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText(/delete this note/i)).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole("button", { name: /^delete$/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/delete failed/i)).toBeInTheDocument();
      });
    });
  });


  // ============================================
  // NAVIGATION FUNCTIONALITY
  // ============================================

  describe("Navigation Functionality", () => {
    test("should navigate to new note page when new note button is clicked", async () => {
      // eslint-disable-next-line no-unused-vars
      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(mockNotesList).toHaveBeenCalled();
      });

      const newNoteButton = screen.getByRole("link", { name: /new note/i });
      expect(newNoteButton).toHaveAttribute("href", "/notes/new");
    });

    test("should navigate to note editor when note card is clicked", async () => {
      render(
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText("Meeting Notes")).toBeInTheDocument();
      });

      const noteLink = screen.getByText("Meeting Notes").closest("a");
      expect(noteLink).toHaveAttribute("href", "/notes/note-1");
    });
  });
});