import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Thread {
  id: string;
  title: string;
  body: string;
  created_at: string;
  profiles: { username: string } | null;
}

interface Reply {
  id: string;
  user_id: string;
  body: string;
  created_at: string;
  profiles: { username: string } | null;
}

const formatDateTime = (dateStr: string) =>
  new Date(dateStr).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });

const ThreadDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [thread, setThread] = useState<Thread | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyBody, setReplyBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchThread = useCallback(async () => {
    if (!id) return;
    const [{ data: threadData }, { data: replyData }] = await Promise.all([
      supabase.from("forum_threads").select("*, profiles(username)").eq("id", id).maybeSingle(),
      supabase.from("forum_replies").select("*, profiles(username)").eq("thread_id", id).order("created_at", { ascending: true }),
    ]);
    setThread((threadData as Thread) ?? null);
    setReplies((replyData as Reply[]) ?? []);
  }, [id]);

  useEffect(() => {
    setLoading(true);
    fetchThread().finally(() => setLoading(false));
  }, [fetchThread]);

  useEffect(() => {
    document.title = thread ? `${thread.title} | Alpivion Network` : "Forums | Alpivion Network";
  }, [thread]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;

    setSubmitting(true);
    const { error } = await supabase.from("forum_replies").insert({ thread_id: id, user_id: user.id, body: replyBody });
    setSubmitting(false);

    if (error) {
      toast({ title: "Couldn't post reply", description: error.message, variant: "destructive" });
    } else {
      setReplyBody("");
      fetchThread();
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    setDeletingId(replyId);
    const { error } = await supabase.from("forum_replies").delete().eq("id", replyId);
    setDeletingId(null);

    if (error) {
      toast({ title: "Couldn't delete reply", description: error.message, variant: "destructive" });
    } else {
      setReplies((prev) => prev.filter((r) => r.id !== replyId));
    }
  };

  if (loading) {
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

  if (!thread) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-32 text-center">
          <p className="text-muted-foreground">This thread doesn't exist.</p>
          <Link to="/forums" className="text-primary hover:underline mt-4 inline-block">
            Back to Forums
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-3xl mx-auto">
          <Link to="/forums" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Forums
          </Link>

          <div className="glass-card rounded-xl p-6 mb-6">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">{thread.title}</h1>
            <p className="text-sm text-muted-foreground mb-4">
              {thread.profiles?.username ?? "Unknown"} · {formatDateTime(thread.created_at)}
            </p>
            <p className="text-foreground whitespace-pre-wrap">{thread.body}</p>
          </div>

          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            {replies.length} {replies.length === 1 ? "Reply" : "Replies"}
          </h2>

          <div className="space-y-3 mb-8">
            {replies.map((reply) => (
              <div key={reply.id} className="glass-card rounded-xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    {reply.profiles?.username ?? "Unknown"} · {formatDateTime(reply.created_at)}
                  </p>
                  {user?.id === reply.user_id && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                          disabled={deletingId === reply.id}
                          aria-label="Delete reply"
                        >
                          {deletingId === reply.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this reply?</AlertDialogTitle>
                          <AlertDialogDescription>This can't be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteReply(reply.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
                <p className="text-foreground whitespace-pre-wrap">{reply.body}</p>
              </div>
            ))}
          </div>

          {user ? (
            <form onSubmit={handleReply} className="space-y-3">
              <Textarea
                required
                minLength={1}
                maxLength={5000}
                rows={4}
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder="Write a reply..."
              />
              <Button type="submit" variant="hero" disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Post Reply
              </Button>
            </form>
          ) : (
            <div className="glass-card rounded-xl p-6 text-center">
              <p className="text-muted-foreground mb-4">Sign in to join the conversation.</p>
              <Button variant="hero" onClick={() => navigate("/auth")}>
                Sign In
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ThreadDetail;
