import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Calendar, Clock, MapPin, ChevronLeft, ChevronRight, Plane, Users, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday, isBefore, startOfDay } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string;
  location: string | null;
}

interface Flight {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string;
  route: string;
  aircraft: string;
  difficulty: string;
  is_completed: boolean;
}

type CalendarItem = {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string;
  type: "event" | "flight";
  location?: string | null;
  route?: string;
  aircraft?: string;
  difficulty?: string;
  max_participants?: number | null;
  participant_count?: number;
  is_completed?: boolean;
};

const difficultyColors: Record<string, string> = {
  Beginner: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Intermediate: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Advanced: "bg-rose-500/20 text-rose-400 border-rose-500/30",
};

const EventsCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [registeredFlightIds, setRegisteredFlightIds] = useState<Set<string>>(new Set());
  const [registeringFlightId, setRegisteringFlightId] = useState<string | null>(null);
  const [justRegisteredId, setJustRegisteredId] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Events Calendar | Alpivion Network";
  }, []);

  // Fetch user registrations
  useEffect(() => {
    const fetchUserRegistrations = async () => {
      if (!user) {
        setRegisteredFlightIds(new Set());
        return;
      }
      const { data } = await supabase
        .from("flight_registrations")
        .select("flight_id")
        .eq("user_id", user.id);
      if (data) {
        setRegisteredFlightIds(new Set(data.map((r) => r.flight_id)));
      }
    };
    fetchUserRegistrations();
  }, [user]);

  const { data: events = [] } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: true });

      if (error) throw error;
      return data as Event[];
    },
  });

  const { data: flights = [], isLoading } = useQuery({
    queryKey: ["flights-calendar"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flights")
        .select("*")
        .order("date", { ascending: true });

      if (error) throw error;
      return data as Flight[];
    },
  });

  const handleRegister = async (flightId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to register for flights.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setRegisteringFlightId(flightId);
    try {
      const { error } = await supabase.from("flight_registrations").insert({
        user_id: user.id,
        flight_id: flightId,
      });

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Already registered",
            description: "You're already registered for this flight.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        setRegisteredFlightIds((prev) => new Set([...prev, flightId]));
        // Trigger success animation
        setJustRegisteredId(flightId);
        setTimeout(() => setJustRegisteredId(null), 600);
      }
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRegisteringFlightId(null);
    }
  };

  // Combine events and flights into calendar items
  const calendarItems: CalendarItem[] = [
    ...events.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      date: e.event_date,
      time: e.event_time,
      type: "event" as const,
      location: e.location,
    })),
    ...flights.map((f) => ({
      id: f.id,
      title: f.title,
      description: f.description,
      date: f.date,
      time: f.time,
      type: "flight" as const,
      route: f.route,
      aircraft: f.aircraft,
      difficulty: f.difficulty,
      is_completed: f.is_completed,
    })),
  ];

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad the start of the month to align with weekday
  const startDay = monthStart.getDay();
  const paddingDays = Array(startDay).fill(null);

  const getItemsForDate = (date: Date) => {
    return calendarItems.filter((item) => isSameDay(new Date(item.date), date));
  };

  const upcomingItems = calendarItems
    .filter((item) => !isBefore(new Date(item.date), startOfDay(new Date())))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastItems = calendarItems
    .filter((item) => isBefore(new Date(item.date), startOfDay(new Date())))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const selectedDateItems = selectedDate ? getItemsForDate(selectedDate) : [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">
              Community
            </span>
            <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground mt-3 mb-4">
              Events Calendar
            </h1>
            <p className="text-muted-foreground text-lg">
              Stay updated with upcoming community events, group flights, and special activities.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Calendar */}
            <div className="lg:col-span-2 glass-card rounded-xl p-6">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <h2 className="text-xl font-semibold text-foreground">
                  {format(currentMonth, "MMMM yyyy")}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>

              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm font-medium text-muted-foreground py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {paddingDays.map((_, index) => (
                  <div key={`pad-${index}`} className="aspect-square" />
                ))}
                {daysInMonth.map((day) => {
                  const dayItems = getItemsForDate(day);
                  const hasItems = dayItems.length > 0;
                  const hasFlights = dayItems.some((i) => i.type === "flight");
                  const hasEvents = dayItems.some((i) => i.type === "event");
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const isPast = isBefore(day, startOfDay(new Date()));

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={`
                        aspect-square rounded-lg flex flex-col items-center justify-center relative transition-colors
                        ${isToday(day) ? "bg-primary/20 text-primary" : ""}
                        ${isSelected ? "ring-2 ring-primary" : ""}
                        ${isPast && !isToday(day) ? "text-muted-foreground/50" : "text-foreground"}
                        ${hasItems ? "font-semibold" : ""}
                        hover:bg-muted/50
                      `}
                    >
                      <span className="text-sm">{format(day, "d")}</span>
                      {hasItems && (
                        <div className="flex gap-0.5 mt-1">
                          {hasFlights && (
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${isPast ? "bg-muted-foreground/50" : "bg-primary"}`}
                            />
                          )}
                          {hasEvents && (
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${isPast ? "bg-muted-foreground/50" : "bg-emerald-400"}`}
                            />
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  Group Flights
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  Events
                </span>
              </div>
            </div>

            {/* Selected Date Items / Upcoming Items */}
            <div className="space-y-6">
              {selectedDate ? (
                <div className="glass-card rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    {format(selectedDate, "MMMM d, yyyy")}
                  </h3>
                  {selectedDateItems.length > 0 ? (
                    <div className="space-y-4">
                      {selectedDateItems.map((item) => {
                        const itemIsPast = isBefore(new Date(item.date), startOfDay(new Date()));
                        return (
                          <CalendarItemCard
                            key={item.id}
                            item={item}
                            isPast={itemIsPast}
                            isRegistered={registeredFlightIds.has(item.id)}
                            isRegistering={registeringFlightId === item.id}
                            justRegistered={justRegisteredId === item.id}
                            onRegister={() => handleRegister(item.id)}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No events on this date.</p>
                  )}
                  <Button
                    variant="ghost"
                    className="mt-4 text-primary"
                    onClick={() => setSelectedDate(null)}
                  >
                    View all upcoming events
                  </Button>
                </div>
              ) : (
                <div className="glass-card rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Upcoming
                  </h3>
                  {isLoading ? (
                    <p className="text-muted-foreground text-sm">Loading...</p>
                  ) : upcomingItems.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingItems.slice(0, 5).map((item) => (
                        <CalendarItemCard
                          key={item.id}
                          item={item}
                          showDate
                          isRegistered={registeredFlightIds.has(item.id)}
                          isRegistering={registeringFlightId === item.id}
                          justRegistered={justRegisteredId === item.id}
                          onRegister={() => handleRegister(item.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No upcoming events or flights.</p>
                  )}
                </div>
              )}

              {/* Past Items */}
              {!selectedDate && pastItems.length > 0 && (
                <div className="glass-card rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Past
                  </h3>
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {pastItems.slice(0, 10).map((item) => (
                      <CalendarItemCard key={item.id} item={item} showDate isPast />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

const CalendarItemCard = ({
  item,
  showDate = false,
  isPast = false,
  isRegistered = false,
  isRegistering = false,
  justRegistered = false,
  onRegister,
}: {
  item: CalendarItem;
  showDate?: boolean;
  isPast?: boolean;
  isRegistered?: boolean;
  isRegistering?: boolean;
  justRegistered?: boolean;
  onRegister?: () => void;
}) => {
  const isFlightCompleted = item.type === "flight" && item.is_completed;
  const showRegisterButton = item.type === "flight" && !isPast && !isFlightCompleted && onRegister;

  return (
    <div className={`p-4 rounded-lg border border-border ${isPast ? "opacity-60" : "bg-muted/30"}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {item.type === "flight" ? (
            <Plane className={`w-4 h-4 ${isPast ? "text-muted-foreground" : "text-primary"}`} />
          ) : (
            <Calendar className={`w-4 h-4 ${isPast ? "text-muted-foreground" : "text-emerald-400"}`} />
          )}
          <h4 className={`font-medium ${isPast ? "text-muted-foreground" : "text-foreground"}`}>
            {item.title}
          </h4>
          {isFlightCompleted && (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 font-semibold">
              <CheckCircle className="w-3 h-3" />
              COMPLETED
            </span>
          )}
        </div>
        {item.type === "flight" && item.difficulty && !isFlightCompleted && (
          <span className={`text-xs px-2 py-0.5 rounded-full border ${difficultyColors[item.difficulty]}`}>
            {item.difficulty}
          </span>
        )}
      </div>
      
      {item.type === "flight" && item.route && (
        <p className="text-sm text-primary mt-1">{item.route}</p>
      )}
      
      {item.description && (
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
      )}
      
      <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
        {showDate && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {format(new Date(item.date), "MMM d, yyyy")}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {item.time}
        </span>
        {item.location && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {item.location}
          </span>
        )}
        {item.type === "flight" && item.aircraft && (
          <span className="text-muted-foreground">{item.aircraft}</span>
        )}
      </div>

      {showRegisterButton && (
        <div className="mt-3">
          {isRegistered ? (
            <span className={`text-xs text-emerald-400 flex items-center gap-1 transition-all duration-300 ${
              justRegistered ? 'animate-fade-in' : ''
            }`}>
              <Users className="w-3 h-3" />
              Registered
            </span>
          ) : (
            <Button
              size="sm"
              onClick={onRegister}
              disabled={isRegistering}
              className="h-7 text-xs"
            >
              {isRegistering ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Registering...
                </>
              ) : (
                "Register"
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default EventsCalendar;
