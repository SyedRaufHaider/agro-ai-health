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

interface ScanRecord {
    _id: string;
    imageUrl?: string;
    disease: string;
    confidence: number;
    createdAt: string;
}

const ScanHistory = () => {
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
                        </CardTitle>
                        <CardDescription>
                            Your complete plant disease detection history
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5].map((n) => (
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
                                            className="flex items-center gap-4 p-4 rounded-lg border hover:border-primary/30 transition-colors"
                                        >
                                            {scan.imageUrl ? (
                                                <img
                                                    src={scan.imageUrl}
                                                    alt={scan.disease}
                                                    className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
                                                />
                                            ) : (
                                                <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                                    <Leaf className="h-7 w-7 text-muted-foreground" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold truncate">
                                                    {scan.disease}
                                                </h4>
                                                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                                    <Calendar className="h-3.5 w-3.5" />
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
            </main>

            <Footer />
        </div>
    );
};

export default ScanHistory;
