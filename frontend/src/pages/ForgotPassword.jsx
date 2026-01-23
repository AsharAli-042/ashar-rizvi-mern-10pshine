import { Link } from "react-router-dom";
import { useState } from "react";
import { authApi } from "../api/auth.api";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setDone(false);

    // We still validate input locally for better UX
    if (!isValidEmail(email)) {
      setDone(true);
      return;
    }

    setSubmitting(true);
    try {
      // Always show generic success message regardless of backend response
      await authApi.forgotPassword({ email: email.trim() });
    } catch {
      // intentionally ignore
    } finally {
      setSubmitting(false);
      setDone(true);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Forgot password</CardTitle>
          <CardDescription>
            Enter your email and we’ll send a reset link if the account exists.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {done ? (
            <div className="mb-4">
              <Alert variant="success">
                <AlertTitle>Request received</AlertTitle>
                <AlertDescription>
                  If the email exists, you’ll receive a reset link shortly.
                </AlertDescription>
              </Alert>
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <p className="text-xs text-slate-500">
                For privacy, we don’t confirm whether an email is registered.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <Button asChild variant="ghost">
                <Link to="/auth">Back</Link>
              </Button>

              <Button type="submit" disabled={submitting}>
                {submitting ? "Sending..." : "Send reset link"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
