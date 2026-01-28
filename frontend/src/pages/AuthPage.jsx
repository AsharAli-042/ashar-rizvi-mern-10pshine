import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/useAuth";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

export default function AuthPage() {
  const { isAuthenticated, login, register, authMessage, setAuthMessage } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = useMemo(() => location.state?.from || "/dashboard", [location.state]);

  const [tab, setTab] = useState("login");

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form
  const [name, setName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard");
  }, [isAuthenticated, navigate]);

  async function onSubmitLogin(e) {
    e.preventDefault();
    setErrorMsg("");
    if (!isValidEmail(loginEmail)) return setErrorMsg("Please enter a valid email.");
    if (!loginPassword) return setErrorMsg("Please enter your password.");

    setLoading(true);
    try {
      await login({ email: loginEmail.trim(), password: loginPassword });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setErrorMsg(err?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  async function onSubmitRegister(e) {
    e.preventDefault();
    setErrorMsg("");
    if (!name.trim()) return setErrorMsg("Please enter your name.");
    if (!isValidEmail(regEmail)) return setErrorMsg("Please enter a valid email.");
    if (!regPassword || regPassword.length < 8) {
      return setErrorMsg("Password must be at least 8 characters.");
    }

    setLoading(true);
    try {
      await register({ name: name.trim(), email: regEmail.trim(), password: regPassword });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setErrorMsg(err?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      {/* Sleek background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-slate-50" />
        <div className="absolute left-1/2 top-[-160px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-gradient-to-br from-slate-200 to-slate-50 blur-3xl" />
        <div className="absolute right-[-120px] top-[120px] h-[360px] w-[360px] rounded-full bg-gradient-to-br from-slate-200 to-slate-50 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-8 lg:grid-cols-2">
        {/* Left marketing panel */}
        <div className="hidden lg:block">
          <h1 className="text-3xl font-semibold tracking-tight">
            10Pearls Shine — Notes
          </h1>
          <p className="mt-3 text-slate-600">
            A clean, focused notes app with secure auth and a smooth writing experience.
          </p>

          <div className="mt-6 rounded-xl border border-slate-200 bg-white/60 p-5 backdrop-blur">
            <div className="text-sm font-medium text-slate-900">What you get</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li>• Secure JWT auth + session expiry handling</li>
              <li>• Fast notes workflow (Dashboard → Editor)</li>
              <li>• Rich text editor content stored as string</li>
            </ul>
          </div>
        </div>

        {/* Auth card */}
        <Card className="mx-auto w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>
              Login or create a new account to continue.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Contract: show session expired message */}
            {authMessage ? (
              <div className="mb-4">
                <Alert>
                  <AlertTitle>Notice</AlertTitle>
                  <AlertDescription>{authMessage}</AlertDescription>
                </Alert>
                <div className="mt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setAuthMessage("")}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            ) : null}

            {errorMsg ? (
              <div className="mb-4">
                <Alert variant="destructive">
                  <AlertTitle>Something went wrong</AlertTitle>
                  <AlertDescription>{errorMsg}</AlertDescription>
                </Alert>
              </div>
            ) : null}

            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={onSubmitLogin} className="space-y-4" noValidate>
                  <div className="space-y-2">
                    <Label htmlFor="loginEmail">Email</Label>
                    <Input
                      id="loginEmail"
                      type="email"
                      placeholder="you@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="loginPassword">Password</Label>
                    <Input
                      id="loginPassword"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Link
                      to="/forgot-password"
                      className="text-sm text-slate-700 underline underline-offset-4 hover:text-slate-900"
                    >
                      Forgot password?
                    </Link>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Signing in..." : "Sign in"}
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={onSubmitRegister} className="space-y-4" noValidate>
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Ashar Ali"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="regEmail">Email</Label>
                    <Input
                      id="regEmail"
                      type="email"
                      placeholder="you@example.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="regPassword">Password</Label>
                    <Input
                      id="regPassword"
                      type="password"
                      placeholder="At least 8 characters"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                    <p className="text-xs text-slate-500">
                      Use 8+ characters for best security.
                    </p>
                  </div>

                  <div className="flex items-center justify-end">
                    <Button type="submit" disabled={loading}>
                      {loading ? "Creating..." : "Create account"}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>

            <p className="mt-6 text-center text-xs text-slate-500">
              By continuing, you agree to use this app responsibly.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
