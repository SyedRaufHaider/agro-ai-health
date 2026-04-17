import { useEffect, useRef, useState, useCallback } from "react";
import { MapPin, Trash2, PlusCircle, Save, CheckCircle2, Pencil, X, Activity, ShieldCheck, AlertTriangle, Clock, Loader2 } from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

declare global {
    interface Window { L: any; }
}

interface Field {
    _id: string;
    name: string;
    latlngs: [number, number][];
    color: string;
}

interface ScanRecord {
    _id: string;
    imageUrl?: string;
    disease: string;
    confidence: number;
    createdAt: string;
    fieldId?: string | null;
}

interface FieldHealthMapProps {
    scans?: ScanRecord[];
}

const FIELD_COLORS = ["#22c55e", "#3b82f6", "#f97316", "#a855f7", "#eab308", "#06b6d4"];
const PAKISTAN_CENTER: [number, number] = [30.3753, 69.3451];
const API_BASE = import.meta.env.VITE_API_URL || "https://agro-ai-backend-3fxh.onrender.com/api/v1";

const getToken = () => localStorage.getItem("token") || "";

const calcAcres = (latlngs: [number, number][]): number => {
    if (latlngs.length < 3) return 0;
    const toRad = (d: number) => (d * Math.PI) / 180;
    let area = 0;
    for (let i = 0; i < latlngs.length; i++) {
        const j = (i + 1) % latlngs.length;
        area += toRad(latlngs[j][1] - latlngs[i][1]) *
            (2 + Math.sin(toRad(latlngs[i][0])) + Math.sin(toRad(latlngs[j][0])));
    }
    area = Math.abs((area * 6378137 * 6378137) / 2);
    return Math.round((area / 4046.86) * 100) / 100;
};

const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });

const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" });

export const FieldHealthMap = ({ scans = [] }: FieldHealthMapProps) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const [fields, setFields] = useState<Field[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [drawing, setDrawing] = useState(false);
    const drawingRef = useRef<any>(null);
    const polygonsRef = useRef<Record<string, any>>({});
    const [leafletLoaded, setLeafletLoaded] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

    // ── API helpers ────────────────────────────────────────────────────────
    const apiFetch = useCallback(async (method: string, path: string, body?: object) => {
        const res = await fetch(`${API_BASE}${path}`, {
            method,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getToken()}`,
            },
            body: body ? JSON.stringify(body) : undefined,
        });
        if (!res.ok) throw new Error(`API error ${res.status}`);
        return res.json();
    }, []);

    // ── Load fields from backend ───────────────────────────────────────────
    const loadFields = useCallback(async () => {
        try {
            setLoading(true);
            const data = await apiFetch("GET", "/fields");
            const loaded: Field[] = data.data || [];
            setFields(loaded);

            // Draw polygons on map if Leaflet is ready
            if (mapInstanceRef.current && window.L) {
                const L = window.L;
                const map = mapInstanceRef.current;

                // Clear existing polygons
                Object.values(polygonsRef.current).forEach((p: any) => map.removeLayer(p));
                polygonsRef.current = {};

                loaded.forEach((field) => {
                    const polygon = L.polygon(field.latlngs, {
                        color: field.color, fillOpacity: 0.35, weight: 3,
                    }).addTo(map).bindPopup(`<b>${field.name}</b><br/>${calcAcres(field.latlngs)} acres`);
                    polygonsRef.current[field._id] = polygon;
                });

                if (loaded.length > 0) {
                    const group = L.featureGroup(Object.values(polygonsRef.current));
                    map.fitBounds(group.getBounds(), { padding: [40, 40], maxZoom: 15 });
                }
            }
        } catch {
            // Silently fail — user may not be logged in
        } finally {
            setLoading(false);
        }
    }, [apiFetch]);

    // ── Load Leaflet ────────────────────────────────────────────────────────
    useEffect(() => {
        if (window.L) { setLeafletLoaded(true); return; }
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = () => setLeafletLoaded(true);
        document.head.appendChild(script);
    }, []);

    // ── Initialize map once Leaflet is ready ───────────────────────────────
    useEffect(() => {
        if (!leafletLoaded || !mapRef.current || mapInstanceRef.current) return;
        const L = window.L;
        const map = L.map(mapRef.current, { zoomControl: true }).setView(PAKISTAN_CENTER, 5);
        const hybrid = L.tileLayer("https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}", {
            attribution: "© Google Maps", maxZoom: 21,
        });
        const satellite = L.tileLayer("https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}", {
            attribution: "© Google Maps", maxZoom: 21,
        });
        const street = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors",
        });
        hybrid.addTo(map);
        L.control.layers(
            { "🛰️ Hybrid": hybrid, "🌍 Satellite": satellite, "🗺️ Street": street },
            {}, { position: "topright" }
        ).addTo(map);
        mapInstanceRef.current = map;
        loadFields();
    }, [leafletLoaded, loadFields]);

    // ── Draw new boundary ──────────────────────────────────────────────────
    const startDrawing = () => {
        const L = window.L;
        const map = mapInstanceRef.current;
        if (!map || !L) return;
        setDrawing(true);
        const points: [number, number][] = [];
        const color = FIELD_COLORS[fields.length % FIELD_COLORS.length];
        const polyline = L.polyline([], { color, dashArray: "5,5" }).addTo(map);
        const markers: any[] = [];

        const onClick = (e: any) => {
            const latlng: [number, number] = [e.latlng.lat, e.latlng.lng];
            points.push(latlng);
            polyline.setLatLngs(points);
            const marker = L.circleMarker(latlng, { radius: 5, color, fillOpacity: 1 }).addTo(map);
            markers.push(marker);
        };

        const onDblClick = async (e: any) => {
            map.off("click", onClick);
            map.off("dblclick", onDblClick);
            map.removeLayer(polyline);
            markers.forEach((m) => map.removeLayer(m));

            if (points.length < 3) { setDrawing(false); return; }

            setSaving(true);
            try {
                const name = `Field ${fields.length + 1}`;
                const res = await apiFetch("POST", "/fields", { name, color, latlngs: points });
                const newField: Field = res.data;

                const polygon = L.polygon(newField.latlngs, { color, fillOpacity: 0.3, weight: 2 })
                    .addTo(map)
                    .bindPopup(`<b>${newField.name}</b><br/>${calcAcres(newField.latlngs)} acres`);
                polygonsRef.current[newField._id] = polygon;
                setFields((prev) => [...prev, newField]);
            } catch {
                alert("Failed to save field. Please try again.");
            } finally {
                setSaving(false);
                setDrawing(false);
                drawingRef.current = null;
            }
        };

        map.on("click", onClick);
        map.on("dblclick", onDblClick);
        drawingRef.current = { onClick, onDblClick };
    };

    const cancelDrawing = () => {
        const map = mapInstanceRef.current;
        if (!map || !drawingRef.current) return;
        map.off("click", drawingRef.current.onClick);
        map.off("dblclick", drawingRef.current.onDblClick);
        setDrawing(false);
        drawingRef.current = null;
    };

    const removeField = async (id: string) => {
        try {
            await apiFetch("DELETE", `/fields/${id}`);
            const map = mapInstanceRef.current;
            if (polygonsRef.current[id]) {
                map?.removeLayer(polygonsRef.current[id]);
                delete polygonsRef.current[id];
            }
            setFields((prev) => prev.filter((f) => f._id !== id));
            if (selectedFieldId === id) setSelectedFieldId(null);
        } catch {
            alert("Could not delete field.");
        }
    };

    const focusField = (id: string) => {
        const map = mapInstanceRef.current;
        const polygon = polygonsRef.current[id];
        if (map && polygon) {
            map.fitBounds(polygon.getBounds(), { padding: [30, 30], maxZoom: 16 });
            polygon.openPopup();
        }
        setSelectedFieldId(id);
    };

    const startRename = (field: Field) => { setEditingId(field._id); setEditName(field.name); };

    const commitRename = async (id: string) => {
        const newName = editName.trim() || "Unnamed Field";
        try {
            await apiFetch("PUT", `/fields/${id}`, { name: newName });
            setFields((prev) => prev.map((f) => (f._id === id ? { ...f, name: newName } : f)));
            const polygon = polygonsRef.current[id];
            const field = fields.find((f) => f._id === id);
            if (polygon && field) polygon.setPopupContent(`<b>${newName}</b><br/>${calcAcres(field.latlngs)} acres`);
        } catch { /* ignore */ }
        setEditingId(null);
    };

    // ── Selected field + filtered scans ───────────────────────────────────
    const selectedField = fields.find((f) => f._id === selectedFieldId) || null;
    const fieldScans = scans.filter((s) => s.fieldId === selectedFieldId);
    const recentScans = [...fieldScans]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

    const totalScans = fieldScans.length;
    const healthyScans = fieldScans.filter((s) => (s.disease ?? "").toLowerCase().includes("healthy")).length;
    const diseasedScans = totalScans - healthyScans;
    const avgConfidence = totalScans > 0
        ? Math.round(fieldScans.reduce((sum, s) => sum + s.confidence, 0) / totalScans)
        : 0;

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        Field Health Map
                        {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-1" />}
                    </CardTitle>
                    <CardDescription>
                        Draw your farm boundaries on the map. Boundaries sync across web and mobile.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {/* Controls */}
                    <div className="flex flex-wrap items-center gap-2">
                        {!drawing ? (
                            <Button size="sm" onClick={startDrawing} disabled={saving} className="gap-1">
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
                                {saving ? "Saving…" : "Add Field Boundary"}
                            </Button>
                        ) : (
                            <>
                                <Badge variant="outline" className="px-3 py-1.5 text-sm text-yellow-600 border-yellow-400 bg-yellow-50 dark:bg-yellow-950/30">
                                    📍 Click to add points — Double-click to close
                                </Badge>
                                <Button size="sm" variant="ghost" onClick={cancelDrawing} className="text-muted-foreground">
                                    Cancel
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Map */}
                    <div ref={mapRef} className="w-full h-80 rounded-lg border border-border overflow-hidden bg-muted" style={{ zIndex: 0 }}>
                        {!leafletLoaded && (
                            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                                Loading map…
                            </div>
                        )}
                    </div>

                    {/* Field List */}
                    {fields.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                Your Fields — click a name to view scans
                            </p>
                            {fields.map((field) => (
                                <div
                                    key={field._id}
                                    className={`flex items-center justify-between p-2.5 rounded-lg text-sm transition-all cursor-pointer ${selectedFieldId === field._id
                                        ? "bg-emerald-500/10 border border-emerald-500/30 ring-1 ring-emerald-500/20"
                                        : "bg-muted/40 hover:bg-muted/60 border border-transparent"
                                        }`}
                                    onClick={() => focusField(field._id)}
                                >
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <span className="inline-block w-3 h-3 rounded-full flex-shrink-0" style={{ background: field.color }} />
                                        {editingId === field._id ? (
                                            <input
                                                autoFocus
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                onBlur={() => commitRename(field._id)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") commitRename(field._id);
                                                    if (e.key === "Escape") setEditingId(null);
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                                className="bg-background border border-input rounded px-1.5 py-0.5 text-sm font-medium w-28 focus:outline-none focus:ring-1 focus:ring-primary"
                                            />
                                        ) : (
                                            <span className={`font-medium truncate ${selectedFieldId === field._id ? "text-emerald-700 dark:text-emerald-400" : ""}`}>
                                                {field.name}
                                            </span>
                                        )}
                                        <Badge variant="secondary" className="text-[10px] shrink-0">
                                            {calcAcres(field.latlngs)} acres
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                                        <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground hover:text-primary" onClick={() => startRename(field)}>
                                            <Pencil className="h-3 w-3" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => removeField(field._id)}>
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                        💡 Zoom to your area first, then use "Add Field Boundary" to draw.
                    </p>
                </CardContent>
            </Card>

            {/* ── Selected Field Details Panel ── */}
            {selectedField && (
                <Card className="border-emerald-500/20 shadow-lg shadow-emerald-500/5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <span className="inline-block w-3 h-3 rounded-full" style={{ background: selectedField.color }} />
                                {selectedField.name} — Scan Details
                            </CardTitle>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => setSelectedFieldId(null)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <CardDescription>
                            {calcAcres(selectedField.latlngs)} acres • {totalScans} scan{totalScans !== 1 ? "s" : ""} attached to this field
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {totalScans > 0 ? (
                            <>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                                        <Activity className="h-4 w-4 mx-auto text-primary mb-1" />
                                        <p className="text-lg font-bold">{totalScans}</p>
                                        <p className="text-[11px] text-muted-foreground">Total Scans</p>
                                    </div>
                                    <div className="bg-emerald-500/5 rounded-lg p-3 text-center">
                                        <ShieldCheck className="h-4 w-4 mx-auto text-emerald-600 mb-1" />
                                        <p className="text-lg font-bold text-emerald-600">{healthyScans}</p>
                                        <p className="text-[11px] text-muted-foreground">Healthy</p>
                                    </div>
                                    <div className="bg-red-500/5 rounded-lg p-3 text-center">
                                        <AlertTriangle className="h-4 w-4 mx-auto text-red-500 mb-1" />
                                        <p className="text-lg font-bold text-red-500">{diseasedScans}</p>
                                        <p className="text-[11px] text-muted-foreground">Diseased</p>
                                    </div>
                                    <div className="bg-blue-500/5 rounded-lg p-3 text-center">
                                        <Activity className="h-4 w-4 mx-auto text-blue-500 mb-1" />
                                        <p className="text-lg font-bold text-blue-500">{avgConfidence}%</p>
                                        <p className="text-[11px] text-muted-foreground">Avg Confidence</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Recent Scans</p>
                                    {recentScans.map((scan) => {
                                        const isHealthy = (scan.disease ?? "").toLowerCase().includes("healthy");
                                        return (
                                            <div key={scan._id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                                                {scan.imageUrl ? (
                                                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted shrink-0">
                                                        <img src={scan.imageUrl} alt={scan.disease} className="h-full w-full object-cover" />
                                                    </div>
                                                ) : (
                                                    <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                                        <Activity className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-sm truncate">{scan.disease}</span>
                                                        <Badge variant={isHealthy ? "default" : "destructive"} className={`text-[10px] shrink-0 ${isHealthy ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30" : ""}`}>
                                                            {isHealthy ? "Healthy" : "Detected"}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                                        <Clock className="h-3 w-3" />
                                                        {formatDate(scan.createdAt)} at {formatTime(scan.createdAt)}
                                                        <span>• {scan.confidence}% conf</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <Activity className="h-10 w-10 mx-auto mb-2 opacity-40" />
                                <p className="text-sm font-medium">No scans attached to this field</p>
                                <p className="text-xs mt-1">Scan a leaf and attach it to this field to see health data here.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
