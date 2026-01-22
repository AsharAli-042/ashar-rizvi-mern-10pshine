import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom"; // Import jest-dom for extended matchers
import Button from "../components/Button";
import { test, expect } from "@jest/globals";

test("smoke: renders Button", () => {
  render(<Button>Click me</Button>);
  expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
});
