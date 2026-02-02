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
    search: jest.fn(),
    create: jest.fn(),
    pinNote: jest.fn(),
  },
}));
import { notesApi } from "../api/notes.api";

describe("Favorite search (Enter-only)", () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ user: { name: "Ashar" } });
    notesApi.list.mockReset();
    notesApi.search.mockReset();
  });

  test("toggle favorites with empty query fetches favorites immediately", async () => {
    const user = userEvent.setup();

    // initial load returns nothing
    notesApi.list.mockResolvedValueOnce([]);
    // when toggling favorites (empty query), API should be called with { favorites: true }
    notesApi.list.mockResolvedValueOnce([
      { id: "f1", title: "Fav One", content: "<p>a</p>", isFavorite: true, createdAt: new Date().toISOString() },
    ]);

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(await screen.findByText(/no notes yet/i)).toBeInTheDocument();

    await user.click(screen.getByLabelText(/favorites only/i));

    // verify notesApi.list called with favorites true (last call)
    expect(notesApi.list).toHaveBeenCalled();
    const lastParams = notesApi.list.mock.calls[notesApi.list.mock.calls.length - 1][0];
    expect(lastParams).toMatchObject({ favorites: true });

    expect(await screen.findByText(/fav one/i)).toBeInTheDocument();
  });

  test("with text in query, toggling favorites shows hint and requires Enter", async () => {
    const user = userEvent.setup();

    notesApi.list.mockResolvedValueOnce([]);
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(await screen.findByText(/no notes yet/i)).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText(/search notes/i), "hello");
    await user.click(screen.getByLabelText(/favorites only/i));

    // hint should show
    expect(await screen.findByText(/press enter to apply filters/i)).toBeInTheDocument();

    // now press Enter
    notesApi.list.mockResolvedValueOnce([
      { id: "f2", title: "Hello Fav", content: "<p>h</p>", isFavorite: true, createdAt: new Date().toISOString() },
    ]);
    await user.keyboard("{Enter}");

    const lastParams = notesApi.list.mock.calls[notesApi.list.mock.calls.length - 1][0];
    expect(lastParams).toMatchObject({ q: "hello", favorites: true });

    expect(await screen.findByText(/hello fav/i)).toBeInTheDocument();
  });
});