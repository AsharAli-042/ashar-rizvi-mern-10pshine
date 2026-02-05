import { Link, useSearchParams } from "react-router-dom";
import { useMemo, useState, useEffect  } from "react";
import { authApi } from "../api/auth.api";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { ArrowLeft, KeyRound, Sun, Shield } from "lucide-react";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = useMemo(() => params.get("token") || "", [params]);

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    document.title = "Reset Password";
  }, []);

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
      setSuccessMsg("Password has been reset successfully! You can now sign in.");
      setNewPassword("");
      setConfirm("");
    } catch (err) {
      setErrorMsg(err?.message || "Reset failed. The token may be invalid or expired.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FFF500] p-6">
      {/* Simplified background patterns */}
      <div className="fixed inset-0 -z-10">
        {/* Subtle diagonal stripes */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute h-full w-[60px] bg-black"
              style={{
                left: `${i * 100}px`,
                transform: 'rotate(45deg)',
                transformOrigin: 'top left',
              }}
            />
          ))}
        </div>

        {/* Subtle dots pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle, #000000 2px, transparent 2px)',
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Animated sun rays - more subtle */}
      <div className="fixed left-1/2 top-1/3 -z-10 h-[400px] w-[400px] -translate-x-1/2 opacity-20">
        <div className="animate-[spin_30s_linear_infinite]">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute left-1/2 top-1/2 h-[200px] w-[20px] origin-bottom -translate-x-1/2 bg-gradient-to-t from-[#FF6B00] to-transparent"
              style={{
                transform: `translate(-50%, -100%) rotate(${i * 30}deg)`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Centered content */}
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md">
          {/* Logo at top */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-3 border-[4px] border-black bg-white p-4 shadow-[6px_6px_0px_0px_#000000]">
              <div className="flex h-12 w-12 items-center justify-center border-[3px] border-black bg-[#FFF500]">
                <Sun className="h-7 w-7 text-black animate-[spin_20s_linear_infinite]" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold uppercase tracking-tight text-black">
                  Solar Notes
                </h1>
                <p className="text-xs font-bold uppercase text-black/70">
                  Reset Password
                </p>
              </div>
            </div>
          </div>

          {/* Main card */}
          <Card className="border-[4px] border-black bg-white shadow-[6px_6px_0px_0px_#00FFFF]">
            <CardHeader className="border-b-[3px] border-black">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center border-[3px] border-black bg-[#00FFFF]">
                  <KeyRound className="h-6 w-6 text-black" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold uppercase">Reset Password</CardTitle>
                  <CardDescription className="mt-1 text-sm font-medium text-black/70">
                    Set a new password for your account
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {/* Success Alert */}
              {successMsg && (
                <div className="mb-6">
                  <Alert variant="success">
                    <AlertTitle>✅ Success</AlertTitle>
                    <AlertDescription>{successMsg}</AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Error Alert */}
              {errorMsg && (
                <div className="mb-6">
                  <Alert variant="destructive">
                    <AlertTitle>⚠️ Error</AlertTitle>
                    <AlertDescription>{errorMsg}</AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Form */}
              <form onSubmit={onSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
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
                  <Label htmlFor="confirm">Confirm Password</Label>
                  <Input
                    id="confirm"
                    type="password"
                    placeholder="Re-enter your password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>

                {/* Token warning */}
                {!token && (
                  <div className="border-l-[4px] border-[#FF0000] bg-[#FF0000]/10 px-3 py-2">
                    <p className="text-xs font-bold uppercase text-[#FF0000]">
                      ⚠️ Missing reset token. Please use the link from your email.
                    </p>
                  </div>
                )}

                {/* Submit button */}
                <div className="pt-2">
                  <Button type="submit" disabled={submitting || !token} className="w-full">
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#FFF500] border-t-transparent" />
                        Resetting...
                      </span>
                    ) : (
                      "Reset Password →"
                    )}
                  </Button>
                </div>
              </form>

              {/* Success state - Show sign in link */}
              {successMsg && (
                <div className="mt-6 border-t-[3px] border-black pt-4">
                  <div className="flex items-start gap-3 border-l-[4px] border-[#00FF00] bg-[#00FF00]/10 p-3">
                    <Shield className="h-5 w-5 flex-shrink-0 text-black" />
                    <div>
                      <p className="text-xs font-bold uppercase text-black">
                        Your password has been changed!
                      </p>
                      <p className="mt-1 text-xs font-medium text-black/70">
                        You can now sign in with your new password.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Back to sign in link */}
          <div className="mt-6 text-center">
            <Link 
              to="/auth"
              className="inline-flex items-center gap-2 border-[3px] border-black bg-white px-4 py-2 font-bold uppercase text-black shadow-[4px_4px_0px_0px_#000000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#000000]"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}