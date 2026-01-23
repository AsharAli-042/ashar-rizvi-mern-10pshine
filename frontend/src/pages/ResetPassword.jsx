import { Link, useSearchParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { authApi } from "../api/auth.api";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = useMemo(() => params.get("token") || "", [params]);

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!token) return setErrorMsg("Missing reset token. Please use the link from your email.");
    if (!newPassword || newPassword.length < 8) return setErrorMsg("Password must be at least 8 characters.");
    if (newPassword !== confirm) return setErrorMsg("Passwords do not match.");

    setSubmitting(true);
    try {
      await authApi.resetPassword({ token, newPassword });
      setSuccessMsg("Password has been reset successfully. You can now log in.");
      setNewPassword("");
      setConfirm("");
    } catch (err) {
      setErrorMsg(err?.message || "Reset failed. The token may be invalid or expired.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Reset password</CardTitle>
          <CardDescription>
            Set a new password for your account.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {successMsg ? (
            <div className="mb-4">
              <Alert variant="success">
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{successMsg}</AlertDescription>
              </Alert>
            </div>
          ) : null}

          {errorMsg ? (
            <div className="mb-4">
              <Alert variant="destructive">
                <AlertTitle>Couldn’t reset</AlertTitle>
                <AlertDescription>{errorMsg}</AlertDescription>
              </Alert>
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="At least 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input
                id="confirm"
                type="password"
                placeholder="Re-enter your password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <div className="flex items-center justify-between">
              <Button asChild variant="ghost">
                <Link to="/auth">Back</Link>
              </Button>

              <Button type="submit" disabled={submitting}>
                {submitting ? "Resetting..." : "Reset password"}
              </Button>
            </div>

            {!token ? (
              <p className="text-xs text-slate-500">
                Tip: Your reset link should look like{" "}
                <span className="font-mono">/reset-password?token=...</span>
              </p>
            ) : null}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
