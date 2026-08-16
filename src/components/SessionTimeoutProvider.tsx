import { useSessionTimeout } from "@/hooks/useSessionTimeout";

export const SessionTimeoutProvider = ({ children }: { children: React.ReactNode }) => {
  useSessionTimeout();
  return <>{children}</>;
};
