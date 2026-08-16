import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Plane, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const displayName = user?.user_metadata?.username ?? user?.email;

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    if (location.pathname !== "/") {
      // Navigate to home page first, then scroll to section
      navigate("/");
      if (href !== "#") {
        setTimeout(() => {
          const element = document.querySelector(href);
          element?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } else {
      // Already on home page, just scroll
      if (href === "#") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const element = document.querySelector(href);
        element?.scrollIntoView({ behavior: "smooth" });
      }
    }
  };
  const navLinks = [{
    name: "Home",
    href: "#"
  }, {
    name: "Group Flights",
    href: "#flights"
  }, {
    name: "Community",
    href: "#community"
  }];

  const pageLinks = [
    { name: "FAQ", path: "/faq" },
  ];

  const handlePageClick = (path: string) => {
    setIsOpen(false);
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return <nav className="fixed top-0 left-0 right-0 z-50 glass-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => {
              navigate("/");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center glow-amber">
              <Plane className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">Alpivion Network</span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => <button key={link.name} onClick={() => handleNavClick(link.href)} className="nav-link text-sm font-medium">
                {link.name}
              </button>)}
            {pageLinks.map(link => <button key={link.name} onClick={() => handlePageClick(link.path)} className="nav-link text-sm font-medium">
                {link.name}
              </button>)}
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground max-w-[160px] truncate">{displayName}</span>
                <Button variant="heroOutline" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
                  Sign In
                </Button>
                <Button variant="hero" size="sm" onClick={() => navigate("/auth?mode=signup")}>
                  Join Us
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 text-foreground" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-4">
            {navLinks.map(link => <button key={link.name} onClick={() => handleNavClick(link.href)} className="text-muted-foreground hover:text-primary transition-colors px-2 py-1 text-left">
                  {link.name}
                </button>)}
              {pageLinks.map(link => <button key={link.name} onClick={() => handlePageClick(link.path)} className="text-muted-foreground hover:text-primary transition-colors px-2 py-1 text-left">
                  {link.name}
                </button>)}
              <div className="flex flex-col gap-2 pt-4">
                {user ? (
                  <>
                    <span className="text-sm text-muted-foreground px-2 truncate">{displayName}</span>
                    <Button variant="heroOutline" className="w-full" onClick={handleSignOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" className="w-full" onClick={() => {
                      navigate("/auth");
                      setIsOpen(false);
                    }}>
                      Sign In
                    </Button>
                    <Button variant="hero" className="w-full" onClick={() => {
                      navigate("/auth?mode=signup");
                      setIsOpen(false);
                    }}>
                      Join Us
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>}
      </div>
    </nav>;
};
export default Navbar;
