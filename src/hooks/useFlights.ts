import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Flight {
  id: string;
  title: string;
  route: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  date: string;
  time: string;
  aircraft: string;
  participant_count: number;
  is_completed: boolean;
}

export const useFlights = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchFlights = useCallback(async () => {
    const { data } = await supabase.from("flights").select("*").order("date", { ascending: true });
    setFlights(data ?? []);
  }, []);

  const fetchRegistrations = useCallback(async () => {
    if (!user) {
      setRegisteredIds(new Set());
      return;
    }
    const { data } = await supabase.from("flight_registrations").select("flight_id").eq("user_id", user.id);
    setRegisteredIds(new Set((data ?? []).map((r) => r.flight_id)));
  }, [user]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchFlights(), fetchRegistrations()]).finally(() => setLoading(false));
  }, [fetchFlights, fetchRegistrations]);

  const registerForFlight = async (flightId: string) => {
    if (!user) return { error: new Error("Not signed in") };

    const { error } = await supabase
      .from("flight_registrations")
      .insert({ flight_id: flightId, user_id: user.id });

    if (!error) {
      setRegisteredIds((prev) => new Set(prev).add(flightId));
      setFlights((prev) =>
        prev.map((f) => (f.id === flightId ? { ...f, participant_count: f.participant_count + 1 } : f)),
      );
    }
    return { error };
  };

  const isRegistered = (flightId: string) => registeredIds.has(flightId);

  return { flights, loading, registerForFlight, isRegistered };
};
