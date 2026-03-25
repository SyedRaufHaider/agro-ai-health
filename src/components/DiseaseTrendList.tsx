import { useState, useEffect } from "react";
import { TrendingUp, AlertTriangle, MapPin, Loader2, ChevronDown, Sprout, Scissors, Info } from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { Badge } from "@/components/ui/badge";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ScanRecord {
    disease: string;
    confidence: number;
}

interface DiseaseTrendListProps {
    scans: ScanRecord[];
}

interface SeasonalDisease {
    disease: string;
    crop: string;
    emoji: string;
    risk: "High" | "Medium" | "Low";
    /** months (0-indexed) this disease is active */
    activeMonths: number[];
    tip: string;
}

// ─── Province bounds for geolocation ─────────────────────────────────────────
const PROVINCE_BOUNDS: Record<string, [number, number, number, number]> = {
    Punjab:              [27.7, 36.4, 69.2, 75.4],
    Sindh:               [23.5, 28.5, 66.5, 71.2],
    KPK:                 [31.0, 36.9, 69.3, 74.1],
    Balochistan:         [24.8, 32.5, 60.9, 70.4],
    "Gilgit-Baltistan":  [34.5, 37.1, 72.0, 77.8],
    "Azad Kashmir":      [33.0, 36.0, 73.0, 75.5],
};

function detectProvince(lat: number, lon: number): string | null {
    for (const [province, [minLat, maxLat, minLon, maxLon]] of Object.entries(PROVINCE_BOUNDS)) {
        if (lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon) return province;
    }
    return null;
}

// ─── Seasonal Disease Database ────────────────────────────────────────────────
// Each entry is tied to specific active months so the list auto-changes per season.
const PROVINCE_DISEASES: Record<string, SeasonalDisease[]> = {
    Punjab: [
        // Wheat season (Oct–Apr)
        { disease: "Wheat Brown Rust",       crop: "Wheat",     emoji: "🌾", risk: "High",   activeMonths: [0,1,2,3,10,11], tip: "Apply fungicides (Tilt/Folicur) at first sign. Ensure proper row spacing." },
        { disease: "Wheat Yellow Rust",      crop: "Wheat",     emoji: "🌾", risk: "High",   activeMonths: [0,1,2,10,11],   tip: "Use resistant varieties. Spray Propiconazole when humidity is high." },
        { disease: "Loose Smut",             crop: "Wheat",     emoji: "🌾", risk: "Medium", activeMonths: [10,11],          tip: "Treat seeds with Carboxin before sowing. Avoid infected seed lots." },
        // Rice season (May–Nov)
        { disease: "Rice Leaf Blast",        crop: "Rice",      emoji: "🍚", risk: "High",   activeMonths: [5,6,7,8,9],     tip: "Apply Tricyclazole or Isoprothiolane before heading. Avoid excess nitrogen." },
        { disease: "Rice Sheath Blight",     crop: "Rice",      emoji: "🍚", risk: "Medium", activeMonths: [6,7,8,9],       tip: "Apply Validamycin or Hexaconazole. Reduce planting density." },
        { disease: "Rice Bacterial Blight",  crop: "Rice",      emoji: "🍚", risk: "Medium", activeMonths: [7,8,9],         tip: "Use copper-based bactericides. Avoid flood water from infected fields." },
        // Cotton season (Apr–Nov)
        { disease: "Cotton Whitefly",        crop: "Cotton",    emoji: "☁️", risk: "High",   activeMonths: [4,5,6,7,8,9],   tip: "Use Imidacloprid or Thiamethoxam sprays. Introduce natural predators." },
        { disease: "Cotton Bollworm",        crop: "Cotton",    emoji: "☁️", risk: "High",   activeMonths: [6,7,8,9,10],    tip: "Apply Chlorpyrifos at boll formation. Use pheromone traps for monitoring." },
        { disease: "Cotton Leaf Curl Virus", crop: "Cotton",    emoji: "☁️", risk: "High",   activeMonths: [5,6,7,8],       tip: "No cure — remove infected plants. Use resistant varieties like MNH-786." },
        // Sugarcane (Jan–Dec)
        { disease: "Sugarcane Red Rot",      crop: "Sugarcane", emoji: "🎋", risk: "Medium", activeMonths: [3,4,5,6,7,8],   tip: "Use disease-free sets. Treat with fungicide before planting." },
        // Maize (Jun–Oct)
        { disease: "Maize Stalk Rot",        crop: "Maize",     emoji: "🌽", risk: "Medium", activeMonths: [6,7,8,9],       tip: "Avoid waterlogging. Apply balanced NPK fertilizer." },
        { disease: "Maize Leaf Blight",      crop: "Maize",     emoji: "🌽", risk: "Low",    activeMonths: [7,8,9],         tip: "Plant resistant hybrids. Spray Mancozeb at 15-day intervals." },
        // Mustard (Oct–Feb)
        { disease: "Alternaria Leaf Spot",   crop: "Mustard",   emoji: "🌼", risk: "Medium", activeMonths: [10,11,0,1],     tip: "Apply Iprodione at first symptom. Ensure adequate spacing for airflow." },
        // Potato (Sep–Jan)
        { disease: "Potato Late Blight",     crop: "Potato",    emoji: "🥔", risk: "High",   activeMonths: [9,10,11,0],     tip: "Spray Mancozeb/Ridomil Gold. Use certified blight-free seed tubers." },
        // Tomato (Feb–Jul)
        { disease: "Tomato Early Blight",    crop: "Tomato",    emoji: "🍅", risk: "Medium", activeMonths: [1,2,3,4,5,6],   tip: "Apply Chlorothalonil every 7–10 days. Remove lower infected leaves." },
        { disease: "Tomato Late Blight",     crop: "Tomato",    emoji: "🍅", risk: "High",   activeMonths: [2,3,4],         tip: "Apply Metalaxyl. Irrigate at base — avoid wetting foliage." },
    ],
    Sindh: [
        { disease: "Rice Leaf Blast",        crop: "Rice",      emoji: "🍚", risk: "High",   activeMonths: [5,6,7,8,9],     tip: "Apply Tricyclazole. Avoid excess nitrogen fertilizer during humid periods." },
        { disease: "Rice Brown Spot",        crop: "Rice",      emoji: "🍚", risk: "Medium", activeMonths: [6,7,8,9,10],    tip: "Balanced potassium fertilization reduces susceptibility. Spray Mancozeb." },
        { disease: "Cotton Bollworm",        crop: "Cotton",    emoji: "☁️", risk: "High",   activeMonths: [6,7,8,9,10],    tip: "Monitor with pheromone traps. Use Bt-based sprays early in infestation." },
        { disease: "Cotton Whitefly",        crop: "Cotton",    emoji: "☁️", risk: "High",   activeMonths: [4,5,6,7,8],     tip: "Spray Acetamiprid or Spiromesifen. Alternate insecticide classes to prevent resistance." },
        { disease: "Wheat Loose Smut",       crop: "Wheat",     emoji: "🌾", risk: "Medium", activeMonths: [0,1,2,10,11],   tip: "Use treated seeds. Rogue out smutted plants before spore release." },
        { disease: "Tomato Bacterial Wilt",  crop: "Tomato",    emoji: "🍅", risk: "High",   activeMonths: [9,10,11,0,1],   tip: "Use grafted tomato seedlings on resistant rootstocks. Avoid waterlogging." },
        { disease: "Chili Anthracnose",      crop: "Chili",     emoji: "🌶️", risk: "Medium", activeMonths: [3,4,5,6,7],     tip: "Spray Carbendazim at fruiting stage. Harvest fruit promptly when ripe." },
        { disease: "Banana Panama Wilt",     crop: "Banana",    emoji: "🍌", risk: "High",   activeMonths: [3,4,5,6,7,8],   tip: "Plant resistant Cavendish varieties. Remove infected mats immediately." },
        { disease: "Mango Anthracnose",      crop: "Mango",     emoji: "🥭", risk: "Medium", activeMonths: [3,4,5,6],       tip: "Apply copper-based fungicides before flowering and during rain." },
        { disease: "Potato Late Blight",     crop: "Potato",    emoji: "🥔", risk: "High",   activeMonths: [9,10,11,0,1,2], tip: "Use Ridomil Gold + Mancozeb tank mix. Plant certified seed tubers." },
    ],
    KPK: [
        { disease: "Wheat Yellow Rust",      crop: "Wheat",     emoji: "🌾", risk: "High",   activeMonths: [0,1,2,3,9,10],  tip: "KPK highland conditions strongly favor yellow rust. Use Propiconazole at flag leaf." },
        { disease: "Wheat Brown Rust",       crop: "Wheat",     emoji: "🌾", risk: "Medium", activeMonths: [1,2,3,4],        tip: "Scout weekly from tillering to heading. Spray immediately at threshold (5% incidence)." },
        { disease: "Maize Common Rust",      crop: "Maize",     emoji: "🌽", risk: "Medium", activeMonths: [3,4,5,6,7,8],   tip: "Plant resistant hybrids. Apply Mancozeb at early rust pustule development." },
        { disease: "Peach Brown Rot",        crop: "Peach",     emoji: "🍑", risk: "High",   activeMonths: [3,4,5,6,7],     tip: "Apply Iprodione before and after flowering. Remove mummified fruit." },
        { disease: "Apple Scab",             crop: "Apple",     emoji: "🍎", risk: "High",   activeMonths: [2,3,4,5,6],     tip: "Spray Myclobutanil from green tip stage. Rake and destroy fallen leaves." },
        { disease: "Tobacco Blue Mold",      crop: "Tobacco",   emoji: "🌿", risk: "Medium", activeMonths: [1,2,3,4,5],     tip: "Use Metalaxyl-M for soil drench. Ensure good seedbed drainage." },
        { disease: "Potato Late Blight",     crop: "Potato",    emoji: "🥔", risk: "High",   activeMonths: [3,4,5,6,7,8],   tip: "KPK cool-humid climate is very blight-prone. Spray weekly during rains." },
        { disease: "Rice Neck Blast",        crop: "Rice",      emoji: "🍚", risk: "High",   activeMonths: [6,7,8,9],       tip: "Spray Tricyclazole 10 days before and at heading. Don't skip applications." },
        { disease: "Tomato Late Blight",     crop: "Tomato",    emoji: "🍅", risk: "High",   activeMonths: [8,9,10,11],     tip: "Rotate Chlorothalonil and Cymoxanil. Stake plants for airflow." },
    ],
    Balochistan: [
        { disease: "Apple Scab",             crop: "Apple",     emoji: "🍎", risk: "High",   activeMonths: [2,3,4,5,6],     tip: "Apply Captan or Myclobutanil at 7-day intervals during bloom." },
        { disease: "Apple Fire Blight",      crop: "Apple",     emoji: "🍎", risk: "High",   activeMonths: [2,3,4],         tip: "Prune infected branches 30cm below lesion. Sterilize tools between cuts." },
        { disease: "Grape Downy Mildew",     crop: "Grapes",    emoji: "🍇", risk: "High",   activeMonths: [2,3,4,5,6,7],   tip: "Apply copper-based fungicides at bud burst. Ensure vine canopy aeration." },
        { disease: "Grape Powdery Mildew",   crop: "Grapes",    emoji: "🍇", risk: "Medium", activeMonths: [3,4,5,6,7,8],   tip: "Spray sulfur-based products at 10-day intervals. Avoid overhead irrigation." },
        { disease: "Wheat Brown Rust",       crop: "Wheat",     emoji: "🌾", risk: "Medium", activeMonths: [10,11,0,1,2,3], tip: "Early application of Tebuconazole is key. Scout flag leaf regularly." },
        { disease: "Pomegranate Wilt",       crop: "Pomegranate", emoji: "🍓", risk: "High", activeMonths: [3,4,5,6,7,8],  tip: "Improve drainage. Apply Carbendazim soil drench around root zone." },
        { disease: "Cotton Bollworm",        crop: "Cotton",    emoji: "☁️", risk: "High",   activeMonths: [4,5,6,7,8,9,10],tip: "Use Chlorantraniliprole or Spinosad. Monitor pheromone trap counts." },
        { disease: "Watermelon Fusarium Wilt", crop: "Watermelon", emoji: "🍉", risk: "Medium", activeMonths: [2,3,4,5,6], tip: "Use grafted seedlings on resistant rootstocks. Rotate with non-cucurbit crops." },
    ],
    "Gilgit-Baltistan": [
        { disease: "Apple Scab",             crop: "Apple",     emoji: "🍎", risk: "High",   activeMonths: [2,3,4,5,6],     tip: "High humidity valleys are scab-prone. Apply Myclobutanil from green tip." },
        { disease: "Apricot Bacterial Spot", crop: "Apricot",   emoji: "🍊", risk: "Medium", activeMonths: [2,3,4,5,6],     tip: "Use copper-based bactericides during early spring. Remove mummified fruits." },
        { disease: "Cherry Brown Rot",       crop: "Cherry",    emoji: "🍒", risk: "High",   activeMonths: [3,4,5,6],       tip: "Apply Iprodione before and after bloom. Harvest early in wet seasons." },
        { disease: "Wheat Yellow Rust",      crop: "Wheat",     emoji: "🌾", risk: "High",   activeMonths: [3,4,5,6,7,8],   tip: "GB's cool mountain climate extends yellow rust season. Spray proactively." },
        { disease: "Potato Late Blight",     crop: "Potato",    emoji: "🥔", risk: "High",   activeMonths: [4,5,6,7,8],     tip: "High altitude and rain make blight severe. Spray Ridomil every 5–7 days in wet weather." },
        { disease: "Maize Stalk Rot",        crop: "Maize",     emoji: "🌽", risk: "Medium", activeMonths: [4,5,6,7,8,9],   tip: "Promote soil drainage. Balanced K fertilization strengthens stalks." },
        { disease: "Walnut Blight",          crop: "Walnut",    emoji: "🌰", risk: "Medium", activeMonths: [3,4,5,6],       tip: "Spray copper hydroxide at bud burst and after rain. Remove infected husks." },
    ],
    "Azad Kashmir": [
        { disease: "Wheat Yellow Rust",      crop: "Wheat",     emoji: "🌾", risk: "High",   activeMonths: [9,10,11,0,1,2,3,4], tip: "AJK's cool moist climate is ideal for yellow rust. Scout from tillering onwards." },
        { disease: "Maize Common Rust",      crop: "Maize",     emoji: "🌽", risk: "Medium", activeMonths: [3,4,5,6,7,8],   tip: "Plant resistant hybrids. Apply Mancozeb at first pustule observation." },
        { disease: "Rice Leaf Blast",        crop: "Rice",      emoji: "🍚", risk: "High",   activeMonths: [5,6,7,8,9],     tip: "Apply Tricyclazole fertilizer; avoid heavy nitrogen. Maintain field hygiene." },
        { disease: "Apple Scab",             crop: "Apple",     emoji: "🍎", risk: "High",   activeMonths: [2,3,4,5,6,7],   tip: "Spray Captan/Difenoconazole from pink cluster to petal fall." },
        { disease: "Peach Brown Rot",        crop: "Peach",     emoji: "🍑", risk: "High",   activeMonths: [3,4,5,6,7],     tip: "Thinning fruit reduces rot. Apply fungicide at shuck split stage." },
        { disease: "Potato Late Blight",     crop: "Potato",    emoji: "🥔", risk: "High",   activeMonths: [3,4,5,6,7,8],   tip: "Rainy AJK conditions accelerate blight. Spray weekly, alternate fungicide modes." },
        { disease: "Sugarcane Red Rot",      crop: "Sugarcane", emoji: "🎋", risk: "Medium", activeMonths: [3,4,5,6,7,8],   tip: "Use healthy disease-free setts. Treat planting material with hot water." },
        { disease: "Tomato Late Blight",     crop: "Tomato",    emoji: "🍅", risk: "High",   activeMonths: [7,8,9,10,11],   tip: "Use Cymoxanil + Mancozeb. Stake and prune for airflow." },
    ],
};

const SEVERITY_COLORS: Record<string, string> = {
    "Late_blight": "#ef4444",
    "Early_blight": "#f97316",
    "Leaf_Blast":   "#f59e0b",
    "Rust":         "#eab308",
    "default":      "#22c55e",
};

const SEASON_LABELS: Record<number, string> = {
    0: "Winter", 1: "Winter", 2: "Early Spring",
    3: "Spring", 4: "Spring", 5: "Early Summer",
    6: "Summer", 7: "Summer", 8: "Late Summer",
    9: "Early Autumn", 10: "Autumn", 11: "Early Winter",
};

const PROVINCES = Object.keys(PROVINCE_BOUNDS);

// ─── Component ────────────────────────────────────────────────────────────────
export const DiseaseTrendList = ({ scans }: DiseaseTrendListProps) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const season = SEASON_LABELS[currentMonth];

    // Province state
    const [province, setProvince] = useState("Punjab");
    const [locStatus, setLocStatus] = useState<"idle" | "loading" | "detected" | "error">("idle");
    const [locError, setLocError] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);

    // geolocation on mount
    useEffect(() => {
        if (!navigator.geolocation) { setLocStatus("error"); setLocError("Geolocation unavailable."); return; }
        setLocStatus("loading");
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const detected = detectProvince(pos.coords.latitude, pos.coords.longitude);
                if (detected) { setProvince(detected); setLocStatus("detected"); }
                else { setLocStatus("error"); setLocError("Outside Pakistan — defaulting to Punjab."); }
            },
            () => { setLocStatus("error"); setLocError("Location denied — select province manually."); },
            { timeout: 8000 }
        );
    }, []);

    // Filter seasonal diseases for current month + province
    const allDiseases = PROVINCE_DISEASES[province] ?? PROVINCE_DISEASES["Punjab"];
    const seasonalDiseases = allDiseases
        .filter((d) => d.activeMonths.includes(currentMonth))
        .sort((a, b) => {
            const rank = { High: 0, Medium: 1, Low: 2 };
            return rank[a.risk] - rank[b.risk];
        });

    // Crops currently in season (sowing or harvest months overlap with current month)
    const cropsInSeason = [...new Set(seasonalDiseases.map((d) => `${d.emoji} ${d.crop}`))];

    // User scan frequency chart
    const frequency: Record<string, number> = {};
    scans.forEach((s) => {
        if (!s.disease?.toLowerCase().includes("healthy")) {
            const shortName = s.disease?.split("___")[1]?.replace(/_/g, " ") || s.disease;
            frequency[shortName] = (frequency[shortName] || 0) + 1;
        }
    });
    const chartData = Object.entries(frequency)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

    const getColor = (name: string) =>
        SEVERITY_COLORS[Object.keys(SEVERITY_COLORS).find((k) => name.includes(k)) ?? "default"];

    const riskBadgeClass = (risk: string) =>
        risk === "High"
            ? "border-red-400 text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400"
            : risk === "Medium"
            ? "border-orange-400 text-orange-600 bg-orange-50 dark:bg-orange-950/40 dark:text-orange-400"
            : "border-yellow-400 text-yellow-600 bg-yellow-50 dark:bg-yellow-950/40 dark:text-yellow-400";

    return (
        <div className="space-y-6">
            {/* ── Province + Season header ─────────────────────────────── */}
            <Card className="border-2">
                <CardHeader className="pb-3">
                    <CardTitle className="flex flex-wrap items-center gap-3 text-xl sm:text-2xl">
                        <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7 text-primary flex-shrink-0" />
                        <span>Disease Trends</span>
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                        Seasonal outbreak alerts for <strong>{season}</strong> — auto-updated each month based on your province.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Province selector */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <MapPin className="h-4 w-4 flex-shrink-0" />
                            {locStatus === "loading" && (
                                <span className="flex items-center gap-1"><Loader2 className="h-4 w-4 animate-spin" /> Detecting…</span>
                            )}
                            {locStatus === "detected" && (
                                <span className="text-green-600 dark:text-green-400 font-semibold">Auto-detected: {province}</span>
                            )}
                            {(locStatus === "error" || locStatus === "idle") && (
                                <span className="text-amber-600 dark:text-amber-400 text-xs">{locError || "Select province:"}</span>
                            )}
                        </div>
                        <div className="relative">
                            <button
                                className="flex items-center gap-2 text-sm sm:text-base px-4 py-2 rounded-lg border border-border bg-background font-semibold min-w-[180px] justify-between hover:bg-accent transition-colors"
                                onClick={() => setShowDropdown((v) => !v)}
                            >
                                <span>📍 {province}</span>
                                <ChevronDown className={`h-4 w-4 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
                            </button>
                            {showDropdown && (
                                <div className="absolute z-50 top-full mt-1 left-0 bg-popover border border-border rounded-lg shadow-lg min-w-[200px] py-1">
                                    {PROVINCES.map((p) => (
                                        <button
                                            key={p}
                                            className={`w-full text-left px-4 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors
                                                ${p === province ? "bg-primary/10 text-primary font-bold" : ""}`}
                                            onClick={() => { setProvince(p); setShowDropdown(false); setLocStatus("idle"); setLocError(""); }}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Currently in-season crops */}
                    {cropsInSeason.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                            <p className="text-xs sm:text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                                <Sprout className="h-4 w-4 text-green-600" />
                                Crops with Active Disease Risk This Season
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {cropsInSeason.map((c) => (
                                    <Badge key={c} variant="outline" className="text-xs sm:text-sm px-2 py-1">
                                        {c}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ── Seasonal Disease Alerts ─────────────────────────────── */}
            <Card className="border-2">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        Seasonal Outbreak Alerts — {province} &middot; {season}
                    </CardTitle>
                    <CardDescription className="text-sm">
                        {seasonalDiseases.length === 0
                            ? "No major disease alerts for this month — great time for your crops!"
                            : `${seasonalDiseases.length} active disease risk${seasonalDiseases.length > 1 ? "s" : ""} for current season.`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {seasonalDiseases.length === 0 ? (
                        <div className="flex flex-col items-center py-8 text-muted-foreground gap-3">
                            <Sprout className="h-10 w-10 text-green-500 opacity-60" />
                            <p className="text-sm">Low disease pressure this month. Keep monitoring your crops.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {seasonalDiseases.map((d, i) => (
                                <div
                                    key={i}
                                    className="flex flex-col sm:flex-row sm:items-start gap-3 p-3 sm:p-4 rounded-xl border hover:border-primary/30 transition-colors bg-muted/20"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <span className="text-2xl flex-shrink-0">{d.emoji}</span>
                                        <div className="min-w-0">
                                            <p className="text-sm sm:text-base font-semibold truncate">{d.disease}</p>
                                            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                                                <Scissors className="h-3 w-3 flex-shrink-0" /> {d.crop}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1 flex items-start gap-1">
                                                <Info className="h-3 w-3 flex-shrink-0 mt-0.5" />
                                                <span>{d.tip}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className={`text-xs sm:text-sm px-2 py-1 flex-shrink-0 font-bold ${riskBadgeClass(d.risk)}`}
                                    >
                                        {d.risk} Risk
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ── User's scan frequency chart ─────────────────────────── */}
            <Card className="border-2">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Your Detected Disease Frequency
                    </CardTitle>
                    <CardDescription className="text-sm">
                        Based on your scan history
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 16 }}>
                                <XAxis type="number" hide />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    width={130}
                                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: "hsl(var(--card))",
                                        border: "1px solid hsl(var(--border))",
                                        borderRadius: "8px",
                                        color: "hsl(var(--foreground))",
                                    }}
                                    formatter={(value) => [`${value} scan(s)`, "Count"]}
                                />
                                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={index} fill={getColor(entry.name)} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-center py-10">
                            <Sprout className="h-10 w-10 text-primary/30 mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">
                                No disease data yet — scan your first plant to see trends!
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
