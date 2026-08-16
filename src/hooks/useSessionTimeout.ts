import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const TIMEOUT_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds
const WARNING_DURATION = 60 * 1000; // Show warning 1 minute before timeout

export const useSessionTimeout = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const hasWarnedRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
      warningRef.current = null;
    }
    hasWarnedRef.current = false;
  }, []);

  const handleSignOut = useCallback(async () => {
    clearTimers();
    toast({
      title: "Session Expired",
      description: "You've been signed out due to inactivity.",
      variant: "destructive",
    });
    await signOut();
  }, [signOut, toast, clearTimers]);

  const showWarning = useCallback(() => {
    if (!hasWarnedRef.current) {
      hasWarnedRef.current = true;
      toast({
        title: "Session Expiring Soon",
        description: "You'll be signed out in 1 minute due to inactivity. Move your mouse or press a key to stay signed in.",
      });
    }
  }, [toast]);

  const resetTimer = useCallback(() => {
    if (!user) return;

    clearTimers();
    hasWarnedRef.current = false;

    // Set warning timer (1 minute before timeout)
    warningRef.current = setTimeout(() => {
      showWarning();
    }, TIMEOUT_DURATION - WARNING_DURATION);

    // Set logout timer
    timeoutRef.current = setTimeout(() => {
      handleSignOut();
    }, TIMEOUT_DURATION);
  }, [user, clearTimers, showWarning, handleSignOut]);

  useEffect(() => {
    if (!user) {
      clearTimers();
      return;
    }

    // Activity events to track
    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"];

    // Throttle to prevent too many resets
    let lastReset = Date.now();
    const throttledReset = () => {
      const now = Date.now();
      if (now - lastReset > 1000) { // Only reset if more than 1 second has passed
        lastReset = now;
        resetTimer();
      }
    };

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, throttledReset, { passive: true });
    });

    // Handle tab visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && user) {
        resetTimer();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Handle browser/tab close - clear session
    const handleBeforeUnload = () => {
      // Mark session for cleanup on page unload
      sessionStorage.setItem("session_ended", "true");
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Start the timer
    resetTimer();

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, throttledReset);
      });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      clearTimers();
    };
  }, [user, resetTimer, clearTimers]);

  return null;
};
