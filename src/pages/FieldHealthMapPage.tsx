import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, ArrowLeft } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { FieldHealthMap } from "@/components/FieldHealthMap";
import { api } from "@/lib/api";

interface ScanRecord {
    _id: string;
    imageUrl?: string;
    disease: string;
    confidence: number;
    createdAt: string;
}

const FieldHealthMapPage = () => {
    const [scans, setScans] = useState<ScanRecord[]>([]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.getScanHistory();
                setScans(res.data || []);
            } catch {
                setScans([]);
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
                            <MapPin className="h-7 w-7 text-primary" />
                            Field Health Map
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            Draw and manage your farm field boundaries on the map
                        </p>
                    </div>
                </div>

                {/* Content */}
                <FieldHealthMap scans={scans} />
            </main>

            <Footer />
        </div>
    );
};

export default FieldHealthMapPage;
