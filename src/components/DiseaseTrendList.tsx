import { TrendingUp, AlertTriangle } from "lucide-react";
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

interface ScanRecord {
    disease: string;
    confidence: number;
}

interface DiseaseTrendListProps {
    scans: ScanRecord[];
}

const SEVERITY_COLORS: Record<string, string> = {
    "Late_blight": "#ef4444",
    "Early_blight": "#f97316",
    "Leaf_Blast": "#f59e0b",
    "Rust": "#eab308",
    "default": "#22c55e",
};

// Regional outbreak data (static Pakistan-specific data — replace with API later)
const REGIONAL_OUTBREAKS = [
    { disease: "Wheat Brown Rust", region: "Punjab", risk: "High", emoji: "🌾" },
    { disease: "Rice Leaf Blast", region: "Sindh", risk: "Medium", emoji: "🌾" },
    { disease: "Tomato Late Blight", region: "KPK", risk: "High", emoji: "🍅" },
    { disease: "Cotton Whitefly", region: "Punjab", risk: "Medium", emoji: "☁️" },
];

export const DiseaseTrendList = ({ scans }: DiseaseTrendListProps) => {
    // Aggregate disease frequency from user's scan history
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
        Object.keys(SEVERITY_COLORS).find((k) => name.includes(k))
            ? SEVERITY_COLORS[Object.keys(SEVERITY_COLORS).find((k) => name.includes(k))!]
            : SEVERITY_COLORS["default"];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Disease Trends
                </CardTitle>
                <CardDescription>
                    Your detected diseases + regional Pakistan outbreak alerts
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* User's disease frequency chart */}
                {chartData.length > 0 ? (
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                            Your Disease Frequency
                        </p>
                        <ResponsiveContainer width="100%" height={160}>
                            <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 10 }}>
                                <XAxis type="number" hide />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    width={110}
                                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
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
                                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={index} fill={getColor(entry.name)} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground">
                            No disease trends yet — scan your first plant!
                        </p>
                    </div>
                )}

                {/* Regional outbreak alerts */}
                <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-orange-500" />
                        Regional Outbreak Alerts — Pakistan
                    </p>
                    <div className="space-y-2">
                        {REGIONAL_OUTBREAKS.map((outbreak, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between p-2 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <span>{outbreak.emoji}</span>
                                    <div>
                                        <p className="text-xs font-medium">{outbreak.disease}</p>
                                        <p className="text-[10px] text-muted-foreground">{outbreak.region}</p>
                                    </div>
                                </div>
                                <Badge
                                    variant="outline"
                                    className={`text-[10px] px-1.5 ${outbreak.risk === "High"
                                            ? "border-red-400 text-red-500 bg-red-50 dark:bg-red-950/30"
                                            : "border-orange-400 text-orange-500 bg-orange-50 dark:bg-orange-950/30"
                                        }`}
                                >
                                    {outbreak.risk}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
