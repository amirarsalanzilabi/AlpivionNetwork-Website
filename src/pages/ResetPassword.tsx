import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { StatusButton } from "@/components/StatusButton";
import { Plane, KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useInlineStatus } from "@/hooks/useInlineStatus";

const ResetPassword = () => {
  const navigate = useNavigate();
  const status = useInlineStatus();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    document.title = "Reset Password | Alpivion Network";
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      status.fail("Passwords don't match.");
      return;
    }

    status.start();
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      status.fail(
        /session/i.test(error.message)
          ? "This reset link is invalid or has expired. Request a new one from the sign-in page."
          : error.message,
      );
    } else {
      status.succeed();
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
            <CardContent className="pt-6 space-y-4">
              {status.status === "success" ? (
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <KeyRound className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Password updated</CardTitle>
                  <CardDescription>You're all set — continue on to the site.</CardDescription>
                  <Button variant="hero" className="w-full" onClick={() => navigate("/")}>
                    Continue
                  </Button>
                </div>
              ) : (
                <>
                  <CardTitle className="text-xl">Choose a new password</CardTitle>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reset-password">New password</Label>
                      <Input
                        id="reset-password"
                        type="password"
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reset-confirm">Confirm password</Label>
                      <Input
                        id="reset-confirm"
                        type="password"
                        required
                        minLength={6}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                      />
                    </div>
                    <StatusButton
                      type="submit"
                      variant="hero"
                      className="w-full"
                      status={status.status}
                      idleLabel="Update Password"
                      successLabel="Updated"
                    />
                    {status.status === "error" && <p className="text-sm text-destructive">{status.error}</p>}
                  </form>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ResetPassword;
