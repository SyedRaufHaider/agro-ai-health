import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Camera,
  History,
  Leaf,
  Activity,
  Shield,
  CheckCircle,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { CropCalendar } from "@/components/CropCalendar";
import { FieldHealthMap } from "@/components/FieldHealthMap";
import { DiseaseTrendList } from "@/components/DiseaseTrendList";

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

        {/* ── Row: Scan History + Disease Trends ──────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Scans */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Scan History
              </CardTitle>
              <CardDescription>
                Your latest plant disease detections
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="flex items-center gap-4 p-4 rounded-lg border"
                    >
                      <Skeleton className="h-16 w-16 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-6 w-20" />
                    </div>
                  ))}
                </div>
              ) : scans.length === 0 ? (
                <div className="text-center py-12">
                  <Leaf className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground mb-4">No scans yet</p>
                  <Link to="/scan">
                    <Button variant="outline">Scan Your First Plant</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {scans.slice(0, 6).map((scan) => {
                    const isHealthy = scan.disease
                      ?.toLowerCase()
                      .includes("healthy");
                    const pct = Math.round((scan.confidence || 0) * 100);
                    const date = new Date(scan.createdAt).toLocaleDateString(
                      "en-PK",
                      { month: "short", day: "numeric", year: "numeric" }
                    );
                    return (
                      <div
                        key={scan._id}
                        className="flex items-center gap-4 p-3 rounded-lg border hover:border-primary/30 transition-colors"
                      >
                        {scan.imageUrl ? (
                          <img
                            src={scan.imageUrl}
                            alt={scan.disease}
                            className="h-14 w-14 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                            <Leaf className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate">
                            {scan.disease}
                          </h4>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {date}
                          </p>
                        </div>
                        <Badge
                          variant={isHealthy ? "default" : "secondary"}
                          className="flex-shrink-0"
                        >
                          {isHealthy ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <AlertTriangle className="h-3 w-3 mr-1" />
                          )}
                          {pct}%
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Disease Trends */}
          <DiseaseTrendList scans={scans} />
        </div>

        {/* ── Crop Calendar ────────────────────────────────────────── */}
        <CropCalendar scans={scans} />

        {/* ── Field Health Map ─────────────────────────────────────── */}
        <FieldHealthMap />
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
