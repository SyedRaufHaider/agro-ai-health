import { useState } from "react";
import { Calendar, CheckCircle, Sprout, Scissors, ChevronLeft, ChevronRight, X, Leaf, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Punjab / Pakistan major crops with tentative sowing & harvest months (0-indexed)
const CROPS = [
    { name: "Wheat", emoji: "🌾", sowStart: 10, sowEnd: 11, harvestStart: 3, harvestEnd: 4, color: "bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700" },
    { name: "Rice (IRRI)", emoji: "🌾", sowStart: 5, sowEnd: 6, harvestStart: 9, harvestEnd: 10, color: "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700" },
    { name: "Cotton", emoji: "☁️", sowStart: 3, sowEnd: 4, harvestStart: 9, harvestEnd: 11, color: "bg-sky-100 dark:bg-sky-900/30 border-sky-300 dark:border-sky-700" },
    { name: "Sugarcane", emoji: "🎋", sowStart: 1, sowEnd: 2, harvestStart: 10, harvestEnd: 0, color: "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700" },
    { name: "Maize", emoji: "🌽", sowStart: 6, sowEnd: 7, harvestStart: 9, harvestEnd: 10, color: "bg-lime-100 dark:bg-lime-900/30 border-lime-300 dark:border-lime-700" },
    { name: "Mustard", emoji: "🌼", sowStart: 9, sowEnd: 10, harvestStart: 1, harvestEnd: 2, color: "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700" },
    { name: "Potato", emoji: "🥔", sowStart: 9, sowEnd: 10, harvestStart: 0, harvestEnd: 1, color: "bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700" },
    { name: "Tomato", emoji: "🍅", sowStart: 1, sowEnd: 2, harvestStart: 5, harvestEnd: 7, color: "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700" },
    { name: "Onion", emoji: "🧅", sowStart: 9, sowEnd: 10, harvestStart: 2, harvestEnd: 3, color: "bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700" },
    { name: "Mango", emoji: "🥭", sowStart: 1, sowEnd: 2, harvestStart: 5, harvestEnd: 7, color: "bg-rose-100 dark:bg-rose-900/30 border-rose-300 dark:border-rose-700" },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

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

export const CropCalendar = ({ scans = [] }: CropCalendarProps) => {
    const now = new Date();
    const currentMonth = now.getMonth();

    // ── Scan Date Calendar state ──
    const [calMonth, setCalMonth] = useState(now.getMonth());
    const [calYear, setCalYear] = useState(now.getFullYear());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    // Group scans by date string "YYYY-MM-DD"
    const scansByDate: Record<string, ScanRecord[]> = {};
    scans.forEach((s) => {
        const key = new Date(s.createdAt).toISOString().slice(0, 10);
        if (!scansByDate[key]) scansByDate[key] = [];
        scansByDate[key].push(s);
    });

    // Get months that have scans (for crop grid)
    const scanMonths = new Set(scans.map((s) => new Date(s.createdAt).getMonth()));

    const isInRange = (month: number, start: number, end: number) => {
        if (start <= end) return month >= start && month <= end;
        return month >= start || month <= end;
    };

    // Calendar grid helpers
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

    const prevMonth = () => {
        setCalMonth((m) => (m === 0 ? 11 : m - 1));
        if (calMonth === 0) setCalYear((y) => y - 1);
        setSelectedDate(null);
    };
    const nextMonth = () => {
        setCalMonth((m) => (m === 11 ? 0 : m + 1));
        if (calMonth === 11) setCalYear((y) => y + 1);
        setSelectedDate(null);
    };

    const selectedScans = selectedDate ? scansByDate[selectedDate] || [] : [];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Crop Calendar &amp; Scan Activity — Punjab / Pakistan
                </CardTitle>
                <CardDescription>
                    Sowing &amp; harvest schedule for major crops. Click a date to see scan results.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* ── CROP SOWING/HARVEST GRID ──────────────────────────── */}
                <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                        Seasonal Crop Schedule
                    </p>

                    {/* Month Header */}
                    <div className="flex gap-0.5 mb-2">
                        <div className="w-20 shrink-0 text-xs text-muted-foreground font-medium">Crop</div>
                        {MONTHS.map((m, i) => (
                            <div
                                key={m}
                                className={`flex-1 text-center text-[10px] font-semibold rounded py-0.5 ${i === currentMonth
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground"
                                    }`}
                            >
                                {m}
                            </div>
                        ))}
                    </div>

                    {/* Crop Rows */}
                    <div className="space-y-1">
                        {CROPS.map((crop) => (
                            <div key={crop.name} className="flex gap-0.5 items-center">
                                <div className="w-20 shrink-0 text-xs font-medium flex items-center gap-1">
                                    <span>{crop.emoji}</span>
                                    <span className="truncate">{crop.name}</span>
                                </div>
                                {MONTHS.map((_, i) => {
                                    const isSowing = isInRange(i, crop.sowStart, crop.sowEnd);
                                    const isHarvest = isInRange(i, crop.harvestStart, crop.harvestEnd);
                                    const hasScan = scanMonths.has(i);
                                    const isCurrent = i === currentMonth;

                                    return (
                                        <div
                                            key={i}
                                            title={
                                                isSowing ? `${crop.name}: Sowing`
                                                    : isHarvest ? `${crop.name}: Harvest`
                                                        : hasScan ? "Scan recorded" : ""
                                            }
                                            className={`flex-1 h-5 rounded flex items-center justify-center text-[9px] font-bold border
                        ${isSowing ? `${crop.color} border-2` : ""}
                        ${isHarvest && !isSowing ? "bg-yellow-100 dark:bg-yellow-900/20 border-yellow-400" : ""}
                        ${!isSowing && !isHarvest ? "bg-muted/30 border-transparent" : ""}
                        ${isCurrent ? "ring-2 ring-primary ring-offset-1" : ""}
                      `}
                                        >
                                            {isSowing && <Sprout className="h-2.5 w-2.5 text-green-600" />}
                                            {isHarvest && !isSowing && <Scissors className="h-2.5 w-2.5 text-yellow-600" />}
                                            {hasScan && !isSowing && !isHarvest && (
                                                <CheckCircle className="h-2.5 w-2.5 text-primary" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Sprout className="h-3 w-3 text-green-600" /> Sowing
                        </span>
                        <span className="flex items-center gap-1">
                            <Scissors className="h-3 w-3 text-yellow-600" /> Harvest
                        </span>
                        <span className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-primary" /> Scan Month
                        </span>
                        <Badge variant="outline" className="text-[10px] px-1 py-0 bg-primary text-primary-foreground border-0">
                            Current Month
                        </Badge>
                    </div>
                </div>

                {/* ── INTERACTIVE SCAN DATE CALENDAR ────────────────────── */}
                <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                        Scan Date Calendar
                    </p>

                    {/* Calendar navigation */}
                    <div className="flex items-center justify-between mb-2">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={prevMonth}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-semibold">
                            {MONTHS[calMonth]} {calYear}
                        </span>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={nextMonth}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Day labels */}
                    <div className="grid grid-cols-7 gap-1 mb-1">
                        {DAY_LABELS.map((d) => (
                            <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground">
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Date grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {/* Empty cells for first row offset */}
                        {Array.from({ length: firstDay }).map((_, i) => (
                            <div key={`empty-${i}`} className="h-8" />
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
                                    className={`h-8 rounded text-xs font-medium transition-all flex items-center justify-center relative
                    ${isToday ? "ring-2 ring-primary ring-offset-1" : ""}
                    ${isSelected ? "bg-primary text-primary-foreground" : ""}
                    ${hasScanOnDay && !isSelected ? "bg-primary/15 text-primary font-bold cursor-pointer hover:bg-primary/25" : ""}
                    ${!hasScanOnDay && !isSelected ? "text-muted-foreground hover:bg-muted/40" : ""}
                  `}
                                    disabled={!hasScanOnDay}
                                    title={hasScanOnDay ? `${scansByDate[dateStr].length} scan(s) — click to view` : ""}
                                >
                                    {day}
                                    {hasScanOnDay && !isSelected && (
                                        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── SELECTED DATE SCAN RESULTS ────────────────────────── */}
                {selectedDate && (
                    <div className="border border-border rounded-lg p-3 space-y-2 bg-muted/20">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold">
                                Scans on {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-PK", {
                                    weekday: "short", day: "numeric", month: "short", year: "numeric",
                                })}
                            </p>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={() => setSelectedDate(null)}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                        {selectedScans.length === 0 ? (
                            <p className="text-xs text-muted-foreground">No scans found on this date.</p>
                        ) : (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {selectedScans.map((scan) => {
                                    const isHealthy = scan.disease?.toLowerCase().includes("healthy");
                                    const pct = Math.round((scan.confidence || 0) * 100);
                                    const time = new Date(scan.createdAt).toLocaleTimeString("en-PK", {
                                        hour: "2-digit", minute: "2-digit",
                                    });
                                    return (
                                        <div
                                            key={scan._id}
                                            className="flex items-center gap-3 p-2 rounded-lg border hover:border-primary/30 transition-colors bg-background"
                                        >
                                            {scan.imageUrl ? (
                                                <img
                                                    src={scan.imageUrl}
                                                    alt={scan.disease}
                                                    className="h-10 w-10 rounded-md object-cover flex-shrink-0"
                                                />
                                            ) : (
                                                <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                                                    <Leaf className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold truncate">{scan.disease}</p>
                                                <p className="text-[10px] text-muted-foreground">{time}</p>
                                            </div>
                                            <Badge
                                                variant={isHealthy ? "default" : "secondary"}
                                                className="flex-shrink-0 text-[10px]"
                                            >
                                                {isHealthy ? (
                                                    <CheckCircle className="h-2.5 w-2.5 mr-0.5" />
                                                ) : (
                                                    <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
                                                )}
                                                {pct}%
                                            </Badge>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

            </CardContent>
        </Card>
    );
};
