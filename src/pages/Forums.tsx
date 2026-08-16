import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, MessageSquare, User, Clock, AlertTriangle } from "lucide-react";
import { format, differenceInSeconds } from "date-fns";

const DAILY_THREAD_LIMIT = 5;
const COOLDOWN_SECONDS = 300; // 5 minutes

interface Thread {
  id: string;
  title: string;
  content: string;
  created_at: string;
  comment_count?: number;
}

const Forums = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  
  // Spam protection state
  const [dailyCount, setDailyCount] = useState<number | null>(null);
  const [lastThreadTime, setLastThreadTime] = useState<Date | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [isLoadingLimits, setIsLoadingLimits] = useState(true);

  useEffect(() => {
    document.title = "Forums | Alpivion Network";
    fetchThreads();
  }, []);

  // Fetch spam protection limits
  const fetchUserLimits = useCallback(async () => {
    if (!user) {
      setIsLoadingLimits(false);
      return;
    }

    setIsLoadingLimits(true);
    try {
      // Fetch daily thread count
      const { data: countData, error: countError } = await supabase.rpc(
        "get_user_daily_thread_count",
        { p_user_id: user.id }
      );

      if (countError) throw countError;
      setDailyCount(countData ?? 0);

      // Fetch last thread time
      const { data: timeData, error: timeError } = await supabase.rpc(
        "get_user_last_thread_time",
        { p_user_id: user.id }
      );

      if (timeError) throw timeError;
      if (timeData) {
        setLastThreadTime(new Date(timeData));
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
    if (!lastThreadTime) {
      setCooldownRemaining(0);
      return;
    }

    const calculateRemaining = () => {
      const elapsed = differenceInSeconds(new Date(), lastThreadTime);
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
  }, [lastThreadTime]);

  const fetchThreads = async () => {
    try {
      // Fetch threads
      const { data: threadsData, error: threadsError } = await supabase
        .from("forum_threads")
        .select("id, title, content, created_at")
        .order("created_at", { ascending: false });

      if (threadsError) throw threadsError;

      // Fetch comment counts for each thread
      const { data: commentsData, error: commentsError } = await supabase
        .from("forum_comments")
        .select("thread_id");

      if (commentsError) throw commentsError;

      // Count comments per thread
      const commentCounts: Record<string, number> = {};
      commentsData?.forEach((comment) => {
        commentCounts[comment.thread_id] = (commentCounts[comment.thread_id] || 0) + 1;
      });

      // Merge counts with threads
      const threadsWithCounts = threadsData?.map((thread) => ({
        ...thread,
        comment_count: commentCounts[thread.id] || 0,
      }));

      setThreads(threadsWithCounts || []);
    } catch (error) {
      console.error("Error fetching threads:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCooldown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const canCreateThread = dailyCount !== null && dailyCount < DAILY_THREAD_LIMIT && cooldownRemaining === 0;
  const remainingThreads = dailyCount !== null ? DAILY_THREAD_LIMIT - dailyCount : DAILY_THREAD_LIMIT;

  const handleCreateThread = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (!title.trim() || !content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both title and content.",
        variant: "destructive",
      });
      return;
    }

    // Check limits before submitting
    if (dailyCount !== null && dailyCount >= DAILY_THREAD_LIMIT) {
      toast({
        title: "Daily limit reached",
        description: `You can only create ${DAILY_THREAD_LIMIT} threads per day.`,
        variant: "destructive",
      });
      return;
    }

    if (cooldownRemaining > 0) {
      toast({
        title: "Please wait",
        description: `You can create another thread in ${formatCooldown(cooldownRemaining)}.`,
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      // Insert the thread
      const { error } = await supabase.from("forum_threads").insert({
        user_id: user.id,
        title: title.trim(),
        content: content.trim(),
      });

      if (error) throw error;

      // Record rate limit entry (persists even if thread is deleted)
      await supabase.from("forum_rate_limits").insert({
        user_id: user.id,
        action_type: "thread",
      });

      toast({
        title: "Thread created",
        description: "Your thread has been posted successfully.",
      });

      setTitle("");
      setContent("");
      setDialogOpen(false);
      
      // Update local state
      setDailyCount((prev) => (prev ?? 0) + 1);
      setLastThreadTime(new Date());
      
      fetchThreads();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create thread.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-4xl font-bold text-foreground mb-2">Community Forums</h1>
            <p className="text-muted-foreground">
              Discuss flight simulation, share experiences, and connect with fellow pilots.
            </p>
          </div>
          {user ? (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="hero" size="lg" className="gap-2" disabled={!canCreateThread || isLoadingLimits}>
                  <Plus className="w-5 h-5" />
                  Create Thread
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="font-display text-xl text-foreground">Create New Thread</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  {/* Spam protection info */}
                  <div className="flex flex-col gap-2 p-3 rounded-lg bg-muted/30 border border-border text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Threads remaining today:</span>
                      <span className={`font-medium ${remainingThreads <= 1 ? "text-amber-400" : "text-foreground"}`}>
                        {remainingThreads} / {DAILY_THREAD_LIMIT}
                      </span>
                    </div>
                    {cooldownRemaining > 0 && (
                      <div className="flex items-center gap-2 text-amber-400">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Wait {formatCooldown(cooldownRemaining)} before posting</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-foreground">
                      Title
                    </Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter thread title..."
                      className="bg-background border-border"
                      maxLength={200}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content" className="text-foreground">
                      Content
                    </Label>
                    <Textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Write your thread content..."
                      className="bg-background border-border min-h-[150px]"
                      maxLength={5000}
                    />
                  </div>
                  <Button
                    onClick={handleCreateThread}
                    disabled={creating || !canCreateThread}
                    variant="hero"
                    className="w-full"
                  >
                    {creating ? "Creating..." : cooldownRemaining > 0 ? `Wait ${formatCooldown(cooldownRemaining)}` : "Post Thread"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <Button variant="hero" size="lg" onClick={() => navigate("/auth")} className="gap-2">
              <Plus className="w-5 h-5" />
              Sign in to Create Thread
            </Button>
          )}
        </div>

        {/* User limit info when limits reached */}
        {user && !isLoadingLimits && (!canCreateThread) && (
          <div className="mb-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <p className="text-sm text-amber-200">
              {dailyCount !== null && dailyCount >= DAILY_THREAD_LIMIT
                ? `You've reached your daily limit of ${DAILY_THREAD_LIMIT} threads. Come back tomorrow!`
                : cooldownRemaining > 0
                ? `Please wait ${formatCooldown(cooldownRemaining)} before creating another thread.`
                : ""}
            </p>
          </div>
        )}

        {/* Threads List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading threads...</p>
          </div>
        ) : threads.length === 0 ? (
          <Card className="bg-card/50 border-border backdrop-blur-sm">
            <CardContent className="py-12 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No threads yet</h3>
              <p className="text-muted-foreground">Be the first to start a discussion!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {threads.map((thread) => (
              <Link key={thread.id} to={`/forums/${thread.id}`}>
                <Card className="bg-card/50 border-border backdrop-blur-sm hover:bg-card/70 hover:border-primary/50 transition-all duration-300 cursor-pointer">
                  <CardHeader className="pb-2">
                    <CardTitle className="font-display text-xl text-foreground hover:text-primary transition-colors">
                      {thread.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-2 mb-4">{thread.content}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>Pilot</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{format(new Date(thread.created_at), "MMM d, yyyy")}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{thread.comment_count} comments</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Forums;
