import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plane, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PasswordRequirements } from "@/components/PasswordRequirements";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter")
  .regex(/[a-z]/, "Password must contain at least 1 lowercase letter")
  .regex(/[0-9]/, "Password must contain at least 1 number")
  .regex(/[!@#$%^&*()\-_=+\[\]{}|;:,.<>?]/, "Password must contain at least 1 special character");

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");

  // Sync mode with URL params
  useEffect(() => {
    const urlMode = searchParams.get("mode");
    if (urlMode === "signup") {
      setMode("signup");
    } else if (urlMode === "forgot") {
      setMode("forgot");
    } else {
      setMode("signin");
    }
    // Reset states when mode changes via URL
    setResetEmailSent(false);
    setSignupEmailSent(false);
    setErrors({});
  }, [searchParams]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [signupEmailSent, setSignupEmailSent] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  
  const { signIn, signUp, resendConfirmation, user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    document.title = mode === "signup" ? "Sign Up | Alpivion Network" : mode === "forgot" ? "Reset Password | Alpivion Network" : "Sign In | Alpivion Network";
  }, [mode]);

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  // Countdown timer effect
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const validateForm = (skipPassword = false) => {
    const newErrors: { email?: string; password?: string } = {};
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }
    
    if (!skipPassword) {
      const passwordResult = passwordSchema.safeParse(password);
      if (!passwordResult.success) {
        newErrors.password = passwordResult.error.errors[0].message;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(true)) return;
    
    setIsSubmitting(true);

    try {
      const redirectUrl = "https://alpivionnetwork.com/reset-password";
      
      // Call our edge function to send branded password reset email via Resend
      const { data, error } = await supabase.functions.invoke("send-auth-email", {
        body: { 
          email, 
          redirectUrl 
        },
      });

      if (error) {
        console.error("Password reset error:", error);
        toast({
          title: "Request failed",
          description: "Unable to send reset email. Please try again later.",
          variant: "destructive",
        });
      } else {
        // Just show the confirmation screen - no toast needed since there's inline feedback
        setResetEmailSent(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);

    try {
      if (mode === "signup") {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message === "EMAIL_EXISTS") {
            toast({
              title: "Email already in use",
              description: "This email address is already associated with an existing account. Please sign in or use a different email.",
              variant: "destructive",
              duration: 5000,
            });
          } else if (error.message.includes("rate limit")) {
            toast({
              title: "Too many attempts",
              description: "Email sending limit reached. Please wait a few minutes before trying again.",
              variant: "destructive",
              duration: 5000,
            });
          } else {
            toast({
              title: "Sign up failed",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          setSignupEmailSent(true);
          setResendCountdown(60);
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast({
              title: "Invalid credentials",
              description: "The email or password you entered is incorrect.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Sign in failed",
              description: error.message,
              variant: "destructive",
            });
          }
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-24">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <button 
              onClick={() => navigate("/")}
              className="flex items-center gap-2 mx-auto mb-6 hover:opacity-80 transition-opacity"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center glow-amber">
                <Plane className="w-6 h-6 text-primary" />
              </div>
              <span className="font-display font-bold text-2xl text-foreground">Alpivion Network</span>
            </button>
            <h1 className="text-2xl font-display font-bold text-foreground">
              {mode === "signup" 
                ? "Join Alpivion Network" 
                : mode === "forgot" 
                  ? "Reset Your Password" 
                  : "Welcome Back, Pilot"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {mode === "signup"
                ? "Create your account to join the community"
                : mode === "forgot"
                  ? "Enter your email to receive a reset link"
                  : "Sign in to access your flight dashboard"}
            </p>
          </div>

          {/* Forgot Password Form */}
          {mode === "forgot" && !resetEmailSent && (
            <form onSubmit={handleForgotPassword} className="glass-card rounded-xl p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="pilot@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  className="bg-background/50 border-border"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="hero"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending Reset Link...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>
          )}

          {/* Reset Email Sent Confirmation */}
          {mode === "forgot" && resetEmailSent && (
            <div className="glass-card rounded-xl p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-display font-bold text-foreground">Check Your Email</h2>
              <p className="text-muted-foreground">
                We've sent a password reset link to <span className="text-foreground font-medium">{email}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Didn't receive it? Check your spam folder or{" "}
                <button
                  type="button"
                  onClick={() => setResetEmailSent(false)}
                  className="text-primary hover:underline"
                >
                  try again
                </button>
              </p>
            </div>
          )}

          {/* Signup Email Sent Confirmation */}
          {mode === "signup" && signupEmailSent && (
            <div className="glass-card rounded-xl p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-display font-bold text-foreground">Check Your Email</h2>
              <p className="text-muted-foreground">
                We've sent a confirmation link to <span className="text-foreground font-medium">{email}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Didn't receive it? Check your spam folder or{" "}
                {resendCountdown > 0 ? (
                  <span className="text-muted-foreground">
                    try again in {resendCountdown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={async () => {
                      setIsSubmitting(true);
                      const { error } = await resendConfirmation(email, password);
                      setIsSubmitting(false);
                      if (error) {
                        toast({
                          title: "Failed to resend",
                          description: error.message,
                          variant: "destructive",
                        });
                      } else {
                        setResendCountdown(60);
                        toast({
                          title: "Email sent",
                          description: "A new confirmation email has been sent.",
                        });
                      }
                    }}
                    disabled={isSubmitting}
                    className="text-primary hover:underline disabled:opacity-50"
                  >
                    {isSubmitting ? "Sending..." : "try again"}
                  </button>
                )}
              </p>
            </div>
          )}

          {/* Sign In / Sign Up Form */}
          {mode !== "forgot" && !(mode === "signup" && signupEmailSent) && (
            <form onSubmit={handleSubmit} className="glass-card rounded-xl p-6 space-y-4">

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="pilot@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                className="bg-background/50 border-border"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  className="bg-background/50 border-border"
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
                {mode === "signup" && <PasswordRequirements password={password} />}
              </div>

              {mode === "signin" && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot");
                      setErrors({});
                    }}
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <Button
                type="submit"
                variant="hero"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {mode === "signup" ? "Creating Account..." : "Signing In..."}
                  </>
                ) : mode === "signup" ? (
                  "Create Account"
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          )}

          {/* Toggle */}
          {!(mode === "signup" && signupEmailSent) && (
            <div className="text-center mt-6 space-y-4">
              <p className="text-muted-foreground">
                {mode === "signup" ? (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode("signin");
                        setErrors({});
                        setResetEmailSent(false);
                        setSignupEmailSent(false);
                      }}
                      className="text-primary hover:underline font-medium"
                    >
                      Sign In
                    </button>
                  </>
                ) : mode === "forgot" ? (
                  <>
                    Remember your password?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode("signin");
                        setErrors({});
                        setResetEmailSent(false);
                        setSignupEmailSent(false);
                      }}
                      className="text-primary hover:underline font-medium"
                    >
                      Sign In
                    </button>
                  </>
                ) : (
                  <>
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode("signup");
                        setErrors({});
                        setSignupEmailSent(false);
                      }}
                      className="text-primary hover:underline font-medium"
                    >
                      Create Account
                    </button>
                  </>
                )}
              </p>
              
              {/* Discord CTA */}
              <a
                href="https://discord.gg/Qs7cvhNngZ"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-[#5865F2] hover:text-[#7289DA] transition-colors font-medium"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                Join our Discord Community
              </a>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
