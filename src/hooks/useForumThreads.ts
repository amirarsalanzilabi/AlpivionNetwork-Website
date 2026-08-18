import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ForumThread {
  id: string;
  user_id: string;
  title: string;
  body: string;
  reply_count: number;
  created_at: string;
  profiles: { username: string } | null;
}

export const DAILY_THREAD_LIMIT = 5;
export const THREAD_COOLDOWN_MS = 5 * 60 * 1000;

export const useForumThreads = () => {
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchThreads = useCallback(async () => {
    const { data } = await supabase
      .from("forum_threads")
      .select("*, profiles(username)")
      .order("created_at", { ascending: false });
    setThreads((data as ForumThread[]) ?? []);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchThreads().finally(() => setLoading(false));
  }, [fetchThreads]);

  const myRecentThreads = useMemo(
    () => (user ? threads.filter((t) => t.user_id === user.id) : []),
    [threads, user],
  );

  const myThreadsLast24h = useMemo(
    () => myRecentThreads.filter((t) => Date.now() - new Date(t.created_at).getTime() < 24 * 60 * 60 * 1000),
    [myRecentThreads],
  );

  const nextAllowedAt = useMemo(() => {
    if (myRecentThreads.length === 0) return undefined;
    const lastCreatedAt = Math.max(...myRecentThreads.map((t) => new Date(t.created_at).getTime()));
    return lastCreatedAt + THREAD_COOLDOWN_MS;
  }, [myRecentThreads]);

  const dailyLimitReached = myThreadsLast24h.length >= DAILY_THREAD_LIMIT;

  const createThread = async (title: string, body: string) => {
    if (!user) return { data: null, error: new Error("Not signed in") };

    const { data, error } = await supabase
      .from("forum_threads")
      .insert({ user_id: user.id, title, body })
      .select("*, profiles(username)")
      .single();

    if (!error && data) {
      setThreads((prev) => [data as ForumThread, ...prev]);
    }
    return { data, error };
  };

  return {
    threads,
    loading,
    createThread,
    dailyLimitReached,
    nextAllowedAt,
    threadsUsedToday: myThreadsLast24h.length,
    dailyLimit: DAILY_THREAD_LIMIT,
  };
};
