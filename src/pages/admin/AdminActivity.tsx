import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api";
import {
  ArrowLeft, RefreshCw, BarChart3, CalendarDays,
  Users, Monitor, Smartphone, Activity,
} from "lucide-react";

interface Stats {
  totalUsers: number;
  totalDetections: number;
  todayScans: number;
  todayNewUsers: number;
  platformBreakdown: { web: number; mobile: number };
  recentDetections: {
    id: string;
    predictedLabel: string;
    confidence: number;
    status: string;
    platform: string;
    createdAt: string;
  }[];
}

const statusColor = (s: string) => {
  if (s === "healthy")  return "text-emerald-600";
  if (s === "infected") return "text-red-500";
  return "text-amber-500";
};

const AdminActivity = () => {
  const [stats, setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");

  const fetchStats = () => {
    setLoading(true);
    setError("");
    api.getAdminStats()
      .then((res) => setStats(res.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStats(); }, []);

  const webCount    = stats?.platformBreakdown?.web    ?? 0;
  const mobileCount = stats?.platformBreakdown?.mobile ?? 0;
  const totalPlatform = webCount + mobileCount || 1;
  const webPct    = Math.round((webCount    / totalPlatform) * 100);
  const mobilePct = Math.round((mobileCount / totalPlatform) * 100);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 container mx-auto px-4 py-8 mt-20 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold">System Activity</h1>
          </div>
          <Button variant="outline" size="sm" onClick={fetchStats} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Today's Activity */}
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-muted-foreground" /> Today's Activity
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: Activity,  label: "Today's Scans",   value: stats?.todayScans,    color: "text-violet-500",  bg: "bg-violet-500/10"  },
              { icon: Users,     label: "New Users Today",  value: stats?.todayNewUsers, color: "text-primary",    bg: "bg-primary/10"     },
            ].map((c, i) => {
              const Icon = c.icon;
              return (
                <Card key={i} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-5 pb-4 flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`h-6 w-6 ${c.color}`} />
                    </div>
                    <div>
                      {loading
                        ? <Skeleton className="h-8 w-16 mb-1" />
                        : <div className={`text-3xl font-bold ${c.color}`}>{c.value ?? 0}</div>}
                      <div className="text-sm text-muted-foreground">{c.label}</div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Platform Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" /> Platform Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <Skeleton className="h-6 w-full rounded-full" />
            ) : (
              <>
                {/* Stacked bar */}
                <div className="w-full h-5 rounded-full overflow-hidden flex">
                  <div className="bg-blue-500 h-full transition-all" style={{ width: `${webPct}%` }} />
                  <div className="bg-amber-400 h-full transition-all" style={{ width: `${mobilePct}%` }} />
                </div>
                {/* Legend */}
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-muted-foreground">Web</span>
                    <span className="font-bold text-blue-500">{webCount}</span>
                    <span className="text-xs text-muted-foreground">({webPct}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-amber-500" />
                    <span className="text-sm text-muted-foreground">Mobile</span>
                    <span className="font-bold text-amber-500">{mobileCount}</span>
                    <span className="text-xs text-muted-foreground">({mobilePct}%)</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Overall Stats */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Overall Statistics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: Users,    label: "Total Users",  value: stats?.totalUsers,       color: "text-primary",   bg: "bg-primary/10"   },
              { icon: BarChart3, label: "Total Scans", value: stats?.totalDetections,  color: "text-emerald-500", bg: "bg-emerald-500/10" },
            ].map((c, i) => {
              const Icon = c.icon;
              return (
                <Card key={i} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-5 pb-4 flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`h-6 w-6 ${c.color}`} />
                    </div>
                    <div>
                      {loading
                        ? <Skeleton className="h-8 w-16 mb-1" />
                        : <div className={`text-3xl font-bold ${c.color}`}>{c.value ?? 0}</div>}
                      <div className="text-sm text-muted-foreground">{c.label}</div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recent Detections */}
        {!loading && stats?.recentDetections && stats.recentDetections.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3">Recent Detections</h2>
            <Card>
              <CardContent className="p-0 divide-y">
                {stats.recentDetections.map((d) => (
                  <div key={d.id} className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{d.predictedLabel}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(d.createdAt).toLocaleDateString("en-US", {
                          day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <Progress value={d.confidence * 100} className="h-1.5 w-16" />
                      <span className={`text-xs font-semibold ${statusColor(d.status)}`}>
                        {(d.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs capitalize">
                      {d.status}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-xs capitalize ${d.platform === "mobile" ? "border-amber-400/50 text-amber-600" : "border-blue-400/50 text-blue-600"}`}
                    >
                      {d.platform}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminActivity;
