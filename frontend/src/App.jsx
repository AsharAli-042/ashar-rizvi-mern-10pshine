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

  // Pages that need constrained layout (max-width wrapper)
  const constrainedRoutes = [
    '/notes/new',
    '/profile',
  ];

  // Check if current route starts with /notes/ and has an ID
  const isNoteEditor = location.pathname.startsWith('/notes/') && location.pathname !== '/notes/new';

  const isConstrained = constrainedRoutes.includes(location.pathname) || isNoteEditor;

  return (
    <div className="min-h-screen">
      <Navbar />

      {isConstrained ? (
        // Constrained layout for note editor and profile with yellow background
        <div className="min-h-screen bg-[#FFF500] pb-24">
          <main className="mx-auto w-full max-w-5xl px-4 py-6">
            <Routes>
              <Route element={<ProtectedRoute />}>
                <Route path="/notes/new" element={<NoteEditor />} />
                <Route path="/notes/:id" element={<NoteEditor />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Routes>
          </main>
        </div>
      ) : (
        // Full screen for all other pages
        <Routes>
          {/* Auth routes */}
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Default */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      )}
    </div>
  );
}