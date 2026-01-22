import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import Button from "./Button";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout({ callApi: false });
    navigate("/auth");
  }

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/dashboard" className="font-semibold tracking-tight">
          10Pearls Shine — Notes
        </Link>

        <nav className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="text-sm text-slate-700 hover:underline">
                Dashboard
              </Link>
              <Link to="/profile" className="text-sm text-slate-700 hover:underline">
                Profile
              </Link>
              <span className="hidden text-sm text-slate-500 sm:inline">
                {user?.name || user?.email || "Logged in"}
              </span>
              <Button variant="ghost" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <Link to="/auth" className="text-sm text-slate-700 hover:underline">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
