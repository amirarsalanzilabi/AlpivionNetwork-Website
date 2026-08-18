import { useCallback, useEffect, useRef, useState } from "react";

export type InlineStatus = "idle" | "loading" | "success" | "error";

export function useInlineStatus(successDurationMs = 2000) {
  const [status, setStatus] = useState<InlineStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const start = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setStatus("loading");
    setError(null);
  }, []);

  const succeed = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setStatus("success");
    timeoutRef.current = setTimeout(() => setStatus("idle"), successDurationMs);
  }, [successDurationMs]);

  const fail = useCallback((message: string) => {
    clearTimeout(timeoutRef.current);
    setStatus("error");
    setError(message);
  }, []);

  return { status, error, start, succeed, fail };
}
