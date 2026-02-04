import { useLocation, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";

import Navbar from "./components/Navbar.jsx";

import AuthPage from "./pages/AuthPage.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import NoteEditor from "./pages/NoteEditor.jsx";
import Profile from "./pages/Profile.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  const location = useLocation();

  // Pages that need full-screen backgrounds (no max-width wrapper)
  const fullScreenRoutes = [
    '/auth',
    '/forgot-password',
    '/reset-password'
  ];

  const isFullScreen = fullScreenRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      {/* Conditional wrapper - full screen for auth pages, constrained for app pages */}
      {isFullScreen ? (
        // Full screen for auth pages (no max-width constraint)
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      ) : (
        // Constrained layout for dashboard/app pages
        <main className="mx-auto w-full max-w-5xl px-4 py-6">
          <Routes>
            {/* Default */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Protected */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/notes/new" element={<NoteEditor />} />
              <Route path="/notes/:id" element={<NoteEditor />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      )}
    </div>
  );
}
