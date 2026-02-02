import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { test, expect, jest } from "@jest/globals";
import NoteCard from "../components/NoteCard";

test("NoteCard: clicking pin calls onTogglePin with note id and target state", async () => {
  const note = { id: "n1", title: "Test", content: "<p>hi</p>", isPinned: false };
  const onTogglePin = jest.fn();
  render(<NoteCard note={note} onTogglePin={onTogglePin} />);

  const btn = screen.getByRole("button", { name: /pin note/i });
  const user = userEvent.setup();
  await user.click(btn);

  expect(onTogglePin).toHaveBeenCalledTimes(1);
  expect(onTogglePin).toHaveBeenCalledWith("n1", true);
});
