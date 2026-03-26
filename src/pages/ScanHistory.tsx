import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    History,
    Leaf,
    CheckCircle,
    AlertTriangle,
    Calendar,
    ArrowLeft,
    Camera,
    ChevronDown,
    ChevronUp,
    Clock,
    TrendingUp,
} from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

interface Prediction {
    label: string;
    confidence: number;
}

interface ScanRecord {
    _id: string;
    imageUrl?: string;
    predictedLabel?: string;
    disease?: string;
    confidence: number;
    status: "healthy" | "infected" | "unknown";
    predictions?: Prediction[];
    createdAt: string;
    predictedDisease?: {
        name?: string;
        severity?: string;
    };
}

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-PK", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
    });

const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-PK", {
        hour: "2-digit",
        minute: "2-digit",
    });

const ScanHistory = () => {
    const [scans, setScans] = useState<ScanRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<string | null>(null);

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

    const toggle = (id: string) =>
        setExpanded((prev) => (prev === id ? null : id));

    return (
        <div className="min-h-screen flex flex-col">
            <Navigation />

            <main className="flex-1 container mx-auto px-4 py-8 mt-20 space-y-6">
                {/* Back + Header */}
                <div className="flex items-center gap-3">
                    <Link to="/dashboard">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <History className="h-7 w-7 text-primary" />
                            Scan History
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            All your plant disease detection scans
                        </p>
                    </div>
                </div>

                {/* Scan List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <History className="h-5 w-5" />
                            All Scans
                            {!loading && scans.length > 0 && (
                                <Badge variant="outline" className="ml-auto">
                                    {scans.length} record{scans.length !== 1 ? "s" : ""}
                                </Badge>
                            )}
                        </CardTitle>
                        <CardDescription>
                            Click any scan to view the full detection report
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3, 4].map((n) => (
                                    <div key={n} className="flex items-center gap-4 p-4 rounded-lg border">
                                        <Skeleton className="h-20 w-20 rounded-lg" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-48" />
                                            <Skeleton className="h-3 w-32" />
                                            <Skeleton className="h-3 w-24" />
                                        </div>
                                        <Skeleton className="h-6 w-20" />
                                    </div>
                                ))}
                            </div>
                        ) : scans.length === 0 ? (
                            <div className="text-center py-16">
                                <Leaf className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                                <p className="text-muted-foreground mb-4">
                                    No scans yet — start by scanning your first plant!
                                </p>
                                <Link to="/scan">
                                    <Button className="gap-2">
                                        <Camera className="h-4 w-4" />
                                        Scan Your First Plant
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {scans.map((scan) => {
                                    const isHealthy = scan.status === "healthy" ||
                                        (scan.predictedLabel || scan.disease || "").toLowerCase().includes("healthy");
                                    const isUnrecognized = scan.status === "unrecognized" || scan.status === "unknown";
                                    const pct = Math.round((scan.confidence || 0) * 100);
                                    const label = scan.predictedLabel || scan.disease || "Unknown";
                                    const displayName = label.replace(/___/g, " – ").replace(/_/g, " ");
                                    const isOpen = expanded === scan._id;

                                    return (
                                        <div
                                            key={scan._id}
                                            className="rounded-lg border hover:border-primary/40 transition-colors overflow-hidden"
                                        >
                                            {/* Summary Row */}
                                            <button
                                                onClick={() => toggle(scan._id)}
                                                className="w-full flex items-center gap-4 p-4 text-left"
                                            >
                                                {/* Image */}
                                                {scan.imageUrl ? (
                                                    <img
                                                        src={scan.imageUrl}
                                                        alt={displayName}
                                                        className="h-20 w-20 rounded-lg object-cover flex-shrink-0 bg-muted"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = "none";
                                                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                                                        }}
                                                    />
                                                ) : null}
                                                <div className={`h-20 w-20 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 ${scan.imageUrl ? "hidden" : ""}`}>
                                                    <Leaf className="h-8 w-8 text-muted-foreground" />
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold truncate text-base">
                                                        {displayName}
                                                    </h4>
                                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                                                            <Calendar className="h-3.5 w-3.5" />
                                                            {formatDate(scan.createdAt)}
                                                        </span>
                                                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                                                            <Clock className="h-3.5 w-3.5" />
                                                            {formatTime(scan.createdAt)}
                                                        </span>
                                                    </div>
                                                    {/* Confidence bar */}
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full transition-all ${isUnrecognized ? "bg-muted-foreground" : isHealthy ? "bg-green-500" : "bg-orange-500"}`}
                                                                style={{ width: `${pct}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-medium w-10 text-right">{pct}%</span>
                                                    </div>
                                                </div>

                                                {/* Badge + chevron */}
                                                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                                    <Badge
                                                        variant={isUnrecognized ? "secondary" : isHealthy ? "default" : "destructive"}
                                                        className="gap-1"
                                                    >
                                                        {isUnrecognized ? <AlertTriangle className="h-3 w-3" /> 
                                                        : isHealthy ? <CheckCircle className="h-3 w-3" /> 
                                                        : <AlertTriangle className="h-3 w-3" />}
                                                        
                                                        {isUnrecognized ? "Unknown" : isHealthy ? "Healthy" : "Infected"}
                                                    </Badge>
                                                    {isOpen
                                                        ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                                        : <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                    }
                                                </div>
                                            </button>

                                            {/* Expanded Report */}
                                            {isOpen && (
                                                <div className="border-t bg-muted/30 px-4 py-4 space-y-4">
                                                    <h5 className="font-semibold text-sm flex items-center gap-2">
                                                        <TrendingUp className="h-4 w-4 text-primary" />
                                                        Detection Report
                                                    </h5>

                                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                                                        <div className="bg-background rounded-lg p-3 border">
                                                            <p className="text-muted-foreground text-xs mb-1">Disease</p>
                                                            <p className="font-medium">{displayName}</p>
                                                        </div>
                                                        <div className="bg-background rounded-lg p-3 border">
                                                            <p className="text-muted-foreground text-xs mb-1">Confidence</p>
                                                            <p className="font-medium">{pct}%</p>
                                                        </div>
                                                        <div className="bg-background rounded-lg p-3 border">
                                                            <p className="text-muted-foreground text-xs mb-1">Status</p>
                                                            <p className={`font-medium ${isUnrecognized ? "text-muted-foreground" : isHealthy ? "text-green-600" : "text-orange-600"}`}>
                                                                {isUnrecognized ? "⚪ Unknown" : isHealthy ? "✅ Healthy" : "⚠️ Infected"}
                                                            </p>
                                                        </div>
                                                        <div className="bg-background rounded-lg p-3 border">
                                                            <p className="text-muted-foreground text-xs mb-1">Scanned On</p>
                                                            <p className="font-medium">{formatDate(scan.createdAt)}</p>
                                                        </div>
                                                        <div className="bg-background rounded-lg p-3 border">
                                                            <p className="text-muted-foreground text-xs mb-1">Time</p>
                                                            <p className="font-medium">{formatTime(scan.createdAt)}</p>
                                                        </div>
                                                        {scan.predictedDisease?.severity && (
                                                            <div className="bg-background rounded-lg p-3 border">
                                                                <p className="text-muted-foreground text-xs mb-1">Severity</p>
                                                                <p className="font-medium capitalize">{scan.predictedDisease.severity}</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Top-3 Predictions */}
                                                    {scan.predictions && scan.predictions.length > 0 && (
                                                        <div>
                                                            <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
                                                                Top Predictions
                                                            </p>
                                                            <div className="space-y-2">
                                                                {scan.predictions.slice(0, 3).map((p, idx) => {
                                                                    const pName = p.label.replace(/___/g, " – ").replace(/_/g, " ");
                                                                    const pPct = Math.round((p.confidence || 0) * 100);
                                                                    return (
                                                                        <div key={idx} className="flex items-center gap-3 text-sm">
                                                                            <span className="w-5 text-center text-muted-foreground text-xs font-bold">#{idx + 1}</span>
                                                                            <span className="flex-1 truncate">{pName}</span>
                                                                            <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                                                                                <div
                                                                                    className="h-full bg-primary/60 rounded-full"
                                                                                    style={{ width: `${pPct}%` }}
                                                                                />
                                                                            </div>
                                                                            <span className="w-10 text-right text-xs font-medium">{pPct}%</span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>

            <Footer />
        </div>
    );
};

export default ScanHistory;

