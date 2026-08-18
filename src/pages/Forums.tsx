import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { MessageSquare, Loader2, Plus, Clock } from "lucide-react";
import { useForumThreads } from "@/hooks/useForumThreads";
import { useAuth } from "@/contexts/AuthContext";

const formatRelativeTime = (dateStr: string) => {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const formatCountdown = (msRemaining: number) => {
  const totalSeconds = Math.max(0, Math.ceil(msRemaining / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const Forums = () => {
  const { threads, loading, createThread, dailyLimitReached, nextAllowedAt, threadsUsedToday, dailyLimit } =
    useForumThreads();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    document.title = "Forums | Alpivion Network";
  }, []);

  // Ticks the cooldown countdown once a second.
  useEffect(() => {
    if (!nextAllowedAt || nextAllowedAt <= Date.now()) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [nextAllowedAt]);

  const onCooldown = !!nextAllowedAt && nextAllowedAt > now;
  const canCreate = !dailyLimitReached && !onCooldown;

  const handleNewThreadClick = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setSubmitError(null);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);
    const { error } = await createThread(title, body);
    setSubmitting(false);

    if (error) {
      setSubmitError(error.message);
    } else {
      setTitle("");
      setBody("");
      setDialogOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <span className="text-primary text-sm font-semibold uppercase tracking-wider">Community</span>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-2">Forums</h1>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <Button variant="hero" onClick={handleNewThreadClick} disabled={!!user && !canCreate}>
                <Plus className="w-4 h-4 mr-2" />
                New Thread
              </Button>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start a new thread</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="thread-title">Title</Label>
                    <Input
                      id="thread-title"
                      required
                      minLength={3}
                      maxLength={150}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="What's on your mind?"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="thread-body">Message</Label>
                    <Textarea
                      id="thread-body"
                      required
                      minLength={1}
                      maxLength={5000}
                      rows={6}
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="Share the details..."
                    />
                  </div>
                  {submitError && <p className="text-sm text-destructive">{submitError}</p>}
                  <DialogFooter>
                    <Button type="submit" variant="hero" disabled={submitting}>
                      {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Post Thread
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {user && (dailyLimitReached || onCooldown) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card/50 border border-border rounded-lg px-4 py-3 mb-6">
              <Clock className="w-4 h-4 text-primary shrink-0" />
              {dailyLimitReached ? (
                <span>You've reached today's limit ({threadsUsedToday}/{dailyLimit} threads). Try again tomorrow.</span>
              ) : (
                <span>
                  New thread available in <span className="text-foreground font-medium tabular-nums">{formatCountdown(nextAllowedAt! - now)}</span>
                </span>
              )}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : threads.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No threads yet — be the first to start one.</p>
          ) : (
            <div className="space-y-3">
              {threads.map((thread) => (
                <Link
                  key={thread.id}
                  to={`/forums/${thread.id}`}
                  className="block glass-card rounded-xl p-5 hover-lift"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="text-lg font-semibold text-foreground truncate">{thread.title}</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        {thread.profiles?.username ?? "Unknown"} · {formatRelativeTime(thread.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground text-sm shrink-0">
                      <MessageSquare className="w-4 h-4" />
                      {thread.reply_count}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Forums;
