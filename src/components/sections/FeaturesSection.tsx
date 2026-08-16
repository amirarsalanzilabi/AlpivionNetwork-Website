import { BookOpen, Gauge, Radio, Users, Video, Trophy } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Group Flights",
    description: "Coordinate and fly together with pilots from around the world in organized group events.",
  },
  {
    icon: BookOpen,
    title: "Knowledge Base",
    description: "Access tutorials, guides, and procedures from beginner basics to advanced techniques.",
  },
  {
    icon: Radio,
    title: "Train with ATC",
    description: "Practice realistic radio communications with our trained air traffic controllers.",
  },
  {
    icon: Video,
    title: "Training Sessions",
    description: "Join live training sessions covering everything from flight planning to IFR procedures.",
  },
  {
    icon: Gauge,
    title: "Sim Optimization",
    description: "Experienced team members are available to assist you get tailored performance based on your system.",
  },
  {
    icon: Trophy,
    title: "Achievements",
    description: "Track your progress, earn badges, and climb the ranks as you develop your skills.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="knowledge" className="py-24 gradient-sky">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">Community Features</span>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mt-3 mb-4">Everything You Need</h2>
          <p className="text-muted-foreground text-lg">
            From group coordination to in-depth training, we've built the tools to help you become a better virtual
            pilot.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm hover:bg-card/60 hover:border-primary/30 transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
