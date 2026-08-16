import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, User, Clock, MessageSquare, AlertTriangle } from "lucide-react";
import { format, differenceInSeconds } from "date-fns";

const DAILY_COMMENT_LIMIT = 20;
const COOLDOWN_SECONDS = 60; // 1 minute between comments

interface Thread {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user_id: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
}

const ThreadDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [thread, setThread] = useState<Thread | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Spam protection state
  const [dailyCount, setDailyCount] = useState<number | null>(null);
  const [lastCommentTime, setLastCommentTime] = useState<Date | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [isLoadingLimits, setIsLoadingLimits] = useState(true);

  useEffect(() => {
    if (id) {
      fetchThread();
      fetchComments();
    }
  }, [id]);

  useEffect(() => {
    if (thread) {
      document.title = `${thread.title} | Alpivion Network`;
    }
  }, [thread]);

  // Fetch spam protection limits
  const fetchUserLimits = useCallback(async () => {
    if (!user) {
      setIsLoadingLimits(false);
      return;
    }

    setIsLoadingLimits(true);
    try {
      // Fetch daily comment count
      const { data: countData, error: countError } = await supabase.rpc(
        "get_user_daily_comment_count",
        { p_user_id: user.id }
      );

      if (countError) throw countError;
      setDailyCount(countData ?? 0);

      // Fetch last comment time
      const { data: timeData, error: timeError } = await supabase.rpc(
        "get_user_last_comment_time",
        { p_user_id: user.id }
      );

      if (timeError) throw timeError;
      if (timeData) {
        setLastCommentTime(new Date(timeData));
      }
    } catch (error) {
      console.error("Error fetching user limits:", error);
    } finally {
      setIsLoadingLimits(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUserLimits();
  }, [fetchUserLimits]);

  // Cooldown timer
  useEffect(() => {
    if (!lastCommentTime) {
      setCooldownRemaining(0);
      return;
    }

    const calculateRemaining = () => {
      const elapsed = differenceInSeconds(new Date(), lastCommentTime);
      const remaining = Math.max(0, COOLDOWN_SECONDS - elapsed);
      setCooldownRemaining(remaining);
      return remaining;
    };

    calculateRemaining();
    const interval = setInterval(() => {
      if (calculateRemaining() === 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastCommentTime]);

  const fetchThread = async () => {
    try {
      const { data, error } = await supabase
        .from("forum_threads")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setThread(data);
    } catch (error) {
      console.error("Error fetching thread:", error);
      navigate("/forums");
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from("forum_comments")
        .select("id, thread_id, content, created_at")
        .eq("thread_id", id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const formatCooldown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    }
    return `${secs}s`;
  };

  const canComment = dailyCount !== null && dailyCount < DAILY_COMMENT_LIMIT && cooldownRemaining === 0;
  const remainingComments = dailyCount !== null ? DAILY_COMMENT_LIMIT - dailyCount : DAILY_COMMENT_LIMIT;

  const handleSubmitComment = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (!commentContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter a comment.",
        variant: "destructive",
      });
      return;
    }

    // Check limits before submitting
    if (dailyCount !== null && dailyCount >= DAILY_COMMENT_LIMIT) {
      toast({
        title: "Daily limit reached",
        description: `You can only post ${DAILY_COMMENT_LIMIT} comments per day.`,
        variant: "destructive",
      });
      return;
    }

    if (cooldownRemaining > 0) {
      toast({
        title: "Please wait",
        description: `You can post another comment in ${formatCooldown(cooldownRemaining)}.`,
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      // Insert the comment
      const { error } = await supabase.from("forum_comments").insert({
        thread_id: id,
        user_id: user.id,
        content: commentContent.trim(),
      });

      if (error) throw error;

      // Record rate limit entry (persists even if comment is deleted)
      await supabase.from("forum_rate_limits").insert({
        user_id: user.id,
        action_type: "comment",
      });

      toast({
        title: "Comment posted",
        description: "Your comment has been added successfully.",
      });

      setCommentContent("");
      
      // Update local state
      setDailyCount((prev) => (prev ?? 0) + 1);
      setLastCommentTime(new Date());
      
      fetchComments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to post comment.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-24">
          <p className="text-muted-foreground text-center">Loading thread...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-24">
          <p className="text-muted-foreground text-center">Thread not found.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        {/* Back button */}
        <Link
          to="/forums"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Forums
        </Link>

        {/* Thread */}
        <Card className="bg-card/50 border-border backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="font-display text-2xl md:text-3xl text-foreground">
              {thread.title}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>Pilot</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{format(new Date(thread.created_at), "MMM d, yyyy 'at' h:mm a")}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-foreground whitespace-pre-wrap">{thread.content}</p>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <div className="space-y-6">
          <h2 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Comments ({comments.length})
          </h2>

          {/* Comment Form */}
          {user ? (
            <Card className="bg-card/50 border-border backdrop-blur-sm">
              <CardContent className="pt-6">
                {/* Spam protection info */}
                {!isLoadingLimits && (
                  <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-muted-foreground">
                    <span>
                      Comments today: <span className={remainingComments <= 3 ? "text-amber-400" : "text-foreground"}>{dailyCount ?? 0}/{DAILY_COMMENT_LIMIT}</span>
                    </span>
                    {cooldownRemaining > 0 && (
                      <span className="flex items-center gap-1 text-amber-400">
                        <AlertTriangle className="w-3 h-3" />
                        Wait {formatCooldown(cooldownRemaining)}
                      </span>
                    )}
                  </div>
                )}

                <Textarea
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="Write a comment..."
                  className="bg-background border-border min-h-[100px] mb-4"
                  maxLength={2000}
                  disabled={!canComment || isLoadingLimits}
                />
                <Button
                  onClick={handleSubmitComment}
                  disabled={submitting || !canComment || isLoadingLimits}
                  variant="hero"
                >
                  {submitting
                    ? "Posting..."
                    : cooldownRemaining > 0
                    ? `Wait ${formatCooldown(cooldownRemaining)}`
                    : dailyCount !== null && dailyCount >= DAILY_COMMENT_LIMIT
                    ? "Daily limit reached"
                    : "Post Comment"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card/50 border-border backdrop-blur-sm">
              <CardContent className="py-6 text-center">
                <p className="text-muted-foreground mb-4">Sign in to leave a comment</p>
                <Button variant="hero" onClick={() => navigate("/auth")}>
                  Sign In
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Comments List */}
          {comments.length === 0 ? (
            <Card className="bg-card/30 border-border backdrop-blur-sm">
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <Card key={comment.id} className="bg-card/30 border-border backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>Pilot</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{format(new Date(comment.created_at), "MMM d, yyyy 'at' h:mm a")}</span>
                      </div>
                    </div>
                    <p className="text-foreground whitespace-pre-wrap">{comment.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ThreadDetail;
