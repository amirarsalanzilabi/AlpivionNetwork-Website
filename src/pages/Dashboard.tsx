import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plane, Calendar, Clock, MapPin, Loader2, Trash2, Images } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { useToast } from "@/hooks/use-toast";

interface Flight {
  id: string;
  title: string;
  route: string;
  date: string;
  time: string;
  aircraft: string;
  difficulty: string;
  is_completed: boolean;
  images: string[] | null;
}

interface Registration {
  id: string;
  registered_at: string;
  flights: Flight;
}

const difficultyColors: Record<string, string> = {
  Beginner: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Intermediate: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Advanced: "bg-rose-500/20 text-rose-400 border-rose-500/30",
};

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [pilotId, setPilotId] = useState<number | null>(null);
  const [unregisteringId, setUnregisteringId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Dashboard | Alpivion Network";
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchRegistrations();
      fetchPilotId();
    }
  }, [user]);

  const fetchPilotId = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("pilot_id")
      .eq("user_id", user!.id)
      .maybeSingle();
    
    if (data?.pilot_id) {
      setPilotId(data.pilot_id);
    }
  };

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from("flight_registrations")
        .select(`
          id,
          registered_at,
          flights (
            id,
            title,
            route,
            date,
            time,
            aircraft,
            difficulty,
            is_completed,
            images
          )
        `)
        .eq("user_id", user!.id);

      if (error) throw error;
      
      // Sort by flight date (closest first)
      const sorted = (data as unknown as Registration[]).sort((a, b) => 
        new Date(a.flights.date).getTime() - new Date(b.flights.date).getTime()
      );
      
      setRegistrations(sorted);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error fetching registrations:", error);
      }
    } finally {
      setLoadingData(false);
    }
  };

  const handleUnregister = async (registrationId: string, flightTitle: string) => {
    setUnregisteringId(registrationId);
    try {
      const { error } = await supabase
        .from("flight_registrations")
        .delete()
        .eq("id", registrationId);

      if (error) throw error;

      // Show fade-out animation before removing
      setRemovingId(registrationId);
      setTimeout(() => {
        setRegistrations((prev) => prev.filter((r) => r.id !== registrationId));
        setRemovingId(null);
      }, 300);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unregister from flight.",
        variant: "destructive",
      });
    } finally {
      setUnregisteringId(null);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-4xl mx-auto">
          {/* Pilot Greeting */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              {pilotId ? (
                  <>Hi Pilot <span className="text-primary">{String(pilotId).padStart(2, '0')}</span>!</>
                ) : (
                  "Your Registered Flights"
                )}
              </h1>
              <p className="text-muted-foreground">
                Manage your upcoming group flights and registrations.
              </p>
            </div>
            <a
              href="https://discord.gg/Qs7cvhNngZ"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#5865F2]/10 text-[#5865F2] hover:bg-[#5865F2]/20 transition-colors text-sm font-medium shrink-0"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              Join our Discord Community
            </a>
          </div>

          {loadingData ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : registrations.length === 0 ? (
            <div className="glass-card rounded-xl p-12 text-center">
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Plane className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">No Registered Flights</h2>
              <p className="text-muted-foreground mb-6">
                You haven't registered for any group flights yet.
              </p>
              <Button variant="hero" onClick={() => navigate("/events")}>
                Browse Flights
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {registrations.map((registration) => {
                const isCompleted = registration.flights.is_completed;
                return (
                <div
                  key={registration.id}
                  className={`glass-card rounded-xl p-6 flex flex-col md:flex-row gap-4 transition-all duration-300 relative overflow-hidden ${
                    removingId === registration.id 
                      ? 'opacity-0 scale-95 border-rose-500/50' 
                      : 'opacity-100 scale-100'
                  }`}
                >
                  {/* Diagonal Completed Banner - Bottom Right */}
                  {isCompleted && (
                    <div className="absolute -right-10 bottom-6 rotate-[-35deg] bg-primary text-primary-foreground text-xs font-bold py-1 px-12 shadow-lg z-10 tracking-wide">
                      COMPLETED
                    </div>
                  )}
                  {/* Left content */}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {registration.flights.title}
                    </h3>
                    <div className="flex items-center gap-2 text-primary font-display mb-3">
                      <MapPin className="w-4 h-4" />
                      {registration.flights.route}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        {new Date(registration.flights.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        {registration.flights.time}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Aircraft: </span>
                        <span className="text-foreground">{registration.flights.aircraft}</span>
                      </div>
                    </div>
                  </div>
                  {/* Right side: badge + unregister stacked */}
                  <div className="flex flex-row md:flex-col items-start md:items-end gap-3 shrink-0">
                    <span
                      className={`text-xs px-2 py-1 rounded-full border ${
                        difficultyColors[registration.flights.difficulty]
                      }`}
                    >
                      {registration.flights.difficulty}
                    </span>
                    {/* Show gallery link for completed flights, unregister for active */}
                    {isCompleted ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:text-primary hover:bg-primary/10 mr-8"
                        onClick={() => navigate(`/flight/${registration.flights.id}/gallery`)}
                      >
                        <Images className="w-4 h-4 mr-2" />
                        View Gallery
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`transition-all duration-300 ${
                          removingId === registration.id
                            ? 'text-rose-400 bg-rose-500/20'
                            : 'text-destructive hover:text-destructive hover:bg-destructive/10'
                        }`}
                        onClick={() => handleUnregister(registration.id, registration.flights.title)}
                        disabled={unregisteringId === registration.id}
                      >
                        {unregisteringId === registration.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Removing...
                          </>
                        ) : removingId === registration.id ? (
                          <>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Removed
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Unregister
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              )})}
              
              {/* Browse Flights CTA */}
              <div className="mt-8 text-center">
                <Button variant="heroOutline" onClick={() => navigate("/events")}>
                  Browse More Flights
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
