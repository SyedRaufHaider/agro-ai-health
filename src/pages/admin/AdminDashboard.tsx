import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import {
  Users,
  Activity,
  ScanSearch,
  BarChart3,
  ArrowRight,
  ShieldCheck,
  LogOut,
  CalendarDays,
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalDetections: number;
  todayScans: number;
  todayNewUsers: number;
  platformBreakdown: { web: number; mobile: number };
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    api.getAdminStats()
      .then((res) => setStats(res.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const statCards = stats
    ? [
        {
          icon: Users,
          label: "Total Users",
          value: stats.totalUsers,
          color: "text-primary",
          bg: "bg-primary/10",
        },
        {
          icon: ScanSearch,
          label: "Total Diagnoses",
          value: stats.totalDetections,
          color: "text-violet-500",
          bg: "bg-violet-500/10",
        },
        {
          icon: CalendarDays,
          label: "Today's Scans",
          value: stats.todayScans,
          color: "text-emerald-500",
          bg: "bg-emerald-500/10",
        },
      ]
    : [];

  const navCards = [
    {
      icon: Users,
      title: "View System Users",
      description: "Browse all registered accounts, roles and join dates",
      link: "/admin/users",
      color: "text-primary",
      bg: "bg-primary/10",
      border: "hover:border-primary/40",
    },
    {
      icon: ScanSearch,
      title: "Diagnosis Records",
      description: "All AI scan results across every user in the system",
      link: "/admin/detections",
      color: "text-violet-500",
      bg: "bg-violet-500/10",
      border: "hover:border-violet-500/40",
    },
    {
      icon: BarChart3,
      title: "System Activity",
      description: "Platform stats, today's activity and recent detections",
      link: "/admin/activity",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "hover:border-emerald-500/40",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 container mx-auto px-4 py-8 mt-20 space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Admin Panel</h1>
              <p className="text-muted-foreground text-sm">
                Welcome, {user?.username || "Admin"} · AgroAI System Control
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize px-3 py-1 text-primary border-primary/40">
              admin
            </Badge>
            <Button variant="destructive" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-9 w-20 mb-2" />
                    <Skeleton className="h-4 w-28" />
                  </CardContent>
                </Card>
              ))
            : statCards.map((s, i) => {
                const Icon = s.icon;
                return (
                  <Card key={i} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className={`h-10 w-10 rounded-lg ${s.bg} flex items-center justify-center`}>
                        <Icon className={`h-5 w-5 ${s.color}`} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className={`text-4xl font-bold mb-1 ${s.color}`}>{s.value}</div>
                      <div className="text-sm font-medium">{s.label}</div>
                    </CardContent>
                  </Card>
                );
              })}
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {navCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.link} to={card.link}>
                <Card className={`group cursor-pointer transition-all hover:shadow-lg h-full ${card.border}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className={`h-12 w-12 rounded-xl ${card.bg} flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110`}>
                        <Icon className={`h-6 w-6 ${card.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base mb-1">{card.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{card.description}</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

      </main>
    </div>
  );
};

export default AdminDashboard;
