import { useState, useEffect } from "react";
import {
    Calendar,
    CheckCircle,
    Sprout,
    Scissors,
    ChevronLeft,
    ChevronRight,
    X,
    Leaf,
    AlertTriangle,
    MapPin,
    Loader2,
    ChevronDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ─── Province definitions ───────────────────────────────────────────────────
// Each province has a bounding box [minLat, maxLat, minLon, maxLon]
const PROVINCE_BOUNDS: Record<string, [number, number, number, number]> = {
    Punjab:            [27.7,  36.4,  69.2,  75.4],
    Sindh:             [23.5,  28.5,  66.5,  71.2],
    KPK:               [31.0,  36.9,  69.3,  74.1],
    Balochistan:       [24.8,  32.5,  60.9,  70.4],
    "Gilgit-Baltistan":[34.5,  37.1,  72.0,  77.8],
    "Azad Kashmir":    [33.0,  36.0,  73.0,  75.5],
};

// ─── Province-specific crop calendars ────────────────────────────────────────
// sowStart/sowEnd/harvestStart/harvestEnd are 0-indexed month numbers
type Crop = {
    name: string;
    emoji: string;
    sowStart: number;
    sowEnd: number;
    harvestStart: number;
    harvestEnd: number;
    color: string;
};

const PROVINCE_CROPS: Record<string, Crop[]> = {
    Punjab: [
        { name: "Wheat",       emoji: "🌾", sowStart: 10, sowEnd: 11, harvestStart: 3,  harvestEnd: 4,  color: "bg-amber-100 dark:bg-amber-900/40 border-amber-400 dark:border-amber-600" },
        { name: "Rice (IRRI)", emoji: "🍚", sowStart: 5,  sowEnd: 6,  harvestStart: 9,  harvestEnd: 10, color: "bg-green-100 dark:bg-green-900/40 border-green-400 dark:border-green-600" },
        { name: "Cotton",      emoji: "☁️", sowStart: 3,  sowEnd: 4,  harvestStart: 9,  harvestEnd: 11, color: "bg-sky-100 dark:bg-sky-900/40 border-sky-400 dark:border-sky-600" },
        { name: "Sugarcane",   emoji: "🎋", sowStart: 1,  sowEnd: 2,  harvestStart: 10, harvestEnd: 0,  color: "bg-emerald-100 dark:bg-emerald-900/40 border-emerald-400 dark:border-emerald-600" },
        { name: "Maize",       emoji: "🌽", sowStart: 6,  sowEnd: 7,  harvestStart: 9,  harvestEnd: 10, color: "bg-lime-100 dark:bg-lime-900/40 border-lime-400 dark:border-lime-600" },
        { name: "Mustard",     emoji: "🌼", sowStart: 9,  sowEnd: 10, harvestStart: 1,  harvestEnd: 2,  color: "bg-yellow-100 dark:bg-yellow-900/40 border-yellow-400 dark:border-yellow-600" },
        { name: "Potato",      emoji: "🥔", sowStart: 9,  sowEnd: 10, harvestStart: 0,  harvestEnd: 1,  color: "bg-orange-100 dark:bg-orange-900/40 border-orange-400 dark:border-orange-600" },
        { name: "Tomato",      emoji: "🍅", sowStart: 1,  sowEnd: 2,  harvestStart: 5,  harvestEnd: 7,  color: "bg-red-100 dark:bg-red-900/40 border-red-400 dark:border-red-600" },
        { name: "Onion",       emoji: "🧅", sowStart: 9,  sowEnd: 10, harvestStart: 2,  harvestEnd: 3,  color: "bg-purple-100 dark:bg-purple-900/40 border-purple-400 dark:border-purple-600" },
        { name: "Mango",       emoji: "🥭", sowStart: 1,  sowEnd: 2,  harvestStart: 5,  harvestEnd: 7,  color: "bg-rose-100 dark:bg-rose-900/40 border-rose-400 dark:border-rose-600" },
    ],
    Sindh: [
        { name: "Wheat",       emoji: "🌾", sowStart: 10, sowEnd: 11, harvestStart: 2,  harvestEnd: 3,  color: "bg-amber-100 dark:bg-amber-900/40 border-amber-400 dark:border-amber-600" },
        { name: "Rice (IRRI)", emoji: "🍚", sowStart: 5,  sowEnd: 6,  harvestStart: 9,  harvestEnd: 10, color: "bg-green-100 dark:bg-green-900/40 border-green-400 dark:border-green-600" },
        { name: "Cotton",      emoji: "☁️", sowStart: 3,  sowEnd: 4,  harvestStart: 9,  harvestEnd: 11, color: "bg-sky-100 dark:bg-sky-900/40 border-sky-400 dark:border-sky-600" },
        { name: "Sugarcane",   emoji: "🎋", sowStart: 0,  sowEnd: 1,  harvestStart: 11, harvestEnd: 0,  color: "bg-emerald-100 dark:bg-emerald-900/40 border-emerald-400 dark:border-emerald-600" },
        { name: "Mango",       emoji: "🥭", sowStart: 1,  sowEnd: 2,  harvestStart: 5,  harvestEnd: 7,  color: "bg-rose-100 dark:bg-rose-900/40 border-rose-400 dark:border-rose-600" },
        { name: "Banana",      emoji: "🍌", sowStart: 2,  sowEnd: 3,  harvestStart: 8,  harvestEnd: 10, color: "bg-yellow-100 dark:bg-yellow-900/40 border-yellow-400 dark:border-yellow-600" },
        { name: "Tomato",      emoji: "🍅", sowStart: 9,  sowEnd: 10, harvestStart: 1,  harvestEnd: 3,  color: "bg-red-100 dark:bg-red-900/40 border-red-400 dark:border-red-600" },
        { name: "Onion",       emoji: "🧅", sowStart: 9,  sowEnd: 10, harvestStart: 2,  harvestEnd: 3,  color: "bg-purple-100 dark:bg-purple-900/40 border-purple-400 dark:border-purple-600" },
        { name: "Chili",       emoji: "🌶️", sowStart: 1,  sowEnd: 2,  harvestStart: 5,  harvestEnd: 7,  color: "bg-red-200 dark:bg-red-900/40 border-red-500 dark:border-red-700" },
        { name: "Garlic",      emoji: "🧄", sowStart: 9,  sowEnd: 10, harvestStart: 1,  harvestEnd: 2,  color: "bg-slate-100 dark:bg-slate-900/40 border-slate-400 dark:border-slate-600" },
    ],
    KPK: [
        { name: "Wheat",      emoji: "🌾", sowStart: 9,  sowEnd: 10, harvestStart: 4,  harvestEnd: 5,  color: "bg-amber-100 dark:bg-amber-900/40 border-amber-400 dark:border-amber-600" },
        { name: "Maize",      emoji: "🌽", sowStart: 3,  sowEnd: 4,  harvestStart: 7,  harvestEnd: 8,  color: "bg-lime-100 dark:bg-lime-900/40 border-lime-400 dark:border-lime-600" },
        { name: "Rice (Basmati)", emoji: "🍚", sowStart: 5, sowEnd: 6, harvestStart: 9, harvestEnd: 10, color: "bg-green-100 dark:bg-green-900/40 border-green-400 dark:border-green-600" },
        { name: "Sugarcane",  emoji: "🎋", sowStart: 1,  sowEnd: 2,  harvestStart: 10, harvestEnd: 0,  color: "bg-emerald-100 dark:bg-emerald-900/40 border-emerald-400 dark:border-emerald-600" },
        { name: "Tobacco",    emoji: "🌿", sowStart: 1,  sowEnd: 2,  harvestStart: 5,  harvestEnd: 6,  color: "bg-teal-100 dark:bg-teal-900/40 border-teal-400 dark:border-teal-600" },
        { name: "Peach",      emoji: "🍑", sowStart: 1,  sowEnd: 2,  harvestStart: 5,  harvestEnd: 7,  color: "bg-orange-100 dark:bg-orange-900/40 border-orange-400 dark:border-orange-600" },
        { name: "Apple",      emoji: "🍎", sowStart: 2,  sowEnd: 3,  harvestStart: 8,  harvestEnd: 9,  color: "bg-red-100 dark:bg-red-900/40 border-red-400 dark:border-red-600" },
        { name: "Potato",     emoji: "🥔", sowStart: 3,  sowEnd: 4,  harvestStart: 7,  harvestEnd: 8,  color: "bg-yellow-100 dark:bg-yellow-900/40 border-yellow-400 dark:border-yellow-600" },
        { name: "Mustard",    emoji: "🌼", sowStart: 9,  sowEnd: 10, harvestStart: 2,  harvestEnd: 3,  color: "bg-yellow-200 dark:bg-yellow-900/40 border-yellow-500 dark:border-yellow-700" },
        { name: "Onion",      emoji: "🧅", sowStart: 10, sowEnd: 11, harvestStart: 3,  harvestEnd: 4,  color: "bg-purple-100 dark:bg-purple-900/40 border-purple-400 dark:border-purple-600" },
    ],
    Balochistan: [
        { name: "Wheat",     emoji: "🌾", sowStart: 10, sowEnd: 11, harvestStart: 3,  harvestEnd: 4,  color: "bg-amber-100 dark:bg-amber-900/40 border-amber-400 dark:border-amber-600" },
        { name: "Apple",     emoji: "🍎", sowStart: 2,  sowEnd: 3,  harvestStart: 8,  harvestEnd: 10, color: "bg-red-100 dark:bg-red-900/40 border-red-400 dark:border-red-600" },
        { name: "Grapes",    emoji: "🍇", sowStart: 2,  sowEnd: 3,  harvestStart: 8,  harvestEnd: 9,  color: "bg-violet-100 dark:bg-violet-900/40 border-violet-400 dark:border-violet-600" },
        { name: "Pomegranate", emoji: "🍓", sowStart: 1, sowEnd: 2, harvestStart: 9,  harvestEnd: 11, color: "bg-rose-100 dark:bg-rose-900/40 border-rose-400 dark:border-rose-600" },
        { name: "Cotton",    emoji: "☁️", sowStart: 3,  sowEnd: 4,  harvestStart: 9,  harvestEnd: 11, color: "bg-sky-100 dark:bg-sky-900/40 border-sky-400 dark:border-sky-600" },
        { name: "Sorghum",   emoji: "🌿", sowStart: 3,  sowEnd: 4,  harvestStart: 9,  harvestEnd: 10, color: "bg-green-100 dark:bg-green-900/40 border-green-400 dark:border-green-600" },
        { name: "Watermelon",emoji: "🍉", sowStart: 2,  sowEnd: 3,  harvestStart: 6,  harvestEnd: 7,  color: "bg-emerald-100 dark:bg-emerald-900/40 border-emerald-400 dark:border-emerald-600" },
        { name: "Melon",     emoji: "🍈", sowStart: 2,  sowEnd: 3,  harvestStart: 6,  harvestEnd: 7,  color: "bg-lime-100 dark:bg-lime-900/40 border-lime-400 dark:border-lime-600" },
        { name: "Date Palm", emoji: "🌴", sowStart: 0,  sowEnd: 1,  harvestStart: 8,  harvestEnd: 10, color: "bg-orange-100 dark:bg-orange-900/40 border-orange-400 dark:border-orange-600" },
        { name: "Potato",    emoji: "🥔", sowStart: 9,  sowEnd: 10, harvestStart: 0,  harvestEnd: 2,  color: "bg-yellow-100 dark:bg-yellow-900/40 border-yellow-400 dark:border-yellow-600" },
    ],
    "Gilgit-Baltistan": [
        { name: "Wheat",       emoji: "🌾", sowStart: 3,  sowEnd: 4,  harvestStart: 8,  harvestEnd: 9,  color: "bg-amber-100 dark:bg-amber-900/40 border-amber-400 dark:border-amber-600" },
        { name: "Maize",       emoji: "🌽", sowStart: 4,  sowEnd: 5,  harvestStart: 8,  harvestEnd: 9,  color: "bg-lime-100 dark:bg-lime-900/40 border-lime-400 dark:border-lime-600" },
        { name: "Apple",       emoji: "🍎", sowStart: 2,  sowEnd: 3,  harvestStart: 8,  harvestEnd: 10, color: "bg-red-100 dark:bg-red-900/40 border-red-400 dark:border-red-600" },
        { name: "Apricot",     emoji: "🍊", sowStart: 2,  sowEnd: 3,  harvestStart: 6,  harvestEnd: 7,  color: "bg-orange-100 dark:bg-orange-900/40 border-orange-400 dark:border-orange-600" },
        { name: "Cherry",      emoji: "🍒", sowStart: 2,  sowEnd: 3,  harvestStart: 5,  harvestEnd: 6,  color: "bg-rose-100 dark:bg-rose-900/40 border-rose-400 dark:border-rose-600" },
        { name: "Walnut",      emoji: "🌰", sowStart: 3,  sowEnd: 4,  harvestStart: 9,  harvestEnd: 10, color: "bg-yellow-100 dark:bg-yellow-900/40 border-yellow-400 dark:border-yellow-600" },
        { name: "Buckwheat",   emoji: "🌿", sowStart: 4,  sowEnd: 5,  harvestStart: 8,  harvestEnd: 9,  color: "bg-teal-100 dark:bg-teal-900/40 border-teal-400 dark:border-teal-600" },
        { name: "Potato",      emoji: "🥔", sowStart: 4,  sowEnd: 5,  harvestStart: 8,  harvestEnd: 9,  color: "bg-yellow-200 dark:bg-yellow-900/40 border-yellow-500 dark:border-yellow-700" },
    ],
    "Azad Kashmir": [
        { name: "Wheat",    emoji: "🌾", sowStart: 9,  sowEnd: 10, harvestStart: 4,  harvestEnd: 5,  color: "bg-amber-100 dark:bg-amber-900/40 border-amber-400 dark:border-amber-600" },
        { name: "Maize",    emoji: "🌽", sowStart: 3,  sowEnd: 4,  harvestStart: 7,  harvestEnd: 8,  color: "bg-lime-100 dark:bg-lime-900/40 border-lime-400 dark:border-lime-600" },
        { name: "Rice",     emoji: "🍚", sowStart: 5,  sowEnd: 6,  harvestStart: 9,  harvestEnd: 10, color: "bg-green-100 dark:bg-green-900/40 border-green-400 dark:border-green-600" },
        { name: "Apple",    emoji: "🍎", sowStart: 2,  sowEnd: 3,  harvestStart: 8,  harvestEnd: 9,  color: "bg-red-100 dark:bg-red-900/40 border-red-400 dark:border-red-600" },
        { name: "Peach",    emoji: "🍑", sowStart: 2,  sowEnd: 3,  harvestStart: 6,  harvestEnd: 7,  color: "bg-orange-100 dark:bg-orange-900/40 border-orange-400 dark:border-orange-600" },
        { name: "Walnut",   emoji: "🌰", sowStart: 3,  sowEnd: 4,  harvestStart: 9,  harvestEnd: 10, color: "bg-yellow-100 dark:bg-yellow-900/40 border-yellow-400 dark:border-yellow-600" },
        { name: "Potato",   emoji: "🥔", sowStart: 3,  sowEnd: 4,  harvestStart: 7,  harvestEnd: 8,  color: "bg-yellow-200 dark:bg-yellow-900/40 border-yellow-500 dark:border-yellow-700" },
        { name: "Sugarcane", emoji: "🎋", sowStart: 1, sowEnd: 2, harvestStart: 10, harvestEnd: 0,  color: "bg-emerald-100 dark:bg-emerald-900/40 border-emerald-400 dark:border-emerald-600" },
    ],
};

const PROVINCES = Object.keys(PROVINCE_BOUNDS);
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_FULL = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function detectProvince(lat: number, lon: number): string | null {
    for (const [province, [minLat, maxLat, minLon, maxLon]] of Object.entries(PROVINCE_BOUNDS)) {
        if (lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon) {
            return province;
        }
    }
    return null;
}

function isInRange(month: number, start: number, end: number): boolean {
    if (start <= end) return month >= start && month <= end;
    return month >= start || month <= end;
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface ScanRecord {
    _id: string;
    imageUrl?: string;
    disease: string;
    confidence: number;
    createdAt: string;
}

interface CropCalendarProps {
    scans?: ScanRecord[];
}

// ─── Component ────────────────────────────────────────────────────────────────
export const CropCalendar = ({ scans = [] }: CropCalendarProps) => {
    const now = new Date();
    const currentMonth = now.getMonth();

    // Province state
    const [province, setProvince] = useState<string>("Punjab");
    const [locStatus, setLocStatus] = useState<"idle" | "loading" | "detected" | "error">("idle");
    const [locError, setLocError] = useState<string>("");
    const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);

    // Scan Date Calendar state
    const [calMonth, setCalMonth] = useState(now.getMonth());
    const [calYear, setCalYear] = useState(now.getFullYear());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const CROPS = PROVINCE_CROPS[province] ?? PROVINCE_CROPS["Punjab"];

    // Geolocation on mount
    useEffect(() => {
        if (!navigator.geolocation) {
            setLocStatus("error");
            setLocError("Geolocation not supported by this browser.");
            return;
        }
        setLocStatus("loading");
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const detected = detectProvince(pos.coords.latitude, pos.coords.longitude);
                if (detected) {
                    setProvince(detected);
                    setLocStatus("detected");
                } else {
                    setLocStatus("error");
                    setLocError("Location outside Pakistan — showing Punjab by default.");
                }
            },
            () => {
                setLocStatus("error");
                setLocError("Location access denied — please select province manually.");
            },
            { timeout: 8000 }
        );
    }, []);

    // Group scans by date
    const scansByDate: Record<string, ScanRecord[]> = {};
    scans.forEach((s) => {
        const key = new Date(s.createdAt).toISOString().slice(0, 10);
        if (!scansByDate[key]) scansByDate[key] = [];
        scansByDate[key].push(s);
    });

    const scanMonths = new Set(scans.map((s) => new Date(s.createdAt).getMonth()));

    // Calendar grid helpers
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

    const prevMonth = () => {
        if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1); }
        else setCalMonth((m) => m - 1);
        setSelectedDate(null);
    };
    const nextMonth = () => {
        if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1); }
        else setCalMonth((m) => m + 1);
        setSelectedDate(null);
    };

    const selectedScans = selectedDate ? scansByDate[selectedDate] || [] : [];

    return (
        <div className="w-full space-y-6">
            {/* ── Province selector & location banner ──────────────────────── */}
            <Card className="border-2">
                <CardHeader className="pb-3">
                    <CardTitle className="flex flex-wrap items-center gap-3 text-xl sm:text-2xl">
                        <Calendar className="h-6 w-6 sm:h-7 sm:w-7 text-primary flex-shrink-0" />
                        <span>Crop Calendar — Pakistan</span>
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                        Sowing &amp; harvest schedule tailored to your province. Click a date to see scan results.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Province picker row */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <MapPin className="h-4 w-4 flex-shrink-0" />
                            {locStatus === "loading" && (
                                <span className="flex items-center gap-1">
                                    <Loader2 className="h-4 w-4 animate-spin" /> Detecting location…
                                </span>
                            )}
                            {locStatus === "detected" && (
                                <span className="text-green-600 dark:text-green-400 font-semibold">
                                    Auto-detected: {province}
                                </span>
                            )}
                            {(locStatus === "error" || locStatus === "idle") && (
                                <span className="text-amber-600 dark:text-amber-400 text-xs">
                                    {locError || "Select your province:"}
                                </span>
                            )}
                        </div>

                        {/* Dropdown */}
                        <div className="relative">
                            <Button
                                variant="outline"
                                className="flex items-center gap-2 text-sm sm:text-base px-4 py-2 h-auto font-semibold min-w-[180px] justify-between"
                                onClick={() => setShowProvinceDropdown((v) => !v)}
                            >
                                <span>📍 {province}</span>
                                <ChevronDown className={`h-4 w-4 transition-transform ${showProvinceDropdown ? "rotate-180" : ""}`} />
                            </Button>
                            {showProvinceDropdown && (
                                <div className="absolute z-50 top-full mt-1 left-0 bg-popover border border-border rounded-lg shadow-lg min-w-[200px] py-1">
                                    {PROVINCES.map((p) => (
                                        <button
                                            key={p}
                                            className={`w-full text-left px-4 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors
                                                ${p === province ? "bg-primary/10 text-primary font-bold" : ""}`}
                                            onClick={() => {
                                                setProvince(p);
                                                setShowProvinceDropdown(false);
                                                setLocStatus("idle");
                                                setLocError("");
                                            }}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ── CROP SOWING/HARVEST GRID ────────────────────────────────── */}
            <Card className="border-2">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                        <Sprout className="h-5 w-5 text-green-600" />
                        Seasonal Crop Schedule — {province}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto -mx-2 px-2">
                        <div className="min-w-[520px]">
                            {/* Month Header */}
                            <div className="flex gap-1 mb-3">
                                <div className="w-28 sm:w-36 shrink-0 text-xs sm:text-sm text-muted-foreground font-semibold flex items-end pb-1">Crop</div>
                                {MONTHS.map((m, i) => (
                                    <div
                                        key={m}
                                        className={`flex-1 text-center text-[10px] sm:text-xs font-bold rounded-md py-1.5 sm:py-2 transition-colors
                                            ${i === currentMonth
                                                ? "bg-primary text-primary-foreground shadow-md"
                                                : "text-muted-foreground bg-muted/30"
                                            }`}
                                    >
                                        {m}
                                    </div>
                                ))}
                            </div>

                            {/* Crop Rows */}
                            <div className="space-y-2">
                                {CROPS.map((crop) => (
                                    <div key={crop.name} className="flex gap-1 items-center">
                                        <div className="w-28 sm:w-36 shrink-0 text-xs sm:text-sm font-semibold flex items-center gap-1.5 pr-1">
                                            <span className="text-base sm:text-lg leading-none">{crop.emoji}</span>
                                            <span className="truncate">{crop.name}</span>
                                        </div>
                                        {MONTHS.map((_, i) => {
                                            const isSowing  = isInRange(i, crop.sowStart, crop.sowEnd);
                                            const isHarvest = isInRange(i, crop.harvestStart, crop.harvestEnd);
                                            const hasScan   = scanMonths.has(i);
                                            const isCurrent = i === currentMonth;

                                            return (
                                                <div
                                                    key={i}
                                                    title={
                                                        isSowing  ? `${crop.name}: Sowing`
                                                        : isHarvest ? `${crop.name}: Harvest`
                                                        : hasScan  ? "Scan recorded" : ""
                                                    }
                                                    className={`flex-1 h-8 sm:h-10 rounded-md flex items-center justify-center border transition-all
                                                        ${isSowing  ? `${crop.color} border-2` : ""}
                                                        ${isHarvest && !isSowing ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400" : ""}
                                                        ${!isSowing && !isHarvest ? "bg-muted/20 border-transparent" : ""}
                                                        ${isCurrent ? "ring-2 ring-primary ring-offset-1" : ""}
                                                    `}
                                                >
                                                    {isSowing  && <Sprout   className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600" />}
                                                    {isHarvest && !isSowing && <Scissors className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-600" />}
                                                    {hasScan && !isSowing && !isHarvest && (
                                                        <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>

                            {/* Legend */}
                            <div className="flex flex-wrap gap-4 mt-4 text-xs sm:text-sm text-muted-foreground border-t pt-3">
                                <span className="flex items-center gap-1.5">
                                    <Sprout className="h-4 w-4 text-green-600" /> Sowing Season
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Scissors className="h-4 w-4 text-yellow-600" /> Harvest Season
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <CheckCircle className="h-4 w-4 text-primary" /> Scan Month
                                </span>
                                <Badge variant="outline" className="text-xs px-2 py-0.5 bg-primary text-primary-foreground border-0">
                                    Current Month
                                </Badge>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ── INTERACTIVE SCAN DATE CALENDAR ─────────────────────────── */}
            <Card className="border-2">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Scan Activity Calendar
                    </CardTitle>
                    <CardDescription className="text-sm">
                        Tap a highlighted date to view your scan results.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Navigation */}
                    <div className="flex items-center justify-between mb-4">
                        <Button size="icon" variant="ghost" className="h-10 w-10 rounded-full" onClick={prevMonth}>
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <span className="text-base sm:text-lg font-bold">
                            {MONTHS_FULL[calMonth]} {calYear}
                        </span>
                        <Button size="icon" variant="ghost" className="h-10 w-10 rounded-full" onClick={nextMonth}>
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Day labels */}
                    <div className="grid grid-cols-7 gap-1.5 mb-1.5">
                        {DAY_LABELS.map((d) => (
                            <div key={d} className="text-center text-xs sm:text-sm font-bold text-muted-foreground py-1">
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Date grid */}
                    <div className="grid grid-cols-7 gap-1.5">
                        {Array.from({ length: firstDay }).map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square" />
                        ))}

                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                            const hasScanOnDay = !!scansByDate[dateStr];
                            const isToday =
                                day === now.getDate() &&
                                calMonth === now.getMonth() &&
                                calYear === now.getFullYear();
                            const isSelected = selectedDate === dateStr;

                            return (
                                <button
                                    key={day}
                                    onClick={() => hasScanOnDay && setSelectedDate(isSelected ? null : dateStr)}
                                    disabled={!hasScanOnDay}
                                    title={hasScanOnDay ? `${scansByDate[dateStr].length} scan(s) — tap to view` : ""}
                                    className={`aspect-square rounded-xl text-sm sm:text-base font-semibold transition-all
                                        flex items-center justify-center relative select-none
                                        ${isToday ? "ring-2 ring-primary ring-offset-2" : ""}
                                        ${isSelected ? "bg-primary text-primary-foreground shadow-lg scale-105" : ""}
                                        ${hasScanOnDay && !isSelected ? "bg-primary/15 text-primary font-bold cursor-pointer hover:bg-primary/30 hover:scale-105" : ""}
                                        ${!hasScanOnDay && !isSelected ? "text-muted-foreground hover:bg-muted/40 cursor-default" : ""}
                                    `}
                                >
                                    {day}
                                    {hasScanOnDay && !isSelected && (
                                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* ── SELECTED DATE SCAN RESULTS ──────────────────────────────── */}
            {selectedDate && (
                <Card className="border-2 border-primary/30">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base sm:text-lg">
                                Scans on{" "}
                                {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-PK", {
                                    weekday: "long", day: "numeric", month: "long", year: "numeric",
                                })}
                            </CardTitle>
                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={() => setSelectedDate(null)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {selectedScans.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No scans found for this date.</p>
                        ) : (
                            <div className="space-y-3 max-h-64 sm:max-h-96 overflow-y-auto pr-1">
                                {selectedScans.map((scan) => {
                                    const isHealthy = scan.disease?.toLowerCase().includes("healthy");
                                    const pct = Math.round((scan.confidence || 0) * 100);
                                    const time = new Date(scan.createdAt).toLocaleTimeString("en-PK", {
                                        hour: "2-digit", minute: "2-digit",
                                    });
                                    return (
                                        <div
                                            key={scan._id}
                                            className="flex items-center gap-4 p-3 sm:p-4 rounded-xl border hover:border-primary/40 transition-colors bg-background"
                                        >
                                            {scan.imageUrl ? (
                                                <img
                                                    src={scan.imageUrl}
                                                    alt={scan.disease}
                                                    className="h-14 w-14 sm:h-16 sm:w-16 rounded-lg object-cover flex-shrink-0"
                                                />
                                            ) : (
                                                <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                                    <Leaf className="h-6 w-6 text-muted-foreground" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm sm:text-base font-semibold truncate">{scan.disease}</p>
                                                <p className="text-xs sm:text-sm text-muted-foreground">{time}</p>
                                            </div>
                                            <Badge
                                                variant={isHealthy ? "default" : "secondary"}
                                                className="flex-shrink-0 text-xs sm:text-sm px-2 py-1"
                                            >
                                                {isHealthy ? (
                                                    <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                                ) : (
                                                    <AlertTriangle className="h-3.5 w-3.5 mr-1" />
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
            )}
        </div>
    );
};
