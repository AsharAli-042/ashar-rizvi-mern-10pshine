import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import jest from "@jest/globals";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import AuthPage from "../pages/AuthPage";
import { test, expect } from "@jest/globals";

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
  
    await user.type(screen.getByLabelText(/email/i), "not-an-email");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));
  
    expect(await screen.findByText(/valid email/i)).toBeInTheDocument();
  });