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
    ...(currentUser ? [
      { to: "/health-wallet", label: "Health Wallet" },
      { to: "/profile", label: "My Profile" },
    ] : []),
  ];

  return (
    <header className="sticky top-0 overflow-x-hidden z-50 w-full bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
      <nav className="container mx-auto px-4 py-3 md:px-6 md:py-3.5">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="p-1.5 rounded-xl bg-gradient-to-br from-emergency to-red-600 shadow-md group-hover:shadow-lg transition-shadow">
              <Heart className="h-5 w-5 text-white" fill="currentColor" />
            </div>
            <span className="text-lg md:text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Emergency Aid</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${location.pathname === link.to
                    ? "text-emergency bg-red-50"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
              >
                {link.label}
                {location.pathname === link.to && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-emergency" />
                )}
              </Link>
            ))}
            {currentUser ? (
              <Button className="ml-3 bg-gradient-to-r from-emergency to-red-600 hover:from-red-600 hover:to-red-700 text-sm shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 transition-all rounded-xl px-4" onClick={() => logout()}>
                <LogOut className="h-4 w-4 mr-1.5" />
                Sign Out
              </Button>
            ) : (
              <Link to="/register">
                <Button className="ml-3 bg-gradient-to-r from-emergency to-red-600 hover:from-red-600 hover:to-red-700 text-sm shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 transition-all rounded-xl px-5 py-2">
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 text-slate-700" />
            ) : (
              <Menu className="h-5 w-5 text-slate-700" />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pb-3 space-y-1 border-t border-slate-100 pt-3">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`block px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${location.pathname === link.to
                    ? "text-emergency bg-red-50"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {currentUser ? (
              <Button
                className="w-full mt-2 bg-gradient-to-r from-emergency to-red-600 text-sm rounded-xl shadow-md"
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
              >
                <LogOut className="h-4 w-4 mr-1.5" />
                Sign Out
              </Button>
            ) : (
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button className="mt-2 w-full bg-gradient-to-r from-emergency to-red-600 text-sm rounded-xl shadow-md">
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
