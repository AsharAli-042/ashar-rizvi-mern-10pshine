import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { test, expect, beforeEach, jest } from "@jest/globals";
import { MemoryRouter } from "react-router-dom"; 
import Dashboard from "../pages/Dashboard";

jest.mock("../auth/useAuth", () => ({
  useAuth: () => ({
    user: { name: "Ashar", email: "ashar@email.com" },
  }),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockList = jest.fn();
const mockCreate = jest.fn();

jest.mock("../api/notes.api", () => ({
  notesApi: {
    list: (...args) => mockList(...args),
    create: (...args) => mockCreate(...args),
  },
}));

beforeEach(() => {
  mockNavigate.mockReset();
  mockList.mockReset();
  mockCreate.mockReset();
});

test("Dashboard loads and renders notes list", async () => {
    mockList.mockResolvedValueOnce([
    {
      id: "n1",
      title: "My Note",
      content: "<p>Hello</p>",
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);

  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );

  expect(await screen.findByText(/my note/i)).toBeInTheDocument();
});

test("Quick create calls API and navigates to created note", async () => {
  const user = userEvent.setup();

  mockList.mockResolvedValueOnce([]);
  mockCreate.mockResolvedValueOnce({
    id: "nCreated",
    title: "Quick Title",
    content: "<p></p>",
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );

  await screen.findByText(/no notes yet/i);

  await user.type(
    screen.getByPlaceholderText(/optional title for quick create/i),
    "Quick Title"
  );
  await user.click(screen.getByRole("button", { name: /quick create/i }));

  expect(mockCreate).toHaveBeenCalledTimes(1);
  expect(mockNavigate).toHaveBeenCalledWith("/notes/nCreated");
});
