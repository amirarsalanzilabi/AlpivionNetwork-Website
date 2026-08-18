import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusButton } from "@/components/StatusButton";
import { Loader2, Camera, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useInlineStatus } from "@/hooks/useInlineStatus";

const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

const Account = () => {
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const avatarStatus = useInlineStatus();
  const emailStatus = useInlineStatus();
  const passwordStatus = useInlineStatus();

  const [newEmail, setNewEmail] = useState("");
  const [emailSentTo, setEmailSentTo] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    document.title = "Account Settings | Alpivion Network";
  }, []);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [loading, user, navigate]);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user) return;

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      avatarStatus.fail("Must be a JPEG, PNG, or WebP photo — GIFs and videos aren't allowed.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      avatarStatus.fail("File must be under 5MB.");
      return;
    }

    avatarStatus.start();
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (uploadError) {
      avatarStatus.fail(uploadError.message);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(path);
    // Cache-bust so the new image shows immediately instead of a stale cached one.
    const avatarUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("id", user.id);

    if (updateError) {
      avatarStatus.fail(updateError.message);
    } else {
      await refreshProfile();
      avatarStatus.succeed();
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newEmail.trim().toLowerCase() === user.email?.toLowerCase()) {
      emailStatus.fail("That's already your email — enter a different address.");
      return;
    }

    emailStatus.start();
    const { error } = await supabase.auth.updateUser({ email: newEmail });

    if (error) {
      emailStatus.fail(error.message);
    } else {
      setEmailSentTo(newEmail);
      setNewEmail("");
      emailStatus.succeed();
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      passwordStatus.fail("Passwords don't match.");
      return;
    }

    passwordStatus.start();
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      passwordStatus.fail(error.message);
    } else {
      setNewPassword("");
      setConfirmPassword("");
      passwordStatus.succeed();
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  const displayName = profile?.username ?? user.email;
  const initial = displayName?.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">Your Account</span>
            <h1 className="font-display text-4xl font-bold text-foreground mt-2">Account Settings</h1>
          </div>

          {/* Profile */}
          <Card className="glass-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Profile</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile?.avatar_url ?? undefined} alt={displayName} />
                  <AvatarFallback className="bg-primary/20 text-primary text-2xl">{initial}</AvatarFallback>
                </Avatar>
                <button
                  onClick={handleAvatarClick}
                  disabled={avatarStatus.status === "loading"}
                  className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    avatarStatus.status === "success"
                      ? "bg-emerald-500 text-white"
                      : "bg-primary text-primary-foreground hover:opacity-90"
                  }`}
                  aria-label="Change profile picture"
                >
                  {avatarStatus.status === "loading" && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {avatarStatus.status === "success" && <Check className="w-3.5 h-3.5" />}
                  {(avatarStatus.status === "idle" || avatarStatus.status === "error") && <Camera className="w-3.5 h-3.5" />}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">{profile?.username ?? "—"}</p>
                <p className="text-sm text-muted-foreground">
                  Joined {profile ? formatDate(profile.created_at) : "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, or WebP · up to 5MB</p>
                {avatarStatus.status === "error" && (
                  <p className="text-xs text-destructive mt-1">{avatarStatus.error}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Email */}
          <Card className="glass-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Email</CardTitle>
              <CardDescription>Currently: {user.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateEmail} className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="new@email.com"
                  className="flex-1"
                />
                <StatusButton
                  type="submit"
                  variant="heroOutline"
                  status={emailStatus.status}
                  idleLabel="Update Email"
                  successLabel="Sent"
                />
              </form>
              {emailStatus.status === "error" && (
                <p className="text-sm text-destructive mt-2">{emailStatus.error}</p>
              )}
              {emailStatus.status === "success" && (
                <p className="text-sm text-muted-foreground mt-2">
                  Check <span className="text-foreground">{emailSentTo}</span> to confirm the change.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Password */}
          <Card className="glass-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Password</CardTitle>
              <CardDescription>Choose a new password for your account.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword} className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <Input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password"
                  />
                  <Input
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
                  variant="heroOutline"
                  status={passwordStatus.status}
                  idleLabel="Update Password"
                  successLabel="Updated"
                />
                {passwordStatus.status === "error" && (
                  <p className="text-sm text-destructive">{passwordStatus.error}</p>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Account;
