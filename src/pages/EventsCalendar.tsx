import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock, MapPin, Users, Loader2, Check, X } from "lucide-react";
import { useFlights } from "@/hooks/useFlights";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const difficultyColors: Record<string, string> = {
  Beginner: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Intermediate: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Advanced: "bg-rose-500/20 text-rose-400 border-rose-500/30",
};

// Avoids timezone drift: flight.date is a plain "YYYY-MM-DD" string.
const toLocalDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const EventsCalendar = () => {
  const { flights, loading, registerForFlight, isRegistered } = useFlights();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [registeringId, setRegisteringId] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Events Calendar | Alpivion Network";
  }, []);

  const flightDates = useMemo(() => flights.map((f) => toLocalDate(f.date)), [flights]);

  const visibleFlights = useMemo(() => {
    if (!selectedDate) return flights;
    return flights.filter((f) => sameDay(toLocalDate(f.date), selectedDate));
  }, [flights, selectedDate]);

  const handleRegister = async (flightId: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setRegisteringId(flightId);
    const { error } = await registerForFlight(flightId);
    setRegisteringId(null);

    if (error) {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
    }
  };

  const formatDate = (dateStr: string) =>
    toLocalDate(dateStr).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">Schedule</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-3 mb-4">Events Calendar</h1>
          <p className="text-muted-foreground text-lg">
            Every group flight, past and upcoming. Browse the list below, or pick a date to narrow it down.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {selectedDate && (
            <p className="text-sm text-muted-foreground">
              Showing flights on{" "}
              <span className="text-foreground font-medium">
                {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </span>
            </p>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : visibleFlights.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              {selectedDate ? "No flights scheduled on this date." : "No flights scheduled yet — check back soon."}
            </p>
          ) : (
            visibleFlights.map((flight) => (
              <div key={flight.id} className="glass-card rounded-xl p-6 relative overflow-hidden">
                {flight.is_completed && (
                  <div className="absolute left-[-40px] bottom-10 rotate-[35deg] bg-primary text-primary-foreground text-xs font-bold py-1 px-12 shadow-lg z-10 tracking-wide">
                    COMPLETED
                  </div>
                )}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">{flight.title}</h3>
                    <div className="flex items-center gap-2 mt-1 text-primary font-display text-lg">
                      <MapPin className="w-4 h-4" />
                      {flight.route}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full border shrink-0 ${difficultyColors[flight.difficulty]}`}>
                    {flight.difficulty}
                  </span>
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-primary" />
                    <span>{formatDate(flight.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{flight.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span>{flight.participant_count} pilots registered</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <div>
                    <span className="text-sm text-muted-foreground">Aircraft: </span>
                    <span className="text-sm text-foreground font-medium">{flight.aircraft}</span>
                  </div>

                  {flight.is_completed ? (
                    <span className="text-sm text-muted-foreground">Flight completed</span>
                  ) : isRegistered(flight.id) ? (
                    <Button
                      variant="heroOutline"
                      size="sm"
                      className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
                      disabled
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Registered
                    </Button>
                  ) : (
                    <Button
                      variant="heroOutline"
                      size="sm"
                      onClick={() => handleRegister(flight.id)}
                      disabled={registeringId === flight.id}
                    >
                      {registeringId === flight.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Register Now
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Browse by date */}
          <div className="pt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold text-foreground">Browse by date</h2>
              {selectedDate && (
                <Button variant="ghost" size="sm" className="text-primary h-8" onClick={() => setSelectedDate(undefined)}>
                  <X className="w-3.5 h-3.5 mr-1.5" />
                  Clear
                </Button>
              )}
            </div>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                modifiers={{ hasFlight: flightDates }}
                modifiersClassNames={{
                  hasFlight:
                    "relative after:content-[''] after:absolute after:bottom-1.5 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-primary",
                }}
                classNames={{
                  months: "flex flex-col",
                  caption_label: "text-base font-display font-semibold",
                  nav_button:
                    "h-8 w-8 bg-transparent p-0 rounded-full border-0 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors",
                  head_cell: "text-muted-foreground/70 rounded-md w-11 font-normal text-xs",
                  cell: "h-11 w-11 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                  day: "h-11 w-11 p-0 font-normal rounded-full hover:bg-primary/10 transition-colors aria-selected:opacity-100",
                  day_selected:
                    "bg-primary text-primary-foreground font-semibold glow-amber hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                  day_today: "text-primary font-semibold ring-1 ring-primary/40",
                }}
                className="p-0"
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EventsCalendar;
