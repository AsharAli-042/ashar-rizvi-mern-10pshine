import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, User, LogOut, Sun } from "lucide-react";
import { useAuth } from "../auth/useAuth";

/**
 * Solar Brutalism Floating Navbar
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

  // Hide nav on auth routes
  const isAuthRoute =
    pathname === "/auth" ||
    pathname.startsWith("/forgot") ||
    pathname.startsWith("/reset-password") ||
    pathname === "/register" ||
    pathname === "/login" ||
    pathname === "/404";

  function handleClick(item) {
    setPressed(item.id);
    setTimeout(() => setPressed(null), 150);
    navigate(item.path);
  }

  async function handleLogout() {
    setPressed("logout");
    try {
      await logout({ callApi: false });
    } catch {
      // ignore
    } finally {
      setTimeout(() => setPressed(null), 150);
      navigate("/auth", { replace: true });
    }
  }

  if (isAuthRoute) return null;

  return (
    <nav
      aria-label="Primary navigation"
      className="fixed left-1/2 bottom-8 z-50 -translate-x-1/2"
    >
      <div className="flex items-center gap-2 border-[4px] border-black bg-white px-3 py-2 shadow-[8px_8px_0px_0px_#000000]"
        style={{ borderRadius: '100px' }}
      >
        {/* Logo/Brand */}
        <div className="flex items-center gap-2 pr-3 border-r-[3px] border-black">
          <div className="flex h-10 w-10 items-center justify-center border-[2px] border-black bg-[#FFF500]" style={{ borderRadius: '50%' }}>
            <Sun className="h-5 w-5 text-black" />
          </div>
          <span className="hidden sm:inline text-sm font-bold uppercase text-black">Solar Notes</span>
        </div>

        {/* Nav Items */}
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path || (item.path === "/dashboard" && pathname === "/");
          const isPressed = pressed === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleClick(item)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase transition-all border-[2px] border-black",
                isActive
                  ? "bg-[#FFF500] text-black shadow-[3px_3px_0px_0px_#000000]"
                  : "bg-white text-black hover:bg-[#FFF500]/30",
                isPressed && "translate-x-[3px] translate-y-[3px] shadow-none"
              )}
              style={{ borderRadius: '100px' }}
              title={item.label}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          );
        })}

        {/* Divider */}
        <div className="w-[3px] bg-black h-8" />

        {/* Logout */}
        <button
          onClick={handleLogout}
          aria-label="Logout"
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase transition-all border-[2px] border-black bg-[#FF0000] text-white hover:bg-[#FF0000]/90",
            pressed === "logout" && "translate-x-[3px] translate-y-[3px] shadow-none"
          )}
          style={{ 
            borderRadius: '100px',
            boxShadow: pressed === "logout" ? 'none' : '3px 3px 0px 0px #000000'
          }}
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </nav>
  );
}

// Helper function (add to utils or inline)
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}