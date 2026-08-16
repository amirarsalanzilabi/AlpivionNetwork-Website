import { Plane } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const links = {
    Community: ["Group Flights", "Events Calendar", "Discord Server", "Forums"],
    Resources: ["Knowledge Base", "Tutorials", "Flight Planning", "Route Database"],
    Support: ["FAQ", "Contact Us", "Guidelines", "Report Issue"],
  };

  const handleSectionClick = (sectionId: string) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const element = document.querySelector(sectionId);
        element?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const element = document.querySelector(sectionId);
      element?.scrollIntoView({ behavior: "smooth" });
    }
  };
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link
              to="/"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity w-fit"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Plane className="w-5 h-5 text-primary" />
              </div>
              <span className="font-display font-bold text-xl text-foreground">Alpivion Network</span>
            </Link>
            <p className="text-muted-foreground max-w-sm">
              The premier flight simulation community for virtual pilots who want to fly together, learn together, and
              share their passion for aviation.
            </p>
          </div>

          {/* Links */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="font-semibold text-foreground mb-4">{title}</h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item}>
                    {item === "FAQ" ? (
                      <Link
                        to="/faq"
                        onClick={() => setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50)}
                        className="text-muted-foreground hover:text-primary transition-colors text-sm"
                      >
                        {item}
                      </Link>
                    ) : item === "Report Issue" ? (
                      <Link
                        to="/report-issue"
                        onClick={() => setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50)}
                        className="text-muted-foreground hover:text-primary transition-colors text-sm"
                      >
                        {item}
                      </Link>
                    ) : item === "Forums" ? (
                      <Link
                        to="/forums"
                        onClick={() => setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50)}
                        className="text-muted-foreground hover:text-primary transition-colors text-sm"
                      >
                        {item}
                      </Link>
                    ) : item === "Group Flights" ? (
                      <button
                        onClick={() => handleSectionClick("#flights")}
                        className="text-muted-foreground hover:text-primary transition-colors text-sm text-left"
                      >
                        {item}
                      </button>
                    ) : item === "Events Calendar" ? (
                      <Link
                        to="/events"
                        onClick={() => setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50)}
                        className="text-muted-foreground hover:text-primary transition-colors text-sm"
                      >
                        {item}
                      </Link>
                    ) : (
                      <a
                        href={item === "Discord Server" ? "https://discord.gg/Qs7cvhNngZ" : "#"}
                        className="text-muted-foreground hover:text-primary transition-colors text-sm"
                        {...(item === "Discord Server" ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      >
                        {item}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/terms"
                  onClick={() => setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50)}
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  onClick={() => setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50)}
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">© 2026 Alpivion Network. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
