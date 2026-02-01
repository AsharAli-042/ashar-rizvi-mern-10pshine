import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Profile from "../pages/Profile";
import { test, expect, beforeEach, jest, describe } from "@jest/globals";
import { MemoryRouter } from "react-router-dom";

jest.mock("../api/users.api", () => ({
  usersApi: {
    me: jest.fn(),
    updateMe: jest.fn(),
    changePassword: jest.fn(),
  },
}));
import { usersApi } from "../api/users.api";

jest.mock("../auth/useAuth", () => ({ useAuth: jest.fn() }));
import { useAuth } from "../auth/useAuth";

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return { ...actual, useNavigate: jest.fn() };
});
import { useNavigate } from "react-router-dom";

describe("Change Password", () => {
  const navigateMock = jest.fn();

  beforeEach(() => {
    useAuth.mockReturnValue({ user: { id: "u1", name: "Ashar", email: "ashar@email.com" }, logout: jest.fn() });
    usersApi.me.mockResolvedValueOnce({ id: "u1", name: "Ashar", email: "ashar@email.com" });
    usersApi.changePassword.mockReset();
    useNavigate.mockReturnValue(navigateMock);
  });

  test("successful change clears token and navigates to /auth", async () => {
    const user = userEvent.setup();
    usersApi.changePassword.mockResolvedValueOnce({ message: "ok" });

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/current password/i), "oldpass");
    await user.type(screen.getByLabelText(/new password/i), "newpass123");
    await user.type(screen.getByLabelText(/confirm new password/i), "newpass123");

    await user.click(screen.getByRole("button", { name: /change password/i }));

    expect(usersApi.changePassword).toHaveBeenCalledWith({ currentPassword: "oldpass", newPassword: "newpass123" });
    // Expect navigation to /auth (after forced logout)
    expect(navigateMock).toHaveBeenCalledWith("/auth");
  });

  test("wrong current password shows friendly message", async () => {
    const user = userEvent.setup();
    const err = new Error("Unauthorized");
    err.status = 401;
    err.code = "INVALID_CREDENTIALS";
    usersApi.changePassword.mockRejectedValueOnce(err);

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/current password/i), "bad");
    await user.type(screen.getByLabelText(/new password/i), "newpass123");
    await user.type(screen.getByLabelText(/confirm new password/i), "newpass123");

    await user.click(screen.getByRole("button", { name: /change password/i }));

    expect(await screen.findByText(/current password is incorrect/i)).toBeInTheDocument();
  });
});
