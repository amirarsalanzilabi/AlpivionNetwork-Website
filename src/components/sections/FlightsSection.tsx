import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users, ArrowRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const DISCORD_URL = "https://discord.gg/Qs7cvhNngZ";

const difficultyColors: Record<string, string> = {
  Beginner: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Intermediate: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Advanced: "bg-rose-500/20 text-rose-400 border-rose-500/30",
};

// Placeholder flights for the static site. Real scheduling comes back with the backend.
const sampleFlights = [
  {
    id: "1",
    title: "Transatlantic Crossing",
    route: "KJFK → EGLL",
    difficulty: "Advanced",
    date: "Mar 14, 2026",
    time: "19:00 UTC",
    participants: "24 pilots registered",
    aircraft: "Boeing 777-300ER",
  },
  {
    id: "2",
    title: "Coastal Hopper",
    route: "KLAX → KSFO",
    difficulty: "Beginner",
    date: "Mar 21, 2026",
    time: "01:00 UTC",
    participants: "18 pilots registered",
    aircraft: "Cessna 172",
  },
  {
    id: "3",
    title: "Alpine Approach",
    route: "LSZH → LOWI",
    difficulty: "Intermediate",
    date: "Mar 28, 2026",
    time: "17:30 UTC",
    participants: "12 pilots registered",
    aircraft: "Airbus A320neo",
  },
];

const FlightsSection = () => {
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
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {sampleFlights.map((flight) => (
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
                      <span>{flight.date}</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>{flight.time}</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Users className="w-4 h-4 text-primary" />
                      <span>{flight.participants}</span>
                    </div>
                  </div>

                  {/* Aircraft */}
                  <div className="py-3 border-t border-border">
                    <span className="text-sm text-muted-foreground">Aircraft: </span>
                    <span className="text-sm text-foreground font-medium">{flight.aircraft}</span>
                  </div>

                  {/* CTA */}
                  <Button variant="heroOutline" className="w-full mt-4" asChild>
                    <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer">
                      Register on Discord
                    </a>
                  </Button>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-4 bg-background/80 border-border hover:bg-primary/20" />
          <CarouselNext className="hidden md:flex -right-4 bg-background/80 border-border hover:bg-primary/20" />
        </Carousel>

        {/* View All */}
        <div className="text-center mt-12">
          <Button variant="ghost" className="text-primary" asChild>
            <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer">
              View All Events
              <ArrowRight className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FlightsSection;
