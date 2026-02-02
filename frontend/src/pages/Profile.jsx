// frontend/src/pages/Profile.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save, Lock, User2 } from "lucide-react";

import { usersApi } from "../api/users.api";
import { useAuth } from "../auth/useAuth";
import { clearToken } from "../utils/storage";

/**
 * New Profile page: stacked-card system with heavy borders and tactile controls.
 * - Big header card with chunky avatar (square) and name/email
 * - Email is visually "locked" and non-editable with lock icon
 * - Name is editable with thick border and a heavy focus effect
 * - Change Password area lives inside the same card under a divider
 *
 * Visual behavior:
 * - Inputs use strong border-4 black outlines (neobrutal style)
 * - Name input focus applies a shadow that looks like a pressed slab
 * - Password action button has a "press" effect (translate and hide shadow)
 *
 * NOTE: This component uses usersApi.me, usersApi.updateMe, usersApi.changePassword
 * and useAuth().logout to preserve existing auth behavior.
 */

function initialsFromName(nameOrEmail) {
  const s = String(nameOrEmail || "").trim();
  if (!s) return "U";
  const parts = s.split(/\s+/).slice(0, 2);
  const letters = parts.map((p) => p[0]?.toUpperCase()).filter(Boolean);
  return (letters.join("") || s[0].toUpperCase()).slice(0, 2);
}

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [savingName, setSavingName] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [original, setOriginal] = useState(null);

  // password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);

  const [message, setMessage] = useState({ type: "", text: "" });

  const avatarText = useMemo(() => initialsFromName(name || email || user?.name || user?.email), [
    name,
    email,
    user?.name,
    user?.email,
  ]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      setMessage({ type: "", text: "" });
      try {
        const me = await usersApi.me();
        if (ignore) return;
        setOriginal(me);
        setName(me?.name || "");
        setEmail(me?.email || "");
      } catch (err) {
        setMessage({ type: "error", text: err?.message || "Failed to load profile." });
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  async function onSaveName(e) {
    e?.preventDefault?.();
    setMessage({ type: "", text: "" });

    const trimmed = (name || "").trim();
    if (!trimmed) {
      setMessage({ type: "error", text: "Name cannot be empty." });
      return;
    }
    if (trimmed === (original?.name || "")) {
      setMessage({ type: "info", text: "No changes to save." });
      return;
    }

    setSavingName(true);
    try {
      const updated = await usersApi.updateMe({ name: trimmed });
      setOriginal(updated);
      setName(updated?.name || "");
      setEmail(updated?.email || "");
      updateUser(updated);
      setMessage({ type: "success", text: "Name updated." });
    } catch (err) {
      setMessage({ type: "error", text: err?.message || "Failed to update name." });
    } finally {
      setSavingName(false);
    }
  }

  async function onChangePassword(e) {
    e?.preventDefault?.();
    setMessage({ type: "", text: "" });

    if (!currentPassword || !newPassword) {
      setMessage({ type: "error", text: "Please fill both current and new password." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    setPwdLoading(true);
    try {
      await usersApi.changePassword({ currentPassword, newPassword });
      // Force logout and redirect to auth screen
      try {
        await logout({ callApi: false });
      } catch {
        // ignore
      }
      clearToken();
      setMessage({ type: "success", text: "Password changed. Signing out..." });
      setTimeout(() => navigate("/auth", { replace: true }), 700);
    } catch (err) {
      if (err?.status === 401 || err?.code === "INVALID_CREDENTIALS") {
        setMessage({ type: "error", text: "Current password is incorrect." });
      } else {
        setMessage({ type: "error", text: err?.message || "Failed to change password." });
      }
    } finally {
      setPwdLoading(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  }

  return (
    
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="mx-auto max-w-3xl">
        {/* Stacked cards: top header big card */}
        <div className="mb-6 rounded-lg px-4 py-3" style={{ border: "4px solid #000", background: "linear-gradient(90deg,#fff,#f8fafc)" }}>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-md border-4 border-black bg-white">
              <User2 className="h-6 w-6" />
            </div>
            <div>
              <div className="text-lg font-bold">Solar Notes</div>
              <div className="text-xs text-slate-600">Profile & security</div>
            </div>
          </div>
        </div>
        <div
          className="rounded-xl bg-white p-6"
          style={{
            border: "6px solid #000", // heavy border
            backgroundClip: "padding-box",
          }}
        >
          {/* Header row */}
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            {/* chunky square avatar on the left */}
            <div className="flex items-center justify-center md:w-40 md:flex-none">
              <div
                aria-hidden
                className="h-28 w-28 flex items-center justify-center text-2xl font-bold"
                style={{
                  border: "6px solid #000",
                  backgroundColor: "#f3f4f6",
                  boxShadow: "6px 6px 0 rgba(0,0,0,1)",
                }}
              >
                {avatarText}
              </div>
            </div>

            {/* Name & Email on the right */}
            <div className="flex-1">
              <div className="mb-4">
                <label className="block text-xs font-bold uppercase tracking-wider mb-2">Name</label>

                {/* Name field — thick border, strong focus effect */}
                <div>
                  <input
                    aria-label="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={
                      "w-full border-4 border-black p-3 text-lg font-semibold " +
                      "focus:bg-slate-200 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    }
                    placeholder="Your name"
                    disabled={savingName || loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2">Email</label>

                {/* Disabled, "locked" email field with stripes / disabled appearance */}
                <div className="relative">
                  <input
                    aria-label="Email"
                    value={email}
                    readOnly
                    disabled
                    className={
                      "w-full bg-gray-200 border-4 border-black cursor-not-allowed opacity-80 p-3 text-sm " +
                      "placeholder:text-slate-500"
                    }
                    title="Email cannot be changed here"
                  />
                  {/* lock icon in corner */}
                  <div className="pointer-events-none absolute right-3 top-3 text-slate-700">
                    <Lock className="h-4 w-4" />
                  </div>
                </div>

                <p className="mt-2 text-xs text-slate-600">Email is locked. To change your email, contact support.</p>
              </div>
            </div>
          </div>

          {/* action row: save button for name */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onSaveName}
              disabled={savingName || loading}
              className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white"
              style={{
                backgroundColor: "#0f172a",
                border: "4px solid #000",
                boxShadow: "6px 6px 0 rgba(0,0,0,1)",
                transform: savingName ? "translateY(2px)" : undefined,
              }}
            >
              <Save className="h-4 w-4" />
              {savingName ? "Saving..." : "Save profile"}
            </button>
          </div>

          {/* divider */}
          <div className="my-6 h-px w-full bg-slate-100" />
          {/* Change password inside same card */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide">Change password</h3>

            {message.text ? (
              <div className={`mb-3 rounded-md p-3 ${message.type === "error" ? "bg-rose-50 text-rose-700" : message.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-700"}`} role="status">
                {message.text}
              </div>
            ) : null}

            <form onSubmit={onChangePassword} className="grid gap-4">
              <input
                aria-label="Current password"
                type="password"
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full border-2 border-slate-300 p-3"
                disabled={pwdLoading}
              />
              <input
                aria-label="New password"
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border-2 border-slate-300 p-3"
                disabled={pwdLoading}
              />
              <input
                aria-label="Confirm new password"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border-2 border-slate-300 p-3"
                disabled={pwdLoading}
              />

              {/* Prominent action button with press effect */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={pwdLoading}
                  className="rounded-md px-5 py-3 text-sm font-bold text-white"
                  style={{
                    backgroundColor: "#be185d", // vivid tone but not neon
                    border: "4px solid #000",
                    boxShadow: "6px 6px 0 rgba(0,0,0,1)",
                  }}
                  onMouseDown={(e) => {
                    // visual press handled by CSS active below
                    e.currentTarget.style.transform = "translate(4px,4px)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = "";
                    e.currentTarget.style.boxShadow = "6px 6px 0 rgba(0,0,0,1)";
                  }}
                >
                  {pwdLoading ? "Changing..." : "Change password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
