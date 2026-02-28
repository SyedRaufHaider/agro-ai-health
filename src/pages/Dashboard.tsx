import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Camera,
  History,
  Leaf,
  Activity,
  Shield,
  TrendingUp,
  Calendar,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

interface ScanRecord {
  _id: string;
  imageUrl?: string;
  disease: string;
  confidence: number;
  createdAt: string;
}

const Dashboard = () => {
  const storedUser = localStorage.getItem("user");
  const userData = storedUser ? JSON.parse(storedUser) : null;
  const userName = userData?.username || userData?.name || "User";

  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.getScanHistory();
        setScans(res.data || []);
      } catch {
        setScans([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Derived stats
  const totalScans = scans.length;
  const healthyCount = scans.filter((s) =>
    s.disease?.toLowerCase().includes("healthy")
  ).length;
  const diseasedCount = totalScans - healthyCount;
  const avgConfidence =
    totalScans > 0
      ? Math.round(
        (scans.reduce((acc, s) => acc + (s.confidence || 0), 0) /
          totalScans) *
        100
      )
      : 0;

  const stats = [
    {
      icon: Camera,
      label: "Total Scans",
      value: totalScans,
      description: "Plants analyzed",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: Leaf,
      label: "Healthy Plants",
      value: healthyCount,
      description: "No diseases detected",
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      icon: Shield,
      label: "Diseases Found",
      value: diseasedCount,
      description: "Detected issues",
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      icon: Activity,
      label: "Avg. Confidence",
      value: `${avgConfidence}%`,
      description: "AI accuracy",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
  ];

  const modules = [
    {
      icon: History,
      title: "Scan History",
      description: "View all your plant disease detection scans and results",
      link: "/scan-history",
      color: "text-violet-500",
      bg: "bg-violet-500/10",
      border: "hover:border-violet-500/30",
    },
    {
      icon: TrendingUp,
      title: "Disease Trends",
      description: "Track disease patterns and regional outbreak alerts",
      link: "/disease-trends",
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      border: "hover:border-rose-500/30",
    },
    {
      icon: Calendar,
      title: "Crop Calendar",
      description: "Pakistan crop sowing & harvest schedule with scan activity",
      link: "/crop-calendar",
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "hover:border-amber-500/30",
    },
    {
      icon: MapPin,
      title: "Field Health Map",
      description: "Draw and manage your farm field boundaries on the map",
      link: "/field-health-map",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "hover:border-emerald-500/30",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 container mx-auto px-4 py-8 mt-20 space-y-8">

        {/* ── Welcome Header ───────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <h1 className="text-4xl font-bold">
              Welcome back, {userName}! 🌿
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitor your plant health and manage your farm
            </p>
          </div>
          <Badge
            variant="outline"
            className="self-start md:self-center capitalize px-3 py-1"
          >
            {userData?.role || "farmer"}
          </Badge>
        </div>

        {/* ── Quick Scan CTA ───────────────────────────────────────── */}
        <Card className="bg-gradient-to-br from-primary/15 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <Camera className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">
                    Quick Plant Scan
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Upload a photo — get instant AI disease diagnosis
                  </p>
                </div>
              </div>
              <Link to="/scan">
                <Button size="lg" className="gap-2">
                  <Camera className="h-5 w-5" />
                  Start Scanning
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* ── Scan Summary Stats ───────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div
                    className={`h-10 w-10 rounded-lg ${stat.bg} flex items-center justify-center`}
                  >
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-9 w-16 mb-2" />
                  ) : (
                    <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  )}
                  <div className="text-sm font-medium">{stat.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {stat.description}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* ── Module Navigation Cards ──────────────────────────────── */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modules.map((mod) => {
              const Icon = mod.icon;
              return (
                <Link key={mod.link} to={mod.link}>
                  <Card
                    className={`group cursor-pointer transition-all hover:shadow-lg ${mod.border}`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div
                          className={`h-14 w-14 rounded-xl ${mod.bg} flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110`}
                        >
                          <Icon className={`h-7 w-7 ${mod.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg mb-1">
                            {mod.title}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {mod.description}
                          </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
