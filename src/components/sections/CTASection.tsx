import { Button } from "@/components/ui/button";
import { ArrowRight, Plane } from "lucide-react";

const DISCORD_URL = "https://discord.gg/Qs7cvhNngZ";

const CTASection = () => {
  return (
    <section id="community" className="py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />

      <div className="relative container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Icon */}
          <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-8 glow-amber animate-float">
            <Plane className="w-10 h-10 text-primary" />
          </div>

          <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-6">
            Ready to Join
            <br />
            <span className="text-gradient">Alpivion Network?</span>
          </h2>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Connect with hundreds of passionate flight simmers. Share experiences, learn new skills, and explore the
            virtual skies together.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="xl" asChild>
              <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer">
                Create Account
                <ArrowRight className="w-5 h-5" />
              </a>
            </Button>
            <Button
              variant="heroOutline"
              size="xl"
              onClick={() => document.getElementById("flights")?.scrollIntoView({ behavior: "smooth" })}
            >
              Browse Flights
            </Button>
          </div>

          {/* Trust badges */}
          <div className="mt-12 pt-12 border-t border-border/50">
            <p className="text-sm text-muted-foreground mb-4">Trusted by virtual pilots using</p>
            <div className="flex flex-wrap justify-center gap-8 text-muted-foreground/60">
              <span className="font-display font-semibold">MSFS 2020 & 2024</span>
              <span className="font-display font-semibold">X-Plane 12</span>
              <span className="font-display font-semibold">Prepar3D</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
