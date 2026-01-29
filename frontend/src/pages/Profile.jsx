import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Save, User2 } from "lucide-react";

import { usersApi } from "../api/users.api";
import { useAuth } from "../auth/useAuth";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
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
  const [saving, setSaving] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [original, setOriginal] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const avatarText = useMemo(() => initialsFromName(name || email || user?.name || user?.email), [
    name,
    email,
    user?.name,
    user?.email,
  ]);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setErrorMsg("");
      setSuccessMsg("");
      setLoading(true);
      try {
        const me = await usersApi.me();
        if (ignore) return;

        setOriginal(me);
        setName(me?.name || "");
        setEmail(me?.email || "");
      } catch (err) {
        if (!ignore) setErrorMsg(err?.message || "Failed to load profile.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, []);

  function onReset() {
    setErrorMsg("");
    setSuccessMsg("");
    setName(original?.name || "");
    setEmail(original?.email || "");
  }

  async function onSave(e) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) return setErrorMsg("Name is required.");
    if (!trimmedEmail) return setErrorMsg("Email is required.");

    // Send only what changed (safer with unknown backend validation rules)
    const payload = {};
    if (trimmedName !== (original?.name || "")) payload.name = trimmedName;
    if (trimmedEmail !== (original?.email || "")) payload.email = trimmedEmail;

    // Nothing changed: just show a gentle message
    if (Object.keys(payload).length === 0) {
      setSuccessMsg("No changes to save.");
      return;
    }

    setSaving(true);
    try {
      const updated = await usersApi.updateMe(payload);

      setOriginal(updated);
      setName(updated?.name || "");
      setEmail(updated?.email || "");

      // Update global auth user so Navbar updates immediately
      updateUser(updated);

      setSuccessMsg("Profile updated successfully.");
    } catch (err) {
      setErrorMsg(err?.message || "Update failed.");
    } finally {
      setSaving(false);
    }
  }

  async function onLogout() {
    await logout({ callApi: false });
    navigate("/auth");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Profile</h1>
          <p className="mt-1 text-sm text-slate-600">Manage your account details.</p>
        </div>

        <Button variant="outline" onClick={onLogout}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      {/* Alerts */}
      {errorMsg ? (
        <Alert variant="destructive">
          <AlertTitle>Action failed</AlertTitle>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      ) : null}

      {successMsg ? (
        <Alert variant="success">
          <AlertTitle>Done</AlertTitle>
          <AlertDescription>{successMsg}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: identity card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User2 className="h-5 w-5" />
              Account
            </CardTitle>
            <CardDescription>Your basic identity info.</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800">
                {avatarText}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-900">
                  {loading ? "Loading..." : (name || "—")}
                </div>
                <div className="truncate text-sm text-slate-600">
                  {loading ? "—" : (email || "—")}
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-2 text-xs text-slate-500">
              <div className="flex items-center justify-between">
                <span>User</span>
                <span className="truncate font-mono text-slate-700">
                  {user?.id || original?.id || "—"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right: edit form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Edit profile</CardTitle>
            <CardDescription>Update your name or email, then save.</CardDescription>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="space-y-3">
                <div className="h-10 animate-pulse rounded-md border border-slate-200 bg-slate-50" />
                <div className="h-10 animate-pulse rounded-md border border-slate-200 bg-slate-50" />
                <div className="h-10 animate-pulse rounded-md border border-slate-200 bg-slate-50" />
              </div>
            ) : (
              <form onSubmit={onSave} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    disabled={saving}
                    placeholder="Your name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    disabled={saving}
                    placeholder="you@example.com"
                  />
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <Button type="button" variant="outline" onClick={onReset} disabled={saving}>
                    Reset
                  </Button>
                  <Button type="submit" disabled={saving}>
                    <Save className="h-4 w-4" />
                    {saving ? "Saving..." : "Save changes"}
                  </Button>
                </div>

                <p className="text-xs text-slate-500">
                  If your session expires, you’ll be redirected to login automatically.
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
