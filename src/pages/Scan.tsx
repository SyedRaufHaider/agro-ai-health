import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import {
  Camera,
  Upload,
  Image as ImageIcon,
  X,
  Leaf,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  RotateCcw,
  Loader2,
  Pill,
} from "lucide-react";
import { useState, useCallback, useRef } from "react";

interface ScanResult {
  disease: string;
  confidence: number;
  recommendations: string[];
  medicines: { name: string; description?: string }[];
}

const Scan = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = useCallback((file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please select a valid image file (JPG, PNG).",
        variant: "destructive",
      });
      return;
    }
    setSelectedFile(file);
    setSelectedImage(URL.createObjectURL(file));
    setResult(null);
    setError(null);
  }, [toast]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0]);
  };

  const clearImage = () => {
    setSelectedImage(null);
    setSelectedFile(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await api.scanPlant(selectedFile);
      setResult(data);
      toast({
        title: "Analysis complete",
        description: `Detected: ${data.disease}`,
      });
    } catch (err: any) {
      const msg = err.message || "Failed to analyze image. Please try again.";
      setError(msg);
      toast({
        title: "Analysis failed",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isHealthy = result?.disease?.toLowerCase().includes("healthy");
  const confidencePct = result ? Math.round(result.confidence * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container px-4 py-24 md:py-32">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Scan Your Plant
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Upload a photo of your plant to detect diseases and get instant
              treatment recommendations
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* ── Left Panel: Upload ── */}
            <div className="space-y-4">
              {/* Drag-and-drop zone */}
              <label
                className={`relative flex flex-col items-center justify-center min-h-[320px] rounded-xl border-2 border-dashed transition-all cursor-pointer ${dragOver
                    ? "border-primary bg-primary/5 scale-[1.01]"
                    : "border-border hover:border-primary/50 hover:bg-primary/5"
                  }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />

                {selectedImage ? (
                  <div className="relative w-full h-full">
                    <img
                      src={selectedImage}
                      alt="Selected plant"
                      className="w-full max-h-[360px] object-contain rounded-lg p-2"
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        clearImage();
                      }}
                      className="absolute top-3 right-3 h-8 w-8 rounded-full bg-destructive/80 hover:bg-destructive text-white flex items-center justify-center transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4 p-8">
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                      <ImageIcon className="h-10 w-10 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-lg">
                        Drop your plant image here
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        or click to browse — JPG, PNG supported
                      </p>
                    </div>
                  </div>
                )}
              </label>

              {/* Quick action buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  Upload Image
                </Button>
                <Button variant="outline" size="lg" className="gap-2" disabled>
                  <Camera className="h-4 w-4" />
                  Open Camera
                </Button>
              </div>

              {/* Analyze button */}
              <Button
                size="lg"
                className="w-full gap-2 text-base py-6"
                onClick={handleAnalyze}
                disabled={!selectedFile || loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Leaf className="h-5 w-5" />
                    Diagnose Plant
                  </>
                )}
              </Button>

              {/* Error message */}
              {error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                  {error}
                </div>
              )}
            </div>

            {/* ── Right Panel: Result ── */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Analysis Result</h2>
                {result && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={clearImage}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    New Scan
                  </Button>
                )}
              </div>

              {loading && (
                <Card className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="text-muted-foreground">
                    Analyzing your plant...
                  </p>
                </Card>
              )}

              {!loading && !result && (
                <Card className="flex flex-col items-center justify-center min-h-[400px] gap-4 border-dashed">
                  <Leaf className="h-16 w-16 text-muted-foreground/30" />
                  <p className="text-muted-foreground">
                    Your diagnosis will appear here
                  </p>
                </Card>
              )}

              {!loading && result && (
                <Card>
                  <CardContent className="pt-6 space-y-6">
                    {/* Diagnosis header */}
                    <div className="flex items-center gap-4">
                      <div
                        className={`h-14 w-14 rounded-full flex items-center justify-center flex-shrink-0 ${isHealthy
                            ? "bg-green-500/10 text-green-500"
                            : "bg-orange-500/10 text-orange-500"
                          }`}
                      >
                        {isHealthy ? (
                          <CheckCircle className="h-7 w-7" />
                        ) : (
                          <AlertTriangle className="h-7 w-7" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">
                          Diagnosis
                        </p>
                        <h3 className="text-xl font-bold">{result.disease}</h3>
                      </div>
                    </div>

                    {/* Confidence */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Confidence Score
                        </span>
                        <span
                          className={`font-semibold ${isHealthy ? "text-green-500" : "text-orange-500"
                            }`}
                        >
                          {confidencePct}%
                        </span>
                      </div>
                      <Progress
                        value={confidencePct}
                        className="h-2"
                      />
                    </div>

                    {/* Recommendations */}
                    {result.recommendations?.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                          <Lightbulb className="h-4 w-4" />
                          Recommendations
                        </h4>
                        <ul className="space-y-2">
                          {result.recommendations.map((rec, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-sm"
                            >
                              <span className="text-primary mt-0.5">→</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Medicines */}
                    {result.medicines?.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                          <Pill className="h-4 w-4" />
                          Suggested Medicines
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {result.medicines.map((med, i) => (
                            <Badge key={i} variant="secondary">
                              {med.name || med}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Scan;
