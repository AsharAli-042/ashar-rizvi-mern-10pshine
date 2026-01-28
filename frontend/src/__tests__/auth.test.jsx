import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom"; 
import AuthPage from "../pages/AuthPage";
import { test, expect, jest } from "@jest/globals";


jest.mock("../auth/useAuth", () => ({
    useAuth: () => ({
      isAuthenticated: false,
      login: jest.fn().mockResolvedValue({}),
      register: jest.fn().mockResolvedValue({}),
      authMessage: "",
      setAuthMessage: jest.fn(),
    }),
  }));
  
  test("AuthPage renders login + register tabs", () => {
    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>
    );
  
    expect(screen.getByRole("tab", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /forgot password/i })).toBeInTheDocument();
  });
  
  test("Login shows validation error on invalid email", async () => {
    const user = userEvent.setup();
  
    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>
    );
  
    // 1. Fill in the email and a dummy password
    await user.type(screen.getByLabelText(/email/i), "not-an-email");
    await user.type(screen.getByLabelText(/password/i), "anything123");
  
    // 2. Click the button
    const signInButton = screen.getByRole("button", { name: /sign in/i });
    await user.click(signInButton);
  
    // 3. Wait for the error message
    // Added a timeout increase just in case JSDOM is being slow
    const errorAlert = await screen.findByText(/please enter a valid email/i, {}, { timeout: 3000 });
    expect(errorAlert).toBeInTheDocument();
  });