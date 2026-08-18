import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusButton } from "@/components/StatusButton";
import { Loader2, Plane, MailCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useInlineStatus } from "@/hooks/useInlineStatus";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const modeParam = searchParams.get("mode");
  const defaultTab = modeParam === "signup" ? "signup" : "signin";
  const [tab, setTab] = useState(defaultTab);

  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signUpUsername, setSignUpUsername] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [signedUp, setSignedUp] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);
  const [signUpError, setSignUpError] = useState<string | null>(null);

  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const forgotStatus = useInlineStatus();

  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Sign In | Alpivion Network";
  }, []);

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  // Navbar's Sign In / Join Us links only change the ?mode= query param while
  // already on this page, which doesn't remount the component — sync manually.
  useEffect(() => {
    setTab(modeParam === "signup" ? "signup" : "signin");
    setSignedUp(false);
    setSignInError(null);
    setSignUpError(null);
    setShowForgot(false);
  }, [modeParam]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError(null);
    setLoading(true);
    const { error } = await signIn(signInEmail, signInPassword);
    setLoading(false);

    if (error) setSignInError(error.message);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError(null);
    setLoading(true);
    const { error } = await signUp(signUpEmail, signUpPassword, signUpUsername);
    setLoading(false);

    if (error) {
      const isTaken = /duplicate key|already exists/i.test(error.message);
      setSignUpError(isTaken ? "That username is already taken." : error.message);
    } else {
      setSignedUp(true);
    }
  };

  const openForgotPassword = () => {
    setForgotEmail(signInEmail);
    setShowForgot(true);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    forgotStatus.start();
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      forgotStatus.fail(error.message);
    } else {
      forgotStatus.succeed();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-32">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center glow-amber mb-4">
              <Plane className="w-7 h-7 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">Alpivion Network</h1>
          </div>

          <Card className="glass-card border-border">
            {showForgot ? (
              <CardContent className="pt-6 space-y-4">
                {forgotStatus.status === "success" ? (
                  <div className="text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <MailCheck className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">Check your email</CardTitle>
                    <CardDescription>
                      If an account exists for <span className="text-foreground">{forgotEmail}</span>, a password
                      reset link is on its way.
                    </CardDescription>
                    <Button variant="heroOutline" className="w-full" onClick={() => setShowForgot(false)}>
                      Back to Sign In
                    </Button>
                  </div>
                ) : (
                  <>
                    <CardTitle className="text-xl">Reset your password</CardTitle>
                    <CardDescription>We'll email you a link to choose a new one.</CardDescription>
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="forgot-email">Email</Label>
                        <Input
                          id="forgot-email"
                          type="email"
                          required
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="you@example.com"
                        />
                      </div>
                      <StatusButton
                        type="submit"
                        variant="hero"
                        className="w-full"
                        status={forgotStatus.status}
                        idleLabel="Send Reset Link"
                        successLabel="Sent"
                      />
                      {forgotStatus.status === "error" && (
                        <p className="text-sm text-destructive">{forgotStatus.error}</p>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowForgot(false)}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors block mx-auto"
                      >
                        Back to Sign In
                      </button>
                    </form>
                  </>
                )}
              </CardContent>
            ) : signedUp ? (
              <CardContent className="pt-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <MailCheck className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Check your email</CardTitle>
                <CardDescription>
                  We sent a confirmation link to <span className="text-foreground">{signUpEmail}</span>. Click it to
                  activate your account, then sign in.
                </CardDescription>
                <Button variant="heroOutline" className="w-full" onClick={() => { setSignedUp(false); setTab("signin"); }}>
                  Back to Sign In
                </Button>
              </CardContent>
            ) : (
              <Tabs value={tab} onValueChange={setTab}>
                <CardHeader>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>
                </CardHeader>
                <CardContent>
                  <TabsContent value="signin" className="mt-0">
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signin-email">Email</Label>
                        <Input
                          id="signin-email"
                          type="email"
                          required
                          value={signInEmail}
                          onChange={(e) => setSignInEmail(e.target.value)}
                          placeholder="you@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="signin-password">Password</Label>
                          <button
                            type="button"
                            onClick={openForgotPassword}
                            className="text-xs text-muted-foreground hover:text-primary transition-colors"
                          >
                            Forgot password?
                          </button>
                        </div>
                        <Input
                          id="signin-password"
                          type="password"
                          required
                          value={signInPassword}
                          onChange={(e) => setSignInPassword(e.target.value)}
                          placeholder="••••••••"
                        />
                      </div>
                      <Button type="submit" variant="hero" className="w-full" disabled={loading}>
                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Sign In
                      </Button>
                      {signInError && <p className="text-sm text-destructive">{signInError}</p>}
                    </form>
                  </TabsContent>

                  <TabsContent value="signup" className="mt-0">
                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-username">Username</Label>
                        <Input
                          id="signup-username"
                          type="text"
                          required
                          minLength={3}
                          maxLength={20}
                          pattern="[A-Za-z0-9_]+"
                          title="3-20 characters: letters, numbers, and underscores only"
                          value={signUpUsername}
                          onChange={(e) => setSignUpUsername(e.target.value)}
                          placeholder="skypilot42"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          required
                          value={signUpEmail}
                          onChange={(e) => setSignUpEmail(e.target.value)}
                          placeholder="you@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <Input
                          id="signup-password"
                          type="password"
                          required
                          minLength={6}
                          value={signUpPassword}
                          onChange={(e) => setSignUpPassword(e.target.value)}
                          placeholder="At least 6 characters"
                        />
                      </div>
                      <Button type="submit" variant="hero" className="w-full" disabled={loading}>
                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Create Account
                      </Button>
                      {signUpError && <p className="text-sm text-destructive">{signUpError}</p>}
                    </form>
                  </TabsContent>
                </CardContent>
              </Tabs>
            )}
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
