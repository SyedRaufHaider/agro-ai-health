import { useEffect, useRef, useState } from "react";
import { MapPin, Trash2, PlusCircle, Save, CheckCircle2, Pencil } from "lucide-react";
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
    interface Window {
        L: any;
    }
}

interface Field {
    id: string;
    name: string;
    latlngs: [number, number][];
    color: string;
}

const FIELD_COLORS = [
    "#22c55e", "#3b82f6", "#f97316", "#a855f7", "#eab308", "#06b6d4",
];

const PAKISTAN_CENTER: [number, number] = [30.3753, 69.3451];

// Calculate polygon area in acres from lat/lng using Shoelace formula
const calcAcres = (latlngs: [number, number][]): number => {
    if (latlngs.length < 3) return 0;
    const toRad = (d: number) => (d * Math.PI) / 180;
    // Approximate area in m² using spherical excess
    let area = 0;
    for (let i = 0; i < latlngs.length; i++) {
        const j = (i + 1) % latlngs.length;
        area +=
            toRad(latlngs[j][1] - latlngs[i][1]) *
            (2 + Math.sin(toRad(latlngs[i][0])) + Math.sin(toRad(latlngs[j][0])));
    }
    area = Math.abs((area * 6378137 * 6378137) / 2);
    // m² to acres (1 acre = 4046.86 m²)
    return Math.round((area / 4046.86) * 100) / 100;
};

export const FieldHealthMap = () => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const [fields, setFields] = useState<Field[]>([]);
    const [drawing, setDrawing] = useState(false);
    const drawingRef = useRef<any>(null);
    const polygonsRef = useRef<Record<string, any>>({});
    const [leafletLoaded, setLeafletLoaded] = useState(false);
    const [saved, setSaved] = useState(false);
    const [hasUnsaved, setHasUnsaved] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");

    const STORAGE_KEY = "agro_ai_fields";

    // Dynamically load Leaflet CSS + JS
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

    // Initialize map + restore saved fields
    useEffect(() => {
        if (!leafletLoaded || !mapRef.current || mapInstanceRef.current) return;

        const L = window.L;
        const map = L.map(mapRef.current, { zoomControl: true }).setView(
            PAKISTAN_CENTER,
            5
        );

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors",
        }).addTo(map);

        mapInstanceRef.current = map;

        // Restore saved fields from localStorage
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const savedFields: Field[] = JSON.parse(saved);
                savedFields.forEach((field) => {
                    const polygon = L.polygon(field.latlngs, {
                        color: field.color,
                        fillOpacity: 0.3,
                        weight: 2,
                    })
                        .bindPopup(`<b>${field.name}</b><br/>${calcAcres(field.latlngs)} acres`);
                    polygonsRef.current[field.id] = polygon;
                });
                setFields(savedFields);
            }
        } catch { /* ignore corrupt storage */ }
    }, [leafletLoaded]);

    // Start drawing a new farm boundary polygon
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

            const marker = L.circleMarker(latlng, {
                radius: 5, color, fillOpacity: 1,
            }).addTo(map);
            markers.push(marker);
        };

        const onDblClick = (e: any) => {
            map.off("click", onClick);
            map.off("dblclick", onDblClick);

            // Clean up drawing artifacts
            map.removeLayer(polyline);
            markers.forEach((m) => map.removeLayer(m));

            if (points.length < 3) { setDrawing(false); return; }

            const id = `field-${Date.now()}`;
            const name = `Field ${fields.length + 1}`;
            const polygon = L.polygon(points, { color, fillOpacity: 0.3, weight: 2 })
                .addTo(map)
                .bindPopup(`<b>${name}</b><br/>${calcAcres(points)} acres`);

            polygonsRef.current[id] = polygon;

            setFields((prev) => [...prev, { id, name, latlngs: points, color }]);
            setDrawing(false);
            setHasUnsaved(true);
            setSaved(false);
            drawingRef.current = null;
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

    const removeField = (id: string) => {
        const map = mapInstanceRef.current;
        if (polygonsRef.current[id]) {
            map?.removeLayer(polygonsRef.current[id]);
            delete polygonsRef.current[id];
        }
        setFields((prev) => {
            const updated = prev.filter((f) => f.id !== id);
            // Auto-save after delete
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
        setSaved(true);
        setHasUnsaved(false);
    };

    const saveFields = (currentFields: Field[]) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentFields));
        setSaved(true);
        setHasUnsaved(false);
        // Reset saved indicator after 3 seconds
        setTimeout(() => setSaved(false), 3000);
    };

    const focusField = (id: string) => {
        const map = mapInstanceRef.current;
        const polygon = polygonsRef.current[id];
        if (map && polygon) {
            map.fitBounds(polygon.getBounds(), { padding: [30, 30], maxZoom: 16 });
            polygon.openPopup();
        }
    };

    const startRename = (field: Field) => {
        setEditingId(field.id);
        setEditName(field.name);
    };

    const commitRename = (id: string) => {
        const newName = editName.trim() || "Unnamed Field";
        setFields((prev) =>
            prev.map((f) => (f.id === id ? { ...f, name: newName } : f))
        );
        // Update popup content
        const polygon = polygonsRef.current[id];
        const field = fields.find((f) => f.id === id);
        if (polygon && field) {
            polygon.setPopupContent(`<b>${newName}</b><br/>${calcAcres(field.latlngs)} acres`);
        }
        setEditingId(null);
        setHasUnsaved(true);
        setSaved(false);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Field Health Map
                </CardTitle>
                <CardDescription>
                    Draw your farm boundaries on the map. Click to add points,
                    double-click to close a polygon.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Controls */}
                <div className="flex flex-wrap items-center gap-2">
                    {!drawing ? (
                        <>
                            <Button size="sm" onClick={startDrawing} className="gap-1">
                                <PlusCircle className="h-4 w-4" />
                                Add Field Boundary
                            </Button>

                            {fields.length > 0 && (
                                <Button
                                    size="sm"
                                    variant={saved ? "outline" : "secondary"}
                                    onClick={() => saveFields(fields)}
                                    className={`gap-1.5 transition-all ${saved
                                        ? "border-green-400 text-green-600 bg-green-50 dark:bg-green-950/30"
                                        : hasUnsaved
                                            ? "ring-2 ring-primary"
                                            : ""
                                        }`}
                                >
                                    {saved ? (
                                        <>
                                            <CheckCircle2 className="h-4 w-4" />
                                            Saved!
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            Save Fields
                                        </>
                                    )}
                                </Button>
                            )}
                        </>
                    ) : (
                        <>
                            <Badge variant="outline" className="px-3 py-1.5 text-sm text-yellow-600 border-yellow-400 bg-yellow-50 dark:bg-yellow-950/30">
                                📍 Click map to add points — Double-click to close
                            </Badge>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={cancelDrawing}
                                className="text-muted-foreground"
                            >
                                Cancel
                            </Button>
                        </>
                    )}
                </div>

                {/* Map */}
                <div
                    ref={mapRef}
                    className="w-full h-64 rounded-lg border border-border overflow-hidden bg-muted"
                    style={{ zIndex: 0 }}
                >
                    {!leafletLoaded && (
                        <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                            Loading map...
                        </div>
                    )}
                </div>

                {/* Field List */}
                {fields.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Your Fields
                        </p>
                        {fields.map((field) => (
                            <div
                                key={field.id}
                                className="flex items-center justify-between p-2 rounded-lg bg-muted/40 text-sm"
                            >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <span
                                        className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                                        style={{ background: field.color }}
                                    />
                                    {editingId === field.id ? (
                                        <input
                                            autoFocus
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            onBlur={() => commitRename(field.id)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") commitRename(field.id);
                                                if (e.key === "Escape") setEditingId(null);
                                            }}
                                            className="bg-background border border-input rounded px-1.5 py-0.5 text-sm font-medium w-28 focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                    ) : (
                                        <span
                                            className="font-medium cursor-pointer hover:text-primary transition-colors truncate"
                                            onClick={() => focusField(field.id)}
                                            title="Click to zoom to this field"
                                        >
                                            {field.name}
                                        </span>
                                    )}
                                    <span className="text-muted-foreground text-xs flex-shrink-0">
                                        {calcAcres(field.latlngs)} acres
                                    </span>
                                </div>
                                <div className="flex items-center gap-0.5">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-6 w-6 text-muted-foreground hover:text-primary"
                                        onClick={() => startRename(field)}
                                        title="Rename field"
                                    >
                                        <Pencil className="h-3 w-3" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                        onClick={() => removeField(field.id)}
                                    >
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
    );
};
