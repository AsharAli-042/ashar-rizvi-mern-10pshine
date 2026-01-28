import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { test, expect, beforeEach, jest } from "@jest/globals";
import { MemoryRouter } from "react-router-dom"; 
import NoteEditor from "../pages/NoteEditor";

jest.mock("react-quill", () => {
  return function MockQuill({ value, onChange, readOnly }) {
    return (
      <textarea
        aria-label="content"
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  };
});

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: jest.fn(),
  };
});

import { useParams } from "react-router-dom";

const mockGetById = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockRemove = jest.fn();

jest.mock("../api/notes.api", () => ({
  notesApi: {
    getById: (...args) => mockGetById(...args),
    create: (...args) => mockCreate(...args),
    update: (...args) => mockUpdate(...args),
    remove: (...args) => mockRemove(...args),
  },
}));

beforeEach(() => {
  mockNavigate.mockReset();
  mockGetById.mockReset();
  mockCreate.mockReset();
  mockUpdate.mockReset();
  mockRemove.mockReset();
});

test("Create mode: Save calls POST /notes and navigates to created note", async () => {
  useParams.mockReturnValue({}); // no id => create mode
  const user = userEvent.setup();

  mockCreate.mockResolvedValueOnce({
    id: "new123",
    title: null,
    content: "<p></p>",
    isFavorite: false,
  });

  render(
    <MemoryRouter>
      <NoteEditor />
    </MemoryRouter>
  );

  await user.click(screen.getByRole("button", { name: /save/i }));

  expect(mockCreate).toHaveBeenCalledTimes(1);
  const payload = mockCreate.mock.calls[0][0];
  expect(typeof payload.content).toBe("string");

  expect(mockNavigate).toHaveBeenCalledWith("/notes/new123", { replace: true });
});

test("Edit mode: loads note and Save calls PATCH /notes/:id", async () => {
  useParams.mockReturnValue({ id: "n1" });
  const user = userEvent.setup();

  mockGetById.mockResolvedValueOnce({
    id: "n1",
    title: "Old",
    content: "<p>Hi</p>",
    isFavorite: false,
  });

  mockUpdate.mockResolvedValueOnce({
    id: "n1",
    title: "Old",
    content: "<p>Updated</p>",
    isFavorite: false,
  });

  render(
    <MemoryRouter>
      <NoteEditor />
    </MemoryRouter>
  );

  expect(await screen.findByDisplayValue("<p>Hi</p>")).toBeInTheDocument();

  await user.clear(screen.getByLabelText("content"));
  await user.type(screen.getByLabelText("content"), "<p>Updated</p>");
  await user.click(screen.getByRole("button", { name: /save/i }));

  expect(mockUpdate).toHaveBeenCalledTimes(1);
  expect(mockUpdate.mock.calls[0][0]).toBe("n1"); // id
  expect(typeof mockUpdate.mock.calls[0][1].content).toBe("string");
});
