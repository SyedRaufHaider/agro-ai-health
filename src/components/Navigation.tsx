import {
  LogOut,
  User,
  Menu,
  X,
  LayoutDashboard,
  ScanLine,
  History,
  TrendingUp,
  CalendarDays,
  Map,
  Home,
  Sparkles,
  Cog,
  BookOpen,
  Play,
  Award,
  Leaf,
  ChevronDown,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import logo from "@/assets/logo.png";

interface UserData {
  username?: string;
  name?: string;
  profilePicture?: string;
}

export const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUserData(JSON.parse(storedUser));
      } catch {
        setUserData(null);
      }
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setUserData(JSON.parse(storedUser));
        } catch {
          setUserData(null);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    let lastY = window.scrollY;
    const handleScroll = () => {
      const y = window.scrollY;
      setScrollY(y);
      if (y > lastY && y > 80) setIsScrolled(true);
      else setIsScrolled(false);
      lastY = y;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUserData(null);
    setProfileOpen(false);
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;
  const hasScrolled = scrollY > 10;

  const loggedInLinks = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/scan", label: "Scan", icon: ScanLine },
    { to: "/scan-history", label: "History", icon: History },
    { to: "/disease-trends", label: "Trends", icon: TrendingUp },
    { to: "/crop-calendar", label: "Calendar", icon: CalendarDays },
    { to: "/field-health-map", label: "Field Map", icon: Map },
  ];

  const guestLinks = [
    { to: "/", label: "Home", icon: Home },
    { to: "/features", label: "Features", icon: Sparkles },
    { to: "/how-it-works", label: "How It Works", icon: Cog },
    { to: "/benefits", label: "Benefits", icon: Award },
    { to: "/scan", label: "Scan", icon: ScanLine },
    { to: "/demo", label: "Demo", icon: Play },
    { to: "/about", label: "About", icon: BookOpen },
  ];

  const navLinks = isLoggedIn ? loggedInLinks : guestLinks;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${isScrolled ? "-translate-y-full" : "translate-y-0"
          }`}
      >
        {/* Background layers */}
        <div
          className={`absolute inset-0 transition-all duration-300 ${hasScrolled
            ? "bg-background/90 backdrop-blur-2xl shadow-lg shadow-black/[0.03] dark:shadow-black/20"
            : "bg-background/70 backdrop-blur-xl"
            }`}
        />

        {/* Bottom border — gradient green line */}
        <div
          className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ${hasScrolled ? "h-[1px]" : "h-[2px]"
            }`}
        >
          <div className="h-full bg-gradient-to-r from-emerald-500/0 via-emerald-500/40 to-emerald-500/0" />
        </div>

        <div className="relative container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-[68px]">
            {/* ─── Logo + Brand ─── */}
            <Link
              to={isLoggedIn ? "/dashboard" : "/"}
              className="flex items-center gap-3 group shrink-0"
            >
              <div className="relative">
                <img
                  src={logo}
                  alt="Agro AI"
                  className="h-10 w-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </Link>

            {/* ─── Desktop Nav Links ─── */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const active = isActive(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`relative px-3 py-2 text-[13px] font-semibold tracking-wide transition-colors duration-200 group ${active
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-foreground/70 hover:text-foreground"
                      }`}
                  >
                    <span className="relative z-10">
                      {link.label}
                    </span>

                    {/* Active indicator — small leaf-green bar */}
                    <span
                      className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] rounded-full bg-emerald-500 transition-all duration-300 ${active ? "w-4/5" : "w-0 group-hover:w-1/2"
                        }`}
                    />

                    {/* Hover background */}
                    <span
                      className={`absolute inset-0 rounded-lg transition-colors duration-200 ${active
                        ? "bg-emerald-500/[0.07]"
                        : "bg-transparent group-hover:bg-foreground/[0.03]"
                        }`}
                    />
                  </Link>
                );
              })}
            </div>

            {/* ─── Right Side ─── */}
            <div className="flex items-center gap-2 shrink-0">
              <ThemeToggle />

              {isLoggedIn ? (
                <div ref={profileRef} className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className={`flex items-center gap-2 pl-1 pr-2 py-1 rounded-full transition-all duration-200 border ${profileOpen
                      ? "border-emerald-500/40 bg-emerald-500/5"
                      : "border-transparent hover:border-border hover:bg-muted/50"
                      }`}
                  >
                    {/* Avatar */}
                    <div className="h-8 w-8 rounded-full overflow-hidden ring-2 ring-emerald-500/20 ring-offset-1 ring-offset-background">
                      {userData?.profilePicture ? (
                        <img
                          src={userData.profilePicture}
                          alt={userData.username || "Profile"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                          <span className="text-xs font-bold text-white">
                            {userData?.username?.charAt(0).toUpperCase() || "U"}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="hidden sm:block text-xs font-semibold text-foreground/80 max-w-[80px] truncate">
                      {userData?.username || userData?.name || "User"}
                    </span>
                    <ChevronDown
                      className={`h-3 w-3 text-foreground/40 hidden sm:block transition-transform duration-200 ${profileOpen ? "rotate-180" : ""
                        }`}
                    />
                  </button>

                  {/* Profile Dropdown */}
                  {profileOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border/60 bg-background/95 backdrop-blur-xl shadow-xl shadow-black/[0.08] dark:shadow-black/30 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-border/50 bg-gradient-to-r from-emerald-500/5 to-teal-500/5">
                        <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 rounded-full overflow-hidden ring-2 ring-emerald-500/20">
                            {userData?.profilePicture ? (
                              <img
                                src={userData.profilePicture}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                                <span className="text-sm font-bold text-white">
                                  {userData?.username
                                    ?.charAt(0)
                                    .toUpperCase() || "U"}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">
                              {userData?.username || userData?.name || "User"}
                            </p>
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <Leaf className="h-2.5 w-2.5 text-emerald-500" />
                              Farmer
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="p-1.5">
                        <Link
                          to="/profile"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-foreground/80 hover:text-foreground hover:bg-muted/60 transition-colors"
                        >
                          <User className="h-4 w-4 text-foreground/50" />
                          My Profile
                        </Link>
                        <Link
                          to="/dashboard"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-foreground/80 hover:text-foreground hover:bg-muted/60 transition-colors"
                        >
                          <LayoutDashboard className="h-4 w-4 text-foreground/50" />
                          Dashboard
                        </Link>
                      </div>

                      {/* Logout */}
                      <div className="p-1.5 border-t border-border/50">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors w-full"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="text-[13px] font-semibold text-foreground/70 hover:text-foreground rounded-lg"
                  >
                    <Link to="/login">Sign In</Link>
                  </Button>
                  <Button
                    size="sm"
                    asChild
                    className="text-[13px] font-semibold rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 px-5"
                  >
                    <Link to="/signup">Get Started</Link>
                  </Button>
                </div>
              )}

              {/* Mobile Hamburger */}
              <button
                className="lg:hidden relative h-10 w-10 rounded-lg flex items-center justify-center hover:bg-muted/60 transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                <span className="sr-only">Menu</span>
                <div className="relative w-5 h-4 flex flex-col justify-between">
                  <span
                    className={`block h-[2px] w-full bg-foreground rounded-full transition-all duration-300 origin-center ${mobileOpen
                      ? "translate-y-[7px] rotate-45"
                      : ""
                      }`}
                  />
                  <span
                    className={`block h-[2px] w-full bg-foreground rounded-full transition-all duration-200 ${mobileOpen ? "opacity-0 scale-x-0" : ""
                      }`}
                  />
                  <span
                    className={`block h-[2px] w-full bg-foreground rounded-full transition-all duration-300 origin-center ${mobileOpen
                      ? "-translate-y-[7px] -rotate-45"
                      : ""
                      }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Mobile Fullscreen Menu ─── */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-400 ${mobileOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
          }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${mobileOpen ? "opacity-100" : "opacity-0"
            }`}
          onClick={() => setMobileOpen(false)}
        />

        {/* Panel */}
        <div
          className={`absolute top-[68px] left-0 right-0 max-h-[calc(100vh-68px)] bg-background border-b border-border shadow-2xl overflow-y-auto transition-all duration-300 ${mobileOpen
            ? "translate-y-0 opacity-100"
            : "-translate-y-4 opacity-0"
            }`}
        >
          {/* Decorative plant pattern */}
          <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] pointer-events-none">
            <svg viewBox="0 0 100 100" fill="currentColor" className="text-emerald-500 w-full h-full">
              <circle cx="50" cy="30" r="25" /><circle cx="30" cy="55" r="20" /><circle cx="70" cy="55" r="20" /><circle cx="50" cy="75" r="18" />
            </svg>
          </div>

          <div className="relative p-5 space-y-1">
            {/* Greeting for logged in users */}
            {isLoggedIn && (
              <div className="flex items-center gap-3 px-3 py-3 mb-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/10">
                <div className="h-10 w-10 rounded-full overflow-hidden ring-2 ring-emerald-500/30 shrink-0">
                  {userData?.profilePicture ? (
                    <img src={userData.profilePicture} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                      <span className="text-sm font-bold text-white">
                        {userData?.username?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold">{userData?.username || userData?.name || "User"}</p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Leaf className="h-2.5 w-2.5" /> Smart Farming
                  </p>
                </div>
              </div>
            )}

            {/* Nav Links */}
            {navLinks.map((link) => {
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-[15px] font-medium transition-all duration-200 ${active
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                    : "text-foreground/80 hover:bg-muted/60 hover:text-foreground"
                    }`}
                >
                  <span>{link.label}</span>
                  {active && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  )}
                </Link>
              );
            })}

            {/* Divider */}
            <div className="h-px bg-border/60 !my-3" />

            {isLoggedIn ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-[15px] font-medium transition-all ${isActive("/profile")
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                    : "text-foreground/80 hover:bg-muted/60"
                    }`}
                >
                  Profile
                  {isActive("/profile") && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  )}
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-[15px] font-medium text-destructive hover:bg-destructive/10 transition-colors w-full"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  asChild
                  className="flex-1 h-11 rounded-xl text-sm font-semibold"
                >
                  <Link to="/login" onClick={() => setMobileOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <Button
                  asChild
                  className="flex-1 h-11 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20"
                >
                  <Link to="/signup" onClick={() => setMobileOpen(false)}>
                    Get Started
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
