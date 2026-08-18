import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

const Account = () => {
  const { user, profile, loading, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

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
      toast({
        title: "Unsupported file type",
        description: "Profile pictures must be a JPEG, PNG, or WebP photo — GIFs and videos aren't allowed.",
        variant: "destructive",
      });
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast({ title: "File too large", description: "Profile pictures must be under 5MB.", variant: "destructive" });
      return;
    }

    setUploadingAvatar(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (uploadError) {
      setUploadingAvatar(false);
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      return;
    }

    const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(path);
    // Cache-bust so the new image shows immediately instead of a stale cached one.
    const avatarUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("id", user.id);
    setUploadingAvatar(false);

    if (updateError) {
      toast({ title: "Couldn't save profile picture", description: updateError.message, variant: "destructive" });
    } else {
      await refreshProfile();
      toast({ title: "Profile picture updated" });
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailSubmitting(true);
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    setEmailSubmitting(false);

    if (error) {
      toast({ title: "Couldn't update email", description: error.message, variant: "destructive" });
    } else {
      setNewEmail("");
      toast({ title: "Confirmation sent", description: "Check your new email address to confirm the change." });
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }

    setPasswordSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordSubmitting(false);

    if (error) {
      toast({ title: "Couldn't update password", description: error.message, variant: "destructive" });
    } else {
      setNewPassword("");
      setConfirmPassword("");
      toast({ title: "Password updated" });
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
                  disabled={uploadingAvatar}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity"
                  aria-label="Change profile picture"
                >
                  {uploadingAvatar ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
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
                <Button type="submit" variant="heroOutline" disabled={emailSubmitting}>
                  {emailSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Update Email
                </Button>
              </form>
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
                <Button type="submit" variant="heroOutline" disabled={passwordSubmitting}>
                  {passwordSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Update Password
                </Button>
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
