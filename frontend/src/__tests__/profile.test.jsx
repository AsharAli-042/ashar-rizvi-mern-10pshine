/* eslint-disable no-undef */
import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Profile from "../pages/Profile";

// Mock API
const mockUsersMe = jest.fn();
const mockUsersUpdateMe = jest.fn();
const mockUsersChangePassword = jest.fn();

jest.mock("../api/users.api", () => ({
  usersApi: {
    me: (...args) => mockUsersMe(...args),
    updateMe: (...args) => mockUsersUpdateMe(...args),
    changePassword: (...args) => mockUsersChangePassword(...args),
  },
}));

// Mock useAuth
const mockLogout = jest.fn();
const mockUpdateUser = jest.fn();
const mockUser = {
  name: "John Doe",
  email: "john@example.com",
};

jest.mock("../auth/useAuth", () => ({
  useAuth: () => ({
    user: mockUser,
    logout: mockLogout,
    updateUser: mockUpdateUser,
  }),
}));

// Mock storage utility
jest.mock("../utils/storage", () => ({
  clearToken: jest.fn(),
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: "/profile" }),
}));

// Sample test data
const mockProfile = {
  name: "John Doe",
  email: "john@example.com",
};

describe("Profile - Functional Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsersMe.mockResolvedValue(mockProfile);
  });

  // ============================================
  // PROFILE LOADING FUNCTIONALITY
  // ============================================

  describe("Profile Loading", () => {
    test("should load and display user profile on mount", async () => {
      render(
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(mockUsersMe).toHaveBeenCalledTimes(1);
      });

      expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
      expect(screen.getByDisplayValue("john@example.com")).toBeInTheDocument();
    });

    test("should display error when profile fails to load", async () => {
      const errorMessage = "Failed to load profile";
      mockUsersMe.mockRejectedValueOnce({ message: errorMessage });

      render(
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(new RegExp(errorMessage, "i"))).toBeInTheDocument();
      });
    });

    test("should display user initials in avatar", async () => {
      render(
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText("JD")).toBeInTheDocument(); // Initials from "John Doe"
      });
    });
  });

  // ============================================
  // NAME UPDATE FUNCTIONALITY
  // ============================================

  describe("Name Update", () => {
    test("should update name successfully", async () => {
      const user = userEvent.setup();
      const updatedProfile = { ...mockProfile, name: "Jane Smith" };
      mockUsersUpdateMe.mockResolvedValueOnce(updatedProfile);

      render(
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
      });

      const nameInput = screen.getByPlaceholderText(/your name/i);
      await user.clear(nameInput);
      await user.type(nameInput, "Jane Smith");

      const saveButton = screen.getByRole("button", { name: /save changes/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockUsersUpdateMe).toHaveBeenCalledWith({ name: "Jane Smith" });
        expect(mockUpdateUser).toHaveBeenCalledWith(updatedProfile);
        expect(screen.getByText(/name updated/i)).toBeInTheDocument();
      });
    });

    test("should validate and reject empty name", async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
      });

      const nameInput = screen.getByPlaceholderText(/your name/i);
      await user.clear(nameInput);

      const saveButton = screen.getByRole("button", { name: /save changes/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/name cannot be empty/i)).toBeInTheDocument();
      });

      expect(mockUsersUpdateMe).not.toHaveBeenCalled();
    });

    test("should not update when name has not changed", async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
      });

      const saveButton = screen.getByRole("button", { name: /save changes/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/no changes to save/i)).toBeInTheDocument();
      });

      expect(mockUsersUpdateMe).not.toHaveBeenCalled();
    });

    test("should display error when name update fails", async () => {
      const user = userEvent.setup();
      const errorMessage = "Failed to update name";
      mockUsersUpdateMe.mockRejectedValueOnce({ message: errorMessage });

      render(
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
      });

      const nameInput = screen.getByPlaceholderText(/your name/i);
      await user.clear(nameInput);
      await user.type(nameInput, "New Name");

      const saveButton = screen.getByRole("button", { name: /save changes/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(new RegExp(errorMessage, "i"))).toBeInTheDocument();
      });
    });
  });

  // ============================================
  // PASSWORD CHANGE FUNCTIONALITY
  // ============================================

  describe("Password Change", () => {

    test("should validate and reject empty password fields", async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(mockUsersMe).toHaveBeenCalled();
      });

      const changePasswordButton = screen.getByRole("button", { name: /change password/i });
      await user.click(changePasswordButton);

      await waitFor(() => {
        expect(screen.getByText(/please fill both current and new password/i)).toBeInTheDocument();
      });

      expect(mockUsersChangePassword).not.toHaveBeenCalled();
    });

    test("should validate password length (minimum 8 characters)", async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(mockUsersMe).toHaveBeenCalled();
      });

      const currentPasswordInput = screen.getByPlaceholderText(/current password/i);
      const newPasswordInput = screen.getByPlaceholderText(/new password \(8\+ characters\)/i);
      const confirmPasswordInput = screen.getByPlaceholderText(/confirm new password/i);

      await user.type(currentPasswordInput, "oldPass");
      await user.type(newPasswordInput, "short");
      await user.type(confirmPasswordInput, "short");

      const changePasswordButton = screen.getByRole("button", { name: /change password/i });
      await user.click(changePasswordButton);

      await waitFor(() => {
        expect(screen.getByText(/new password must be at least 8 characters/i)).toBeInTheDocument();
      });

      expect(mockUsersChangePassword).not.toHaveBeenCalled();
    });

    test("should validate password confirmation match", async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(mockUsersMe).toHaveBeenCalled();
      });

      const currentPasswordInput = screen.getByPlaceholderText(/current password/i);
      const newPasswordInput = screen.getByPlaceholderText(/new password \(8\+ characters\)/i);
      const confirmPasswordInput = screen.getByPlaceholderText(/confirm new password/i);

      await user.type(currentPasswordInput, "oldPassword123");
      await user.type(newPasswordInput, "newPassword123");
      await user.type(confirmPasswordInput, "differentPassword");

      const changePasswordButton = screen.getByRole("button", { name: /change password/i });
      await user.click(changePasswordButton);

      await waitFor(() => {
        expect(screen.getByText(/new passwords do not match/i)).toBeInTheDocument();
      });

      expect(mockUsersChangePassword).not.toHaveBeenCalled();
    });

    test("should display error for incorrect current password", async () => {
      const user = userEvent.setup();
      mockUsersChangePassword.mockRejectedValueOnce({ 
        status: 401,
        message: "Invalid credentials" 
      });

      render(
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(mockUsersMe).toHaveBeenCalled();
      });

      const currentPasswordInput = screen.getByPlaceholderText(/current password/i);
      const newPasswordInput = screen.getByPlaceholderText(/new password \(8\+ characters\)/i);
      const confirmPasswordInput = screen.getByPlaceholderText(/confirm new password/i);

      await user.type(currentPasswordInput, "wrongPassword");
      await user.type(newPasswordInput, "newPassword123");
      await user.type(confirmPasswordInput, "newPassword123");

      const changePasswordButton = screen.getByRole("button", { name: /change password/i });
      await user.click(changePasswordButton);

      await waitFor(() => {
        expect(screen.getByText(/current password is incorrect/i)).toBeInTheDocument();
      });
    });

    test("should display generic error when password change fails", async () => {
      const user = userEvent.setup();
      const errorMessage = "Password change failed";
      mockUsersChangePassword.mockRejectedValueOnce({ message: errorMessage });

      render(
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(mockUsersMe).toHaveBeenCalled();
      });

      const currentPasswordInput = screen.getByPlaceholderText(/current password/i);
      const newPasswordInput = screen.getByPlaceholderText(/new password \(8\+ characters\)/i);
      const confirmPasswordInput = screen.getByPlaceholderText(/confirm new password/i);

      await user.type(currentPasswordInput, "oldPassword123");
      await user.type(newPasswordInput, "newPassword123");
      await user.type(confirmPasswordInput, "newPassword123");

      const changePasswordButton = screen.getByRole("button", { name: /change password/i });
      await user.click(changePasswordButton);

      await waitFor(() => {
        expect(screen.getByText(new RegExp(errorMessage, "i"))).toBeInTheDocument();
      });
    });
  });

  // ============================================
  // EMAIL FIELD FUNCTIONALITY
  // ============================================

  describe("Email Field", () => {
    test("should display email as disabled/locked", async () => {
      render(
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue("john@example.com")).toBeInTheDocument();
      });

      const emailInput = screen.getByDisplayValue("john@example.com");
      expect(emailInput).toBeDisabled();
    });
  });
});