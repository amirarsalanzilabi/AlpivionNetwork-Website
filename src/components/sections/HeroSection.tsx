import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Calendar, BookOpen } from "lucide-react";
import heroImage from "@/assets/hero-cockpit.jpg";

const DISCORD_URL = "https://discord.gg/Qs7cvhNngZ";

const HeroSection = () => {
  return <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img src={heroImage} alt="Cockpit view at sunset" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 pt-20">
        <div className="max-w-3xl">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-6 font-extralight font-sans"><span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
              ​​Virtual Aviation Community
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-foreground mb-6 animate-fade-up" style={{
          animationDelay: "0.1s"
        }}>
            Fly Together.{" "}
            <span className="text-gradient">Discover Together.</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8 animate-fade-up" style={{
          animationDelay: "0.2s"
        }}>
            Join the ultimate flight simulation community. Coordinate group flights, 
            share aviation knowledge, and connect with passionate virtual pilots worldwide.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 animate-fade-up" style={{
          animationDelay: "0.3s"
        }}>
            <Button variant="hero" size="xl" asChild>
              <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer">
                Join Alpivion Network
                <ArrowRight className="w-5 h-5" />
              </a>
            </Button>
            <Button variant="heroOutline" size="xl" onClick={() => document.getElementById("flights")?.scrollIntoView({
            behavior: "smooth"
          })}>
              View Upcoming Flights
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 animate-fade-up" style={{
          animationDelay: "0.4s"
        }}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold font-display text-foreground">Growing</div>
                <div className="text-sm text-muted-foreground">Pilot Community</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold font-display text-foreground">50+</div>
                <div className="text-sm text-muted-foreground">Monthly Flights</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold font-display text-foreground">50+</div>
                <div className="text-sm text-muted-foreground">Guides</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>;
};
export default HeroSection;