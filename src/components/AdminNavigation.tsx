import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ShieldCheck, ChevronDown, LogOut, User } from "lucide-react";
import logo from "@/assets/logo.png";

interface UserData {
  username?: string;
  name?: string;
  profilePicture?: string;
}

export const AdminNavigation = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try { setUserData(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, []);

  // Close dropdown on outside click
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
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-2xl shadow-sm">
      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px]">
        <div className="h-full bg-gradient-to-r from-emerald-500/0 via-emerald-500/40 to-emerald-500/0" />
      </div>

      <div className="relative container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-[68px]">

          {/* Logo → links to /admin */}
          <Link to="/admin" className="flex items-center gap-3 group shrink-0">
            <img
              src={logo}
              alt="Agro AI"
              className="h-10 w-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Admin badge (desktop) */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-primary">Admin Panel</span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle />

            {/* Profile dropdown */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className={`flex items-center gap-2 pl-1 pr-2 py-1 rounded-full transition-all duration-200 border ${
                  profileOpen
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : "border-transparent hover:border-border hover:bg-muted/50"
                }`}
              >
                <div className="h-8 w-8 rounded-full overflow-hidden ring-2 ring-emerald-500/20 ring-offset-1 ring-offset-background">
                  {userData?.profilePicture ? (
                    <img
                      src={userData.profilePicture}
                      alt={userData.username || "Admin"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {userData?.username?.charAt(0).toUpperCase() || "A"}
                      </span>
                    </div>
                  )}
                </div>
                <span className="hidden sm:block text-xs font-semibold text-foreground/80 max-w-[80px] truncate">
                  {userData?.username || "Admin"}
                </span>
                <ChevronDown
                  className={`h-3 w-3 text-foreground/40 hidden sm:block transition-transform duration-200 ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown */}
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-border/60 bg-background/95 backdrop-blur-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-border/50 bg-gradient-to-r from-emerald-500/5 to-teal-500/5">
                    <p className="text-sm font-semibold truncate">
                      {userData?.username || "Admin"}
                    </p>
                    <p className="text-[11px] text-primary flex items-center gap-1 mt-0.5">
                      <ShieldCheck className="h-2.5 w-2.5" /> Administrator
                    </p>
                  </div>

                  {/* Links */}
                  <div className="p-1.5">
                    <Link
                      to="/admin"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-foreground/80 hover:text-foreground hover:bg-muted/60 transition-colors"
                    >
                      <ShieldCheck className="h-4 w-4 text-foreground/50" />
                      Admin Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-foreground/80 hover:text-foreground hover:bg-muted/60 transition-colors"
                    >
                      <User className="h-4 w-4 text-foreground/50" />
                      My Profile
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
          </div>

        </div>
      </div>
    </nav>
  );
};
