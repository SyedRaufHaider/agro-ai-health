import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, ArrowLeft } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { DiseaseTrendList } from "@/components/DiseaseTrendList";

interface ScanRecord {
    _id: string;
    disease: string;
    confidence: number;
    createdAt: string;
}

const DiseaseTrends = () => {
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
                            <TrendingUp className="h-7 w-7 text-primary" />
                            Disease Trends
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            Track disease patterns and regional outbreak alerts
                        </p>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-64 w-full rounded-lg" />
                        <Skeleton className="h-40 w-full rounded-lg" />
                    </div>
                ) : (
                    <div className="max-w-3xl">
                        <DiseaseTrendList scans={scans} />
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default DiseaseTrends;
