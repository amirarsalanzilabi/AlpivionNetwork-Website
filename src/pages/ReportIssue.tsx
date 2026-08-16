import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plane, Loader2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const issueSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().trim().min(10, "Please describe your issue in at least 10 characters").max(2000, "Description must be less than 2000 characters"),
});

const ReportIssue = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});
  const [dailyCount, setDailyCount] = useState<number | null>(null);
  const [isLoadingCount, setIsLoadingCount] = useState(true);

  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const DAILY_LIMIT = 2;

  useEffect(() => {
    document.title = "Report Issue | Alpivion Network";
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth?mode=signin");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchDailyCount = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase.rpc("get_user_daily_issue_count", {
          p_user_id: user.id,
        });

        if (error) throw error;
        setDailyCount(data ?? 0);
      } catch (err) {
        console.error("Error fetching daily issue count:", err);
        setDailyCount(0);
      } finally {
        setIsLoadingCount(false);
      }
    };

    if (user) {
      fetchDailyCount();
    }
  }, [user]);


  const validateForm = () => {
    const result = issueSchema.safeParse({ name, description });
    
    if (!result.success) {
      const fieldErrors: { name?: string; description?: string } = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof typeof fieldErrors;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (dailyCount !== null && dailyCount >= DAILY_LIMIT) {
      toast({
        title: "Daily limit reached",
        description: "You can only submit 2 issues per day. Please try again tomorrow.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("issues").insert({
        user_id: user!.id,
        name: name.trim(),
        description: description.trim(),
      });

      if (error) throw error;

      toast({
        title: "Issue submitted",
        description: "Thank you for your feedback. We'll review your issue shortly.",
      });

      // Update count and reset form
      setDailyCount((prev) => (prev ?? 0) + 1);
      setName("");
      setDescription("");
    } catch (err) {
      console.error("Error submitting issue:", err);
      toast({
        title: "Submission failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || isLoadingCount) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasReachedLimit = dailyCount !== null && dailyCount >= DAILY_LIMIT;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-24">
        <div className="w-full max-w-lg">
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
            <h1 className="text-2xl font-display font-bold text-foreground">Report an Issue</h1>
            <p className="text-muted-foreground mt-2">
              Let us know about any problems you're experiencing
            </p>
          </div>

          {/* Limit Warning */}
          {hasReachedLimit ? (
            <div className="glass-card rounded-xl p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-display font-bold text-foreground">Daily Limit Reached</h2>
              <p className="text-muted-foreground">
                You've already submitted {DAILY_LIMIT} issues today. Please come back tomorrow to submit more.
              </p>
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="mt-4"
              >
                Return Home
              </Button>
            </div>
          ) : (
            <>
              {/* Remaining submissions notice */}
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground">
                  {DAILY_LIMIT - (dailyCount ?? 0)} submission{DAILY_LIMIT - (dailyCount ?? 0) !== 1 ? "s" : ""} remaining today
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="glass-card rounded-xl p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors({ ...errors, name: undefined });
                    }}
                    className="bg-background/50 border-border"
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Describe Your Issue</Label>
                  <Textarea
                    id="description"
                    placeholder="Please describe the issue you're experiencing in detail..."
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      if (errors.description) setErrors({ ...errors, description: undefined });
                    }}
                    className="bg-background/50 border-border min-h-[150px]"
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description}</p>
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
                      Submitting...
                    </>
                  ) : (
                    "Submit Issue"
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReportIssue;
