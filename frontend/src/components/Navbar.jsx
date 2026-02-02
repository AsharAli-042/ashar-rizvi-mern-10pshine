import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, User, LogOut } from "lucide-react";
import { useAuth } from "../auth/useAuth";

/**
 * Floating Pill Navbar (Floating Dock)
 * - Only: Dashboard, Profile, Logout
 * - Detached, border-4 black, hard shadow: shadow-[6px_6px_0px_black]
 * - Pressing an item gives a "sink" effect
 * - Active route is highlighted; Profile shows filled color on /profile
 */
const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", path: "/dashboard", icon: Home },
  { id: "profile", label: "Profile", path: "/profile", icon: User },
];

export default function Navbar() {
  const loc = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [pressed, setPressed] = useState(null);
  const pathname = loc.pathname || "";

  // hide nav items on auth routes
  const isAuthRoute =
    pathname === "/auth" ||
    pathname.startsWith("/forgot") ||
    pathname.startsWith("/reset-password") ||
    pathname === "/register" ||
    pathname === "/login";

  function handleClick(item) {
    setPressed(item.id);
    // sink animation duration ~180ms
    setTimeout(() => setPressed(null), 180);
    navigate(item.path);
  }

  async function handleLogout() {
    setPressed("logout");
    try {
      // call AuthProvider logout to clear token + user state
      await logout({ callApi: false });
    } catch {
      // ignore
    } finally {
      setTimeout(() => setPressed(null), 180);
      navigate("/auth", { replace: true });
    }
  }

  return (
    <nav
      aria-label="Primary"
      className="fixed left-1/2 bottom-6 z-50 -translate-x-1/2"
      style={{ pointerEvents: "auto" }}
    >
      <div
        className="flex items-center gap-3 rounded-full bg-white px-4 py-3"
        style={{
          border: "4px solid black",
          boxShadow: "6px 6px 0px 0px black",
        }}
      >
        {isAuthRoute ? (
          <div className="mx-auto w-full text-center">
            <span className="font-bold text-sm tracking-tight">Solar Notes</span>
          </div>
        ) : (
          <>
            {NAV_ITEMS.map((it) => {
              const Icon = it.icon;
              const isActive = pathname === it.path || (it.path === "/dashboard" && pathname === "/");
              const isPressed = pressed === it.id;
              const baseClasses =
                "flex cursor-pointer select-none items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-all";
              const activeClasses = isActive
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-700 hover:bg-slate-100";
              const pressedStyle = isPressed
                ? { transform: "translateY(4px)", boxShadow: "none", opacity: 0.98 }
                : {};

              return (
                <button
                  key={it.id}
                  onClick={() => handleClick(it)}
                  aria-current={isActive ? "page" : undefined}
                  className={baseClasses + " " + activeClasses}
                  style={pressedStyle}
                  title={it.label}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{it.label}</span>
                </button>
              );
            })}

            <div className="w-px bg-slate-200 h-6" />

            <button
              onClick={handleLogout}
              aria-label="Logout"
              className="flex cursor-pointer items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              style={pressed === "logout" ? { transform: "translateY(4px)", boxShadow: "none" } : {}}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
