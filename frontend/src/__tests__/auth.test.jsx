/* eslint-disable no-undef */
import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import AuthPage from "../pages/AuthPage";

// Mock functions
const mockLogin = jest.fn();
const mockRegister = jest.fn();
const mockNavigate = jest.fn();

// Mock useAuth hook
jest.mock("../auth/useAuth", () => ({
  useAuth: () => ({
    isAuthenticated: false,
    login: mockLogin,
    register: mockRegister,
    authMessage: "",
    setAuthMessage: jest.fn(),
  }),
}));

// Mock react-router-dom navigation
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: null, pathname: "/auth" }),
}));

describe("AuthPage - Functional Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // LOGIN FUNCTIONALITY TESTS
  // ============================================

  describe("Login Functionality", () => {
    test("should validate and reject invalid email format", async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <AuthPage />
        </MemoryRouter>
      );

      await user.type(screen.getByLabelText(/email/i), "invalid-email");
      await user.type(screen.getByLabelText(/password/i), "password123");
      await user.click(screen.getByRole("button", { name: /sign in →/i }));

      // Validation should prevent login from being called
      await waitFor(() => {
        expect(mockLogin).not.toHaveBeenCalled();
      });
    });

    test("should validate and reject empty password", async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <AuthPage />
        </MemoryRouter>
      );

      await user.type(screen.getByLabelText(/email/i), "test@example.com");
      await user.click(screen.getByRole("button", { name: /sign in →/i }));

      // Validation should prevent login from being called
      await waitFor(() => {
        expect(mockLogin).not.toHaveBeenCalled();
      });
    });

    test("should successfully login with valid credentials", async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValueOnce({});

      render(
        <MemoryRouter>
          <AuthPage />
        </MemoryRouter>
      );

      await user.type(screen.getByLabelText(/email/i), "test@example.com");
      await user.type(screen.getByLabelText(/password/i), "password123");
      await user.click(screen.getByRole("button", { name: /sign in →/i }));

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: "test@example.com",
          password: "password123",
        });
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard", { replace: true });
      });
    });

    test("should display error message on login failure", async () => {
      const user = userEvent.setup();
      const errorMessage = "Invalid credentials";
      mockLogin.mockRejectedValueOnce({ message: errorMessage });

      render(
        <MemoryRouter>
          <AuthPage />
        </MemoryRouter>
      );

      await user.type(screen.getByLabelText(/email/i), "test@example.com");
      await user.type(screen.getByLabelText(/password/i), "wrongpassword");
      await user.click(screen.getByRole("button", { name: /sign in →/i }));

      await waitFor(() => {
        expect(screen.getByText(new RegExp(errorMessage, "i"))).toBeInTheDocument();
      });
    });

    test("should trim whitespace from email during login", async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValueOnce({});

      render(
        <MemoryRouter>
          <AuthPage />
        </MemoryRouter>
      );

      await user.type(screen.getByLabelText(/email/i), "  test@example.com  ");
      await user.type(screen.getByLabelText(/password/i), "password123");
      await user.click(screen.getByRole("button", { name: /sign in →/i }));

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: "test@example.com",
          password: "password123",
        });
      });
    });
  });

  // ============================================
  // REGISTRATION FUNCTIONALITY TESTS
  // ============================================

  describe("Registration Functionality", () => {
    test("should validate and reject empty name field", async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <AuthPage />
        </MemoryRouter>
      );

      await user.click(screen.getByRole("tab", { name: /sign up/i }));
      await user.type(screen.getByLabelText(/email/i), "john@example.com");
      await user.type(screen.getByLabelText(/password/i), "password123");
      await user.click(screen.getByRole("button", { name: /create account →/i }));

      // Validation should prevent registration from being called
      await waitFor(() => {
        expect(mockRegister).not.toHaveBeenCalled();
      });
    });

    test("should validate and reject invalid email during registration", async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <AuthPage />
        </MemoryRouter>
      );

      await user.click(screen.getByRole("tab", { name: /sign up/i }));
      await user.type(screen.getByLabelText(/name/i), "John Doe");
      await user.type(screen.getByLabelText(/email/i), "invalid-email");
      await user.type(screen.getByLabelText(/password/i), "password123");
      await user.click(screen.getByRole("button", { name: /create account →/i }));

      // Validation should prevent registration from being called
      await waitFor(() => {
        expect(mockRegister).not.toHaveBeenCalled();
      });
    });

    test("should validate and reject password shorter than 8 characters", async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <AuthPage />
        </MemoryRouter>
      );

      await user.click(screen.getByRole("tab", { name: /sign up/i }));
      await user.type(screen.getByLabelText(/name/i), "John Doe");
      await user.type(screen.getByLabelText(/email/i), "john@example.com");
      await user.type(screen.getByLabelText(/password/i), "short");
      await user.click(screen.getByRole("button", { name: /create account →/i }));

      // Validation should prevent registration from being called
      await waitFor(() => {
        expect(mockRegister).not.toHaveBeenCalled();
      });
    });

    test("should successfully register with valid data", async () => {
      const user = userEvent.setup();
      mockRegister.mockResolvedValueOnce({});

      render(
        <MemoryRouter>
          <AuthPage />
        </MemoryRouter>
      );

      await user.click(screen.getByRole("tab", { name: /sign up/i }));
      await user.type(screen.getByLabelText(/name/i), "John Doe");
      await user.type(screen.getByLabelText(/email/i), "john@example.com");
      await user.type(screen.getByLabelText(/password/i), "password123");
      await user.click(screen.getByRole("button", { name: /create account →/i }));

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith({
          name: "John Doe",
          email: "john@example.com",
          password: "password123",
        });
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard", { replace: true });
      });
    });

    test("should display error message on registration failure", async () => {
      const user = userEvent.setup();
      const errorMessage = "Email already exists";
      mockRegister.mockRejectedValueOnce({ message: errorMessage });

      render(
        <MemoryRouter>
          <AuthPage />
        </MemoryRouter>
      );

      await user.click(screen.getByRole("tab", { name: /sign up/i }));
      await user.type(screen.getByLabelText(/name/i), "John Doe");
      await user.type(screen.getByLabelText(/email/i), "existing@example.com");
      await user.type(screen.getByLabelText(/password/i), "password123");
      await user.click(screen.getByRole("button", { name: /create account →/i }));

      await waitFor(() => {
        expect(screen.getByText(new RegExp(errorMessage, "i"))).toBeInTheDocument();
      });
    });

    test("should trim whitespace from name and email during registration", async () => {
      const user = userEvent.setup();
      mockRegister.mockResolvedValueOnce({});

      render(
        <MemoryRouter>
          <AuthPage />
        </MemoryRouter>
      );

      await user.click(screen.getByRole("tab", { name: /sign up/i }));
      await user.type(screen.getByLabelText(/name/i), "  John Doe  ");
      await user.type(screen.getByLabelText(/email/i), "  john@example.com  ");
      await user.type(screen.getByLabelText(/password/i), "password123");
      await user.click(screen.getByRole("button", { name: /create account →/i }));

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith({
          name: "John Doe",
          email: "john@example.com",
          password: "password123",
        });
      });
    });
  });

  // ============================================
  // TAB SWITCHING & NAVIGATION FUNCTIONALITY
  // ============================================

  describe("Navigation Functionality", () => {
    test("should clear error messages when switching between tabs", async () => {
      const user = userEvent.setup();
      mockLogin.mockRejectedValueOnce({ message: "Login failed" });

      render(
        <MemoryRouter>
          <AuthPage />
        </MemoryRouter>
      );

      // Trigger login error
      await user.type(screen.getByLabelText(/email/i), "test@example.com");
      await user.type(screen.getByLabelText(/password/i), "wrongpass");
      await user.click(screen.getByRole("button", { name: /sign in →/i }));

      await waitFor(() => {
        expect(screen.getByText(/login failed/i)).toBeInTheDocument();
      });

      // Switch to Sign Up tab
      await user.click(screen.getByRole("tab", { name: /sign up/i }));

      // Error should be cleared
      expect(screen.queryByText(/login failed/i)).not.toBeInTheDocument();
    });
  });
});