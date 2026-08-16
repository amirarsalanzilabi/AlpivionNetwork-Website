import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users, ArrowRight, Loader2, Check } from "lucide-react";
import { useFlights } from "@/hooks/useFlights";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const difficultyColors: Record<string, string> = {
  Beginner: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Intermediate: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Advanced: "bg-rose-500/20 text-rose-400 border-rose-500/30",
};

const FlightsSection = () => {
  const { flights, loading, registerForFlight, isRegistered } = useFlights();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [registeringId, setRegisteringId] = useState<string | null>(null);

  const upcomingFlights = flights.filter((f) => !f.is_completed);

  const handleRegister = async (flightId: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    setRegisteringId(flightId);
    const { error } = await registerForFlight(flightId);
    setRegisteringId(null);

    if (error) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <section id="flights" className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">
            Upcoming Events
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mt-3 mb-4">
            Group Flights
          </h2>
          <p className="text-muted-foreground text-lg">
            Join our scheduled group flights and experience the thrill of flying together
            across the virtual skies.
          </p>
        </div>

        {/* Flight Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : upcomingFlights.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No upcoming flights scheduled yet — check back soon.</p>
        ) : (
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {upcomingFlights.map((flight) => (
                <CarouselItem key={flight.id} className="pl-4 md:basis-1/2 lg:basis-1/3 select-none">
                  <div className="glass-card rounded-xl p-6 hover-lift group h-full relative overflow-hidden">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                          {flight.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-primary font-display text-lg">
                          <MapPin className="w-4 h-4" />
                          {flight.route}
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full border ${difficultyColors[flight.difficulty]}`}>
                        {flight.difficulty}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>{formatDate(flight.date)}</span>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>{flight.time}</span>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Users className="w-4 h-4 text-primary" />
                        <span>{flight.participant_count} pilots registered</span>
                      </div>
                    </div>

                    {/* Aircraft */}
                    <div className="py-3 border-t border-border">
                      <span className="text-sm text-muted-foreground">Aircraft: </span>
                      <span className="text-sm text-foreground font-medium">{flight.aircraft}</span>
                    </div>

                    {/* CTA */}
                    {isRegistered(flight.id) ? (
                      <Button
                        variant="heroOutline"
                        className="w-full mt-4 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
                        disabled
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Registered
                      </Button>
                    ) : (
                      <Button
                        variant="heroOutline"
                        className="w-full mt-4"
                        onClick={() => handleRegister(flight.id)}
                        disabled={registeringId === flight.id}
                      >
                        {registeringId === flight.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Registering...
                          </>
                        ) : (
                          "Register Now"
                        )}
                      </Button>
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-4 bg-background/80 border-border hover:bg-primary/20" />
            <CarouselNext className="hidden md:flex -right-4 bg-background/80 border-border hover:bg-primary/20" />
          </Carousel>
        )}

        {/* View All */}
        <div className="text-center mt-12">
          <Button variant="ghost" className="text-primary" onClick={() => navigate("/events")}>
            View All Events
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FlightsSection;
