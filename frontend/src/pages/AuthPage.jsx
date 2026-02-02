import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/useAuth";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Sun } from "lucide-react";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

export default function AuthPage() {
  const { isAuthenticated, login, register, authMessage, setAuthMessage } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.title = "Solar Notes — Sign in";
  }, []);

  const redirectTo = useMemo(() => location.state?.from || "/dashboard", [location.state]);

  const [tab, setTab] = useState("login");

  // Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left branding panel */}
          <div className="hidden flex-col gap-6 rounded-2xl p-8 lg:flex" style={{ background: "linear-gradient(180deg,#f8fafc,#eef2ff)" }}>
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-lg border-4 border-black bg-white">
                <Sun className="h-7 w-7 text-amber-400" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight">Solar Notes</h2>
                <p className="mt-1 text-sm text-slate-600 max-w-sm">A focused notes workspace for teams and professionals — fast, templated, and easy to share.</p>
              </div>
            </div>

            <div className="mt-3 space-y-4">
              <div className="rounded-xl border-4 border-black bg-white p-4">
                <h4 className="text-sm font-semibold">Built for work</h4>
                <p className="mt-1 text-xs text-slate-600">Organize meetings, capture reflections, and share action items — templates included.</p>
              </div>

              <div className="rounded-xl border-4 border-black bg-white p-4">
                <h4 className="text-sm font-semibold">Simple sharing</h4>
                <p className="mt-1 text-xs text-slate-600">Access your notes from any device — polished editor and quick workflows.</p>
              </div>

              <div className="rounded-xl border-4 border-black bg-white p-4">
                <h4 className="text-sm font-semibold">Secure by default</h4>
                <p className="mt-1 text-xs text-slate-600">Safe server storage with session handling so your team's data remains private.</p>
              </div>
            </div>

          </div>

          {/* Right auth card — larger and centered */}
          <div className="flex items-center justify-center">
            <Card className="w-full max-w-md">
              <CardHeader>
                <div className="text-center">
                  <CardTitle className="text-xl">{tab === "login" ? "Welcome back" : "Create your account"}</CardTitle>
                  <CardDescription className="mt-1 text-sm text-slate-600">
                    {tab === "login"
                      ? "Sign in to Solar Notes to access your workspace."
                      : "Create an account to start saving and organizing notes."}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="px-6 py-6">
                {authMessage ? (
                  <div className="mb-4">
                    <Alert>
                      <AlertTitle>Notice</AlertTitle>
                      <AlertDescription>{authMessage}</AlertDescription>
                    </Alert>
                    <div className="mt-2">
                      <Button type="button" variant="ghost" size="sm" onClick={() => setAuthMessage("")}>
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
                    <form onSubmit={onSubmitLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="loginEmail">Email</Label>
                        <Input id="loginEmail" type="email" placeholder="you@example.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} autoComplete="email" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="loginPassword">Password</Label>
                        <Input id="loginPassword" type="password" placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} autoComplete="current-password" />
                      </div>

                      <div className="flex items-center justify-between">
                        <Link to="/forgot-password" className="text-sm text-slate-700 underline underline-offset-4 hover:text-slate-900">
                          Forgot password?
                        </Link>
                        <Button type="submit" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</Button>
                      </div>
                    </form>
                  </TabsContent>

                  <TabsContent value="register">
                    <form onSubmit={onSubmitRegister} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="regEmail">Email</Label>
                        <Input id="regEmail" type="email" placeholder="you@example.com" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} autoComplete="email" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="regPassword">Password</Label>
                        <Input id="regPassword" type="password" placeholder="At least 8 characters" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} autoComplete="new-password" />
                        <p className="text-xs text-slate-500">Choose a secure password (8+ characters).</p>
                      </div>

                      <div className="flex items-center justify-end">
                        <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create account"}</Button>
                      </div>
                    </form>
                  </TabsContent>
                </Tabs>

                <p className="mt-6 text-center text-xs text-slate-500">
                  Solar Notes stores your note content on the server so you can access it safely from any device.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
