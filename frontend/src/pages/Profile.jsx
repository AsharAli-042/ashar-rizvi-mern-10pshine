import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save, Lock, User2, Shield, Sun, KeyRound } from "lucide-react";

import { usersApi } from "../api/users.api";
import { useAuth } from "../auth/useAuth";
import { clearToken } from "../utils/storage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";

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
      setMessage({ type: "success", text: "No changes to save." });
      return;
    }

    setSavingName(true);
    try {
      const updated = await usersApi.updateMe({ name: trimmed });
      setOriginal(updated);
      setName(updated?.name || "");
      setEmail(updated?.email || "");
      updateUser(updated);
      setMessage({ type: "success", text: "Name updated successfully!" });
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
    if (newPassword.length < 8) {
      setMessage({ type: "error", text: "New password must be at least 8 characters." });
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
      setMessage({ type: "success", text: "Password changed! Signing out..." });
      setTimeout(() => navigate("/auth", { replace: true }), 1000);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="border-[4px] border-black bg-white p-6 shadow-[6px_6px_0px_0px_#000000]">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center border-[3px] border-black bg-[#B4E4FF]">
            <Sun className="h-9 w-9 text-black" />
          </div>
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-tight text-black">
              Profile
            </h1>
            <p className="mt-1 text-sm font-medium text-black/70">
              Manage your account settings
            </p>
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {message.text && (
        <Alert 
          variant={message.type === "error" ? "destructive" : "success"} 
          onDismiss={() => setMessage({ type: "", text: "" })}
        >
          <AlertTitle>
            {message.type === "error" ? "⚠️ Error" : "✅ Success"}
          </AlertTitle>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Profile Information Card */}
      <Card className="border-[4px] border-black bg-white shadow-[6px_6px_0px_0px_#FFD6E8]">
        <CardHeader className="border-b-[3px] border-black">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center border-[3px] border-black bg-[#FFD6E8]">
              <User2 className="h-5 w-5 text-black" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold uppercase">Account Information</CardTitle>
              <CardDescription className="text-sm font-medium text-black/70">
                Update your personal details
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="flex flex-col gap-6 md:flex-row">
            {/* Avatar */}
            <div className="flex items-center justify-center md:w-32 md:flex-none">
              <div className="flex h-32 w-32 items-center justify-center border-[4px] border-black bg-[#FFF500] text-4xl font-bold uppercase text-black shadow-[6px_6px_0px_0px_#000000]">
                {loading ? "..." : avatarText}
              </div>
            </div>

            {/* Form */}
            <div className="flex-1 space-y-4">
              {/* Name Input */}
              <div>
                <label className="mb-2 block text-sm font-bold uppercase text-black">
                  Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  disabled={savingName || loading}
                />
              </div>

              {/* Email Input (Locked) */}
              <div>
                <label className="mb-2 block text-sm font-bold uppercase text-black">
                  Email
                </label>
                <div className="relative">
                  <Input
                    value={email}
                    disabled
                    className="cursor-not-allowed opacity-70"
                  />
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                    <Lock className="h-5 w-5 text-black" />
                  </div>
                </div>
                <div className="mt-2 border-l-[4px] border-black bg-[#B4E4FF] px-3 py-2">
                  <p className="text-xs font-bold uppercase text-black">
                    🔒 Email cannot be changed. Contact support if needed.
                  </p>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-2">
                <Button onClick={onSaveName} disabled={savingName || loading}>
                  <Save className="h-4 w-4" />
                  {savingName ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Card */}
      <Card className="border-[4px] border-black bg-white shadow-[6px_6px_0px_0px_#FFE5B4]">
        <CardHeader className="border-b-[3px] border-black">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center border-[3px] border-black bg-[#FFE5B4]">
              <Shield className="h-5 w-5 text-black" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold uppercase">Security</CardTitle>
              <CardDescription className="text-sm font-medium text-black/70">
                Change your password to keep your account secure
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={onChangePassword} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="mb-2 block text-sm font-bold uppercase text-black">
                Current Password
              </label>
              <Input
                type="password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={pwdLoading}
              />
            </div>

            {/* New Password */}
            <div>
              <label className="mb-2 block text-sm font-bold uppercase text-black">
                New Password
              </label>
              <Input
                type="password"
                placeholder="Enter new password (8+ characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={pwdLoading}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-2 block text-sm font-bold uppercase text-black">
                Confirm New Password
              </label>
              <Input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={pwdLoading}
              />
            </div>

            {/* Info Box */}
            <div className="border-l-[4px] border-black bg-[#FFE5B4] px-4 py-3">
              <p className="text-xs font-bold uppercase text-black">
                ⚠️ You will be logged out after changing your password
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-2">
              <Button 
                type="submit" 
                variant="danger" 
                disabled={pwdLoading}
              >
                <KeyRound className="h-4 w-4" />
                {pwdLoading ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}