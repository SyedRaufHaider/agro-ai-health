import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, ArrowLeft } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { CropCalendar } from "@/components/CropCalendar";

interface ScanRecord {
    _id: string;
    imageUrl?: string;
    disease: string;
    confidence: number;
    createdAt: string;
}

const CropCalendarPage = () => {
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
                            <Calendar className="h-7 w-7 text-primary" />
                            Crop Calendar
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            Pakistan crop sowing {"&"} harvest schedule with your scan activity
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="overflow-x-auto">
                    <CropCalendar scans={scans} />
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default CropCalendarPage;
