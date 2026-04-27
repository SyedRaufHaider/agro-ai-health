import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AdminNavigation } from "@/components/AdminNavigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/lib/api";
import { ArrowLeft, ChevronLeft, ChevronRight, RefreshCw, ScanSearch } from "lucide-react";

interface Detection {
  id: string;
  userId: string;
  predictedLabel: string;
  confidence: number;
  status: string;
  platform: string;
  createdAt: string;
}

const statusVariant = (s: string): "default" | "destructive" | "secondary" | "outline" => {
  if (s === "healthy")     return "default";
  if (s === "infected")    return "destructive";
  if (s === "unrecognized") return "secondary";
  return "outline";
};

const AdminDetections = () => {
  const [records, setRecords]   = useState<Detection[]>([]);
  const [total, setTotal]       = useState(0);
  const [pages, setPages]       = useState(1);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  const fetchPage = (p: number) => {
    setLoading(true);
    setError("");
    api.getAdminDetections(p, 20)
      .then((res) => {
        setRecords(res.data);
        setTotal(res.total);
        setPages(res.pages);
        setPage(p);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPage(1); }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <AdminNavigation />

      <main className="flex-1 container mx-auto px-4 py-8 mt-20 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="h-9 w-9 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <ScanSearch className="h-5 w-5 text-violet-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Diagnosis Records</h1>
              {!loading && (
                <p className="text-muted-foreground text-sm">{total} total records</p>
              )}
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => fetchPage(page)} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Disease / Label</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((__, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      No records found
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((rec, i) => (
                    <TableRow key={rec.id} className="hover:bg-muted/40">
                      <TableCell className="text-muted-foreground">
                        {(page - 1) * 20 + i + 1}
                      </TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {rec.predictedLabel}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 min-w-[120px]">
                          <Progress value={rec.confidence * 100} className="h-2 flex-1" />
                          <span className="text-xs font-semibold w-10 text-right">
                            {(rec.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(rec.status)} className="capitalize text-xs">
                          {rec.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`capitalize text-xs ${rec.platform === "mobile" ? "border-amber-400/50 text-amber-600" : "border-blue-400/50 text-blue-600"}`}
                        >
                          {rec.platform}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                        {new Date(rec.createdAt).toLocaleDateString("en-US", {
                          year: "numeric", month: "short", day: "numeric",
                        })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {page} of {pages} · {total} total records
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline" size="sm"
                disabled={page <= 1 || loading}
                onClick={() => fetchPage(page - 1)}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </Button>
              <Button
                variant="outline" size="sm"
                disabled={page >= pages || loading}
                onClick={() => fetchPage(page + 1)}
                className="gap-1"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminDetections;
