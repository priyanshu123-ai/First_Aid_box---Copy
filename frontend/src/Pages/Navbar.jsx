import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Menu, X, LogOut } from "lucide-react";
import { useContext, useState } from "react";
import { AuthContext } from "@/context/AuthContext";

const Navbar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser, logout } = useContext(AuthContext);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/first-aid", label: "First Aid" },
    { to: "/emergency", label: "Emergency" },
    { to: "/hospitals", label: "Hospitals" },
    { to: "/profile", label: "My Profile" },
  ];

  return (
    <header className="sticky top-0 overflow-x-hidden z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-4 py-5 md:px-6 md:py-7">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-emergency" fill="currentColor" />
            <span className="text-xl md:text-2xl font-bold">Emergency Aid</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-[18px] font-medium transition-colors hover:text-emergency ${
                  location.pathname === link.to
                    ? "text-emergency"
                    : "text-foreground/70"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {currentUser ? (
              <Button className="bg-emergency text-sm" onClick={() => logout()}>
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            ) : (
              <Link to="/register">
                <Button className="bg-emergency text-[15px] py-2 px-4">
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-3 border-t pt-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`block text-[15px]  font-medium transition-colors hover:text-emergency ${
                  location.pathname === link.to
                    ? "text-emergency"
                    : "text-foreground/70"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {currentUser ? (
              <Button
                className="w-full bg-emergency text-sm"
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            ) : (
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button className="mt-2 w-full bg-emergency text-sm">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
