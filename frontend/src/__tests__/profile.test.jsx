import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { test, expect, beforeEach, jest } from "@jest/globals";
import { MemoryRouter } from "react-router-dom"; 
import Profile from "../pages/Profile";

const mockMe = jest.fn();
const mockUpdateMe = jest.fn();

jest.mock("../api/users.api", () => ({
  usersApi: {
    me: (...args) => mockMe(...args),
    updateMe: (...args) => mockUpdateMe(...args),
  },
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockLogout = jest.fn().mockResolvedValue(undefined);
const mockUpdateUser = jest.fn();

jest.mock("../auth/useAuth", () => ({
  useAuth: () => ({
    user: { id: "u1", name: "Ashar", email: "ashar@email.com" },
    logout: (...args) => mockLogout(...args),
    updateUser: (...args) => mockUpdateUser(...args),
  }),
}));

beforeEach(() => {
    mockMe.mockReset();
    mockUpdateMe.mockReset();
    mockNavigate.mockReset();
    mockLogout.mockClear();
    mockUpdateUser.mockClear();
});

test("Profile loads and displays user info", async () => {
    mockMe.mockResolvedValueOnce({
    id: "u1",
    name: "Ashar",
    email: "ashar@email.com",
  });

  render(
    <MemoryRouter>
      <Profile />
    </MemoryRouter>
  );

  expect(await screen.findByDisplayValue("Ashar")).toBeInTheDocument();
  expect(screen.getByDisplayValue("ashar@email.com")).toBeInTheDocument();
});

test("Save changes calls PATCH /users/me with changed fields", async () => {
  const user = userEvent.setup();

  mockMe.mockResolvedValueOnce({
    id: "u1",
    name: "Ashar",
    email: "ashar@email.com",
  });

  mockUpdateMe.mockResolvedValueOnce({
    id: "u1",
    name: "Ashar Ali",
    email: "ashar@email.com",
  });

  render(
    <MemoryRouter>
      <Profile />
    </MemoryRouter>
  );

  const nameInput = await screen.findByLabelText(/name/i);
  await user.clear(nameInput);
  await user.type(nameInput, "Ashar Ali");

  await user.click(screen.getByRole("button", { name: /save changes/i }));

  expect(mockUpdateMe).toHaveBeenCalledTimes(1);
  expect(mockUpdateMe.mock.calls[0][0]).toEqual({ name: "Ashar Ali" });
  expect(mockUpdateUser).toHaveBeenCalledTimes(1);
});

test("Logout clears session and navigates to /auth", async () => {
    mockMe.mockResolvedValueOnce({
    id: "u1",
    name: "Ashar",
    email: "ashar@email.com",
  });

  render(
    <MemoryRouter>
      <Profile />
    </MemoryRouter>
  );

  await screen.findByText(/edit profile/i);
  await userEvent.click(screen.getByRole("button", { name: /logout/i }));

  expect(mockLogout).toHaveBeenCalledTimes(1);
  expect(mockNavigate).toHaveBeenCalledWith("/auth");
});
