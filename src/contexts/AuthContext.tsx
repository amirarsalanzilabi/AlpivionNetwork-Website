import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resendConfirmation: (email: string, password: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if session should be cleared (browser was closed)
    const sessionEnded = sessionStorage.getItem("session_ended");
    if (sessionEnded === "true") {
      sessionStorage.removeItem("session_ended");
      supabase.auth.signOut();
    }

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const redirectUrl = "https://alpivionnetwork.com/";
    
    // Use our edge function to create user and send branded email via Resend
    const { data, error } = await supabase.functions.invoke("send-auth-email", {
      body: { 
        email, 
        password,
        redirectUrl,
        type: "signup"
      },
    });

    if (error) {
      console.error("Signup error:", error);
      return { error: new Error("Failed to create account. Please try again.") };
    }

    if (data?.error === "EMAIL_EXISTS") {
      return { error: new Error("EMAIL_EXISTS") };
    }

    if (data?.error) {
      return { error: new Error(data.error) };
    }

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resendConfirmation = async (email: string, password: string) => {
    const redirectUrl = "https://alpivionnetwork.com/";
    
    // Use our edge function to resend confirmation email via Resend
    const { data, error } = await supabase.functions.invoke("send-auth-email", {
      body: { 
        email, 
        password,
        redirectUrl,
        type: "signup"
      },
    });

    if (error) {
      return { error: new Error("Failed to resend confirmation email") };
    }

    if (data?.error) {
      return { error: new Error(data.error) };
    }

    return { error: null };
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut, resendConfirmation }}>
      {children}
    </AuthContext.Provider>
  );
};
