import { LogOut, Camera, LayoutDashboard, User, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import logo from "@/assets/logo.png";

interface UserData {
  username?: string;
  name?: string;
  profilePicture?: string;
}

export const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  // Check login state and load user data
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUserData(JSON.parse(storedUser));
      } catch {
        setUserData(null);
      }
    }
  }, []);

  // Re-check user data when localStorage changes (e.g. after upload)
  useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try { setUserData(JSON.parse(storedUser)); } catch { setUserData(null); }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Handle scroll to hide/show navigation
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUserData(null);
    navigate('/');
  };

  const navLinkClass = "text-sm font-semibold text-foreground hover:text-primary transition-colors relative group";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border shadow-sm transition-transform duration-300 ${isScrolled ? '-translate-y-full' : 'translate-y-0'}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            <Link to={isLoggedIn ? "/dashboard" : "/"} className="flex items-center gap-3">
              <img src={logo} alt="Agro AI Logo" className="h-12 w-auto" />
            </Link>
          </div>

          {/* ─── Nav Links: different for logged-in vs guest ─── */}
          <div className="hidden md:flex items-center gap-8">
            {isLoggedIn ? (
              <>
                <Link to="/dashboard" className={navLinkClass}>
                  Dashboard
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                </Link>
                <Link to="/scan" className={navLinkClass}>
                  Scan
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                </Link>
                <Link to="/dashboard#history" className={navLinkClass}>
                  History
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                </Link>
                <Link to="/about" className={navLinkClass}>
                  About
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                </Link>
                <Link to="/faqs" className={navLinkClass}>
                  FAQs
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/" className={navLinkClass}>
                  Home
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                </Link>
                <Link to="/features" className={navLinkClass}>
                  Features
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                </Link>
                <Link to="/how-it-works" className={navLinkClass}>
                  How It Works
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                </Link>
                <Link to="/benefits" className={navLinkClass}>
                  Benefits
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                </Link>
                <Link to="/scan" className={navLinkClass}>
                  Scan
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                </Link>
                <Link to="/demo" className={navLinkClass}>
                  Demo
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                </Link>
                <Link to="/about" className={navLinkClass}>
                  About
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                </Link>
              </>
            )}
          </div>

          {/* ─── Right Side: Auth buttons or Profile avatar ─── */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2 hidden sm:flex"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>

                {/* Profile Avatar */}
                <Link
                  to="/profile"
                  className="relative h-10 w-10 rounded-full border-2 border-primary/30 overflow-hidden flex items-center justify-center bg-gradient-to-br from-primary/20 to-green-500/20 hover:border-primary transition-colors shadow-sm"
                >
                  {userData?.profilePicture ? (
                    <img
                      src={userData.profilePicture}
                      alt={userData.username || "Profile"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-bold text-primary">
                      {userData?.username?.charAt(0).toUpperCase() || <User className="h-4 w-4 text-primary" />}
                    </span>
                  )}
                </Link>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild className="hidden sm:flex">
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button className="bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:shadow-lg transition-all font-semibold px-6 hidden sm:flex" asChild>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-lg px-4 py-4 space-y-2">
          {isLoggedIn ? (
            <>
              <Link to="/dashboard" className={navLinkClass + " block py-2"} onClick={() => setMobileOpen(false)}>Dashboard</Link>
              <Link to="/scan" className={navLinkClass + " block py-2"} onClick={() => setMobileOpen(false)}>Scan</Link>
              <Link to="/dashboard#history" className={navLinkClass + " block py-2"} onClick={() => setMobileOpen(false)}>History</Link>
              <Link to="/about" className={navLinkClass + " block py-2"} onClick={() => setMobileOpen(false)}>About</Link>
              <Link to="/faqs" className={navLinkClass + " block py-2"} onClick={() => setMobileOpen(false)}>FAQs</Link>
              <Link to="/profile" className={navLinkClass + " block py-2"} onClick={() => setMobileOpen(false)}>Profile</Link>
              <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="flex items-center gap-2 text-sm font-semibold text-destructive py-2">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/" className={navLinkClass + " block py-2"} onClick={() => setMobileOpen(false)}>Home</Link>
              <Link to="/features" className={navLinkClass + " block py-2"} onClick={() => setMobileOpen(false)}>Features</Link>
              <Link to="/how-it-works" className={navLinkClass + " block py-2"} onClick={() => setMobileOpen(false)}>How It Works</Link>
              <Link to="/scan" className={navLinkClass + " block py-2"} onClick={() => setMobileOpen(false)}>Scan</Link>
              <Link to="/about" className={navLinkClass + " block py-2"} onClick={() => setMobileOpen(false)}>About</Link>
              <div className="flex gap-2 pt-2">
                <Button variant="ghost" asChild className="flex-1"><Link to="/login" onClick={() => setMobileOpen(false)}>Sign In</Link></Button>
                <Button asChild className="flex-1"><Link to="/signup" onClick={() => setMobileOpen(false)}>Sign Up</Link></Button>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
};
