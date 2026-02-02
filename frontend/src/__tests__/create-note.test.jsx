import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Dashboard from "../pages/Dashboard";
import { test, expect, beforeEach, jest, describe } from "@jest/globals";

jest.mock("../auth/useAuth", () => ({ useAuth: jest.fn() }));
import { useAuth } from "../auth/useAuth";

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return { ...actual, useNavigate: jest.fn() };
});
import { useNavigate } from "react-router-dom";

jest.mock("../api/notes.api", () => ({
  notesApi: {
    list: jest.fn(),
    create: jest.fn(),
    search: jest.fn(),
    pinNote: jest.fn(),
  },
}));
import { notesApi } from "../api/notes.api";

describe("Feature: Create Note (Template Modal)", () => {
  let navigateMock;

  beforeEach(() => {
    navigateMock = jest.fn();
    useNavigate.mockReturnValue(navigateMock);

    useAuth.mockReturnValue({ user: { name: "Ashar" } });

    notesApi.list.mockReset();
    notesApi.create.mockReset();
  });

  test("open Template modal, select Meeting Minutes template, create note and navigate", async () => {
    const user = userEvent.setup();

    notesApi.list.mockResolvedValueOnce([]); // initial load

    notesApi.create.mockResolvedValueOnce({
      id: "meeting123",
      title: "Team Sync",
      content: "<h2>Meeting Minutes</h2>",
      isFavorite: false,
      createdAt: new Date().toISOString(),
    });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    // Wait initial load
    expect(await screen.findByText(/no notes yet/i)).toBeInTheDocument();

    // open template modal
    await user.click(screen.getByRole("button", { name: /template/i }));

    // modal opens and shows Meeting Minutes template button
    const meetingBtn = await screen.findByRole("button", { name: /meeting minutes/i });
    await user.click(meetingBtn);

    // click Create
    const createBtn = screen.getByRole("button", { name: /^create$/i });
    await user.click(createBtn);

    expect(notesApi.create).toHaveBeenCalledTimes(1);
    const payload = notesApi.create.mock.calls[0][0];
    expect(typeof payload.content).toBe("string");
    // navigate to editor for created note
    expect(navigateMock).toHaveBeenCalledWith("/notes/meeting123");
  });
});