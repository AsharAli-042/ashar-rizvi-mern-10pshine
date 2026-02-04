import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/useAuth";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Sun, Zap, Shield, Share2 } from "lucide-react";

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
    <div className="relative min-h-screen overflow-hidden bg-[#FFF500] p-6 lg:p-8">
      {/* Simplified background patterns - less busy */}
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

      <div className="relative mx-auto max-w-7xl">
        {/* Logo at the very top - centered */}
        <div className="mb-8 text-center lg:mb-12">
          <div className="inline-flex items-center gap-4 border-[4px] border-black bg-white p-6 shadow-[8px_8px_0px_0px_#000000]">
            <div className="flex h-16 w-16 items-center justify-center border-[3px] border-black bg-[#FFF500]">
              <Sun className="h-10 w-10 text-black animate-[spin_20s_linear_infinite]" />
            </div>
            <div>
              <h1 className="text-4xl font-bold uppercase tracking-tight text-black">
                Solar Notes
              </h1>
              <p className="mt-1 text-sm font-bold uppercase text-black/70">
                Bright Ideas, Organized
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 lg:items-start">
          {/* Left side - Simplified to 3 feature cards */}
          <div className="flex flex-col gap-6">
            {/* Tagline */}
            <div className="border-l-[6px] border-black bg-white p-6 shadow-[4px_4px_0px_0px_#000000]">
              <p className="text-xl font-bold text-black leading-relaxed">
                A focused notes workspace for teams and professionals — fast, templated, and easy to share.
              </p>
            </div>

            {/* Feature cards - Pastel colors with reduced shadows */}
            <div className="space-y-4">
              <div className="group border-[3px] border-black bg-[#B4E4FF] p-5 shadow-[4px_4px_0px_0px_#000000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_0px_#000000]">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center border-[3px] border-black bg-black">
                    <Zap className="h-6 w-6 text-[#B4E4FF]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold uppercase text-black">Built for Work</h3>
                    <p className="mt-1 text-sm font-medium text-black/80">
                      Organize meetings, capture reflections, and share action items.
                    </p>
                  </div>
                </div>
              </div>

              <div className="group border-[3px] border-black bg-[#FFD6E8] p-5 shadow-[4px_4px_0px_0px_#000000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_0px_#000000]">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center border-[3px] border-black bg-black">
                    <Share2 className="h-6 w-6 text-[#FFD6E8]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold uppercase text-black">Simple Sharing</h3>
                    <p className="mt-1 text-sm font-medium text-black/80">
                      Access your notes from any device with quick workflows.
                    </p>
                  </div>
                </div>
              </div>

              <div className="group border-[3px] border-black bg-[#FFE5B4] p-5 shadow-[4px_4px_0px_0px_#000000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_0px_#000000]">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center border-[3px] border-black bg-black">
                    <Shield className="h-6 w-6 text-[#FFE5B4]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold uppercase text-black">Secure by Default</h3>
                    <p className="mt-1 text-sm font-medium text-black/80">
                      Safe server storage so your team's data remains private.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right auth card - Aligned with left content */}
          <div className="flex flex-col">
            <Card className="border-[4px] border-black bg-white shadow-[8px_8px_0px_0px_#000000]">
              <CardHeader className="border-b-[3px] border-black">
                <div className="text-center">
                  <CardTitle className="text-2xl font-bold uppercase">
                    {tab === "login" ? "Welcome Back" : "Get Started"}
                  </CardTitle>
                  <CardDescription className="mt-2 text-sm font-medium text-black/70">
                    {tab === "login"
                      ? "Sign in to Solar Notes to access your workspace."
                      : "Create an account to start saving and organizing notes."}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="p-6">
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
                      <AlertTitle>⚠️ Error</AlertTitle>
                      <AlertDescription>{errorMsg}</AlertDescription>
                    </Alert>
                  </div>
                ) : null}

                <Tabs value={tab} onValueChange={setTab}>
                  <TabsList className="w-full">
                    <TabsTrigger value="login" className="flex-1">Login</TabsTrigger>
                    <TabsTrigger value="register" className="flex-1">Sign Up</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <form onSubmit={onSubmitLogin} className="space-y-5">
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

                      <div className="flex items-center justify-between gap-4 pt-2">
                        <Link 
                          to="/forgot-password" 
                          className="text-sm font-bold uppercase text-black underline decoration-[2px] decoration-black underline-offset-4 transition-colors hover:text-black/70"
                        >
                          Forgot Password?
                        </Link>
                        <Button type="submit" disabled={loading}>
                          {loading ? "Signing in..." : "Sign in →"}
                        </Button>
                      </div>
                    </form>
                  </TabsContent>

                  <TabsContent value="register">
                    <form onSubmit={onSubmitRegister} className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input 
                          id="name" 
                          type="text" 
                          placeholder="Your name" 
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
                        <p className="text-xs font-medium text-black/60">
                          Choose a secure password (8+ characters).
                        </p>
                      </div>

                      <div className="flex items-center justify-end pt-2">
                        <Button type="submit" disabled={loading}>
                          {loading ? "Creating..." : "Create Account →"}
                        </Button>
                      </div>
                    </form>
                  </TabsContent>
                </Tabs>

                <div className="mt-6 border-t-[3px] border-black pt-4">
                  <p className="text-center text-xs font-bold uppercase text-black/60">
                    🔒 Your data is stored securely on our servers
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}