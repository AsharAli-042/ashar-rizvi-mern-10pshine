import { Link } from "react-router-dom";
import { useState } from "react";
import { authApi } from "../api/auth.api";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { ArrowLeft, Mail, Sun } from "lucide-react";
import { useEffect } from "react";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    document.title = "Forgot Password";
  }, []);

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
    <div className="relative min-h-screen overflow-hidden bg-[#FFF500] p-6">
      {/* Simplified background patterns - subtle */}
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
          {/* Logo/Brand at top */}
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
                  Password Reset
                </p>
              </div>
            </div>
          </div>

          {/* Main card - reduced shadow */}
          <Card className="border-[4px] border-black bg-white shadow-[6px_6px_0px_0px_#000000]">
            <CardHeader className="border-b-[3px] border-black">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center border-[3px] border-black bg-[#FFD6E8]">
                  <Mail className="h-6 w-6 text-black" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold uppercase">Forgot Password</CardTitle>
                  <CardDescription className="mt-1 text-sm font-medium text-black/70">
                    We'll send you a reset link
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {done ? (
                <div className="mb-6">
                  <Alert variant="success">
                    <AlertTitle>✅ Request Received</AlertTitle>
                    <AlertDescription>
                      If the email exists, you'll receive a reset link shortly. Check your inbox!
                    </AlertDescription>
                  </Alert>
                </div>
              ) : null}

              <form onSubmit={onSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" disabled={submitting} className="w-full">
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#FFF500] border-t-transparent" />
                        Sending...
                      </span>
                    ) : (
                      "Send Reset Link →"
                    )}
                  </Button>
                </div>
              </form>

              {/* Helpful tip - pastel background */}
              <div className="mt-6 border-t-[3px] border-black pt-4">
                <div className="flex items-start gap-3 border-l-[4px] border-black bg-[#B4E4FF] p-3">
                  <span className="text-lg">💡</span>
                  <div>
                    <p className="text-xs font-bold uppercase text-black">
                      Tip: Check your spam folder
                    </p>
                    <p className="mt-1 text-xs font-medium text-black/80">
                      Reset emails sometimes end up in spam.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Back to login link - reduced shadow */}
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