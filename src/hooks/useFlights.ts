import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Flight {
  id: string;
  title: string;
  route: string;
  date: string;
  time: string;
  aircraft: string;
  difficulty: string;
  max_participants: number;
  participant_count: number;
  is_completed: boolean;
}

export const useFlights = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [registeredFlightIds, setRegisteredFlightIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchFlights = async () => {
    try {
      // Fetch flights
      const { data: flightsData, error: flightsError } = await supabase
        .from("flights")
        .select("*")
        .order("date", { ascending: true });

      if (flightsError) throw flightsError;

      // Fetch registration counts using secure RPC function (doesn't expose individual user data)
      const { data: countData, error: countError } = await supabase
        .rpc("get_flight_participant_counts");

      if (countError) throw countError;

      // Convert array to lookup object
      const counts = (countData || []).reduce((acc: Record<string, number>, row: { flight_id: string; participant_count: number }) => {
        acc[row.flight_id] = row.participant_count;
        return acc;
      }, {});

      const flightsWithCounts = flightsData.map((flight) => ({
        ...flight,
        participant_count: counts[flight.id] || 0,
      }));

      setFlights(flightsWithCounts);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error fetching flights:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRegistrations = async () => {
    if (!user) {
      setRegisteredFlightIds(new Set());
      return;
    }

    try {
      const { data, error } = await supabase
        .from("flight_registrations")
        .select("flight_id")
        .eq("user_id", user.id);

      if (error) throw error;

      setRegisteredFlightIds(new Set(data.map((r) => r.flight_id)));
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error fetching user registrations:", error);
      }
    }
  };

  const registerForFlight = async (flightId: string) => {
    if (!user) {
      return { error: new Error("You must be logged in to register") };
    }

    try {
      const { error } = await supabase.from("flight_registrations").insert({
        user_id: user.id,
        flight_id: flightId,
      });

      if (error) {
        if (error.code === "23505") {
          return { error: new Error("You're already registered for this flight") };
        }
        throw error;
      }

      setRegisteredFlightIds((prev) => new Set([...prev, flightId]));
      setFlights((prev) =>
        prev.map((f) =>
          f.id === flightId ? { ...f, participant_count: f.participant_count + 1 } : f
        )
      );

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  useEffect(() => {
    fetchFlights();

    // Subscribe to realtime changes for flight registrations
    // Only update counts for OTHER users' registrations to avoid double-counting
    // (our own registrations are already handled optimistically in registerForFlight)
    const channel = supabase
      .channel('flight_registrations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'flight_registrations',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newReg = payload.new as { flight_id: string; user_id: string };
            // Skip if this is our own registration (already counted optimistically)
            if (user && newReg.user_id === user.id) return;
            setFlights((prev) =>
              prev.map((f) =>
                f.id === newReg.flight_id
                  ? { ...f, participant_count: f.participant_count + 1 }
                  : f
              )
            );
          } else if (payload.eventType === 'DELETE') {
            const oldReg = payload.old as { flight_id: string; user_id: string };
            // Skip if this is our own unregistration
            if (user && oldReg.user_id === user.id) return;
            setFlights((prev) =>
              prev.map((f) =>
                f.id === oldReg.flight_id
                  ? { ...f, participant_count: Math.max(0, f.participant_count - 1) }
                  : f
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    fetchUserRegistrations();
  }, [user]);

  return {
    flights,
    registeredFlightIds,
    loading,
    registerForFlight,
    isRegistered: (flightId: string) => registeredFlightIds.has(flightId),
  };
};
