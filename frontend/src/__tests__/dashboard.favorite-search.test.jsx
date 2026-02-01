import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Dashboard from "../pages/Dashboard";
import { test, expect, beforeEach, jest, describe } from "@jest/globals";
import { MemoryRouter } from "react-router-dom"; 


jest.mock("../auth/useAuth", () => ({ useAuth: jest.fn() }));
import { useAuth } from "../auth/useAuth";

jest.mock("../api/notes.api", () => ({
  notesApi: {
    list: jest.fn(),
    searchFavoriteNotes: jest.fn(),
    create: jest.fn(),
    pinNote: jest.fn(),
  },
}));
import { notesApi } from "../api/notes.api";

describe("Favorite search", () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ user: { name: "Ashar" } });
    notesApi.list.mockReset();
    notesApi.searchFavoriteNotes.mockReset();
  });

  test("favoritesOnly + query calls searchFavoriteNotes and displays results", async () => {
    const user = userEvent.setup();

    notesApi.list.mockResolvedValueOnce([]);
    const favs = [
      { id: "f1", title: "Fav One", content: "<p>a</p>", isFavorite: true, createdAt: new Date().toISOString() },
    ];
    notesApi.searchFavoriteNotes.mockResolvedValueOnce(favs);

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    // Wait for initial load
    expect(await screen.findByText(/no notes yet/i)).toBeInTheDocument();

    // Check favorites only toggle
    await user.click(screen.getByLabelText(/favorites only/i));
    await user.type(screen.getByPlaceholderText(/search favorites/i), "Fav");

    await user.click(screen.getByRole("button", { name: /search/i }));

    // After search, favorite note should be visible
    expect(await screen.findByText(/fav one/i)).toBeInTheDocument();
    expect(notesApi.searchFavoriteNotes).toHaveBeenCalledWith("Fav");
  });
});
