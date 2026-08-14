"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MedicalDisclaimer } from "@/components/ui/MedicalDisclaimer";
import {
  QrCode,
  Zap,
  RotateCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  X,
} from "lucide-react";

export default function BarcodeScannerPage() {
  const [torchOn, setTorchOn] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  const handleBarcodeScan = async (codeToScan: string) => {
    setIsScanning(true);
    try {
      const res = await fetch("/api/scans/barcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barcode: codeToScan }),
      });

      const data = await res.json();
      if (res.ok && data.data) {
        setScanResult(data.data);
      } else {
        alert("Product not found or scan failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Scan error.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 pb-20 lg:pb-0">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
                <QrCode className="h-7 w-7 text-brand-400" />
                <span>Barcode Camera Scanner</span>
              </h1>
              <p className="text-xs text-slate-400">
                Point camera at UPC / EAN barcode or test sample preset barcodes below.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant={torchOn ? "primary" : "secondary"}
                size="sm"
                onClick={() => setTorchOn(!torchOn)}
              >
                <Zap className="h-4 w-4 mr-1" />
                <span>Torch</span>
              </Button>
            </div>
          </div>

          {/* Camera Viewfinder Simulation */}
          <Card className="relative overflow-hidden border-slate-800 bg-slate-900/90 aspect-video max-h-[420px] flex flex-col items-center justify-center text-center p-6 shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-900/20 via-slate-950 to-slate-950 pointer-events-none" />

            {/* Target Reticle */}
            <div className="relative h-48 w-64 rounded-2xl border-2 border-dashed border-brand-400/70 flex items-center justify-center bg-brand-500/5 shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-400 to-transparent animate-scan-line" />
              <div className="text-center space-y-1 p-4 backdrop-blur-sm">
                <QrCode className="h-10 w-10 text-brand-400 mx-auto opacity-80" />
                <p className="text-[11px] font-bold text-slate-300">Align Barcode within Frame</p>
              </div>
            </div>

            {/* Sample Preset Quick Barcode Buttons */}
            <div className="relative z-10 pt-6 space-y-2">
              <p className="text-xs font-semibold text-slate-400">Test Preset Barcodes:</p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBarcodeScan("089425000008")}
                  isLoading={isScanning}
                >
                  🥛 Silk Almond Milk (Safe)
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBarcodeScan("042272001019")}
                  isLoading={isScanning}
                >
                  🥣 Amy's Tomato Soup (Unsafe)
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBarcodeScan("028000018504")}
                  isLoading={isScanning}
                >
                  🍫 Nestlé Chocolate (High Risk)
                </Button>
              </div>
            </div>
          </Card>

          {/* Manual Entry Form */}
          <Card className="border-slate-800 bg-slate-900/60 p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (manualBarcode) handleBarcodeScan(manualBarcode);
              }}
              className="flex gap-2"
            >
              <Input
                placeholder="Or enter Barcode manually (e.g. 089425000008)"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
                className="text-xs"
              />
              <Button type="submit" variant="primary" isLoading={isScanning}>
                Lookup
              </Button>
            </form>
          </Card>

          <MedicalDisclaimer compact />

          {/* Scan Result Modal */}
          {scanResult && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <Card className="w-full max-w-xl border-slate-800 bg-slate-900 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800 pb-4">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-brand-400" />
                      <span>AllerScan AI Analysis Report</span>
                    </CardTitle>
                    <p className="text-xs text-slate-400">Barcode: {scanResult.product?.barcode}</p>
                  </div>
                  <button onClick={() => setScanResult(null)} className="text-slate-400 hover:text-white">
                    <X className="h-5 w-5" />
                  </button>
                </CardHeader>

                <CardContent className="space-y-4 pt-4">
                  {/* Safety Status Banner */}
                  <div className={`rounded-2xl p-4 border flex items-center gap-4 ${
                    scanResult.analysis?.safetyStatus === "SAFE"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                  }`}>
                    {scanResult.analysis?.safetyStatus === "SAFE" ? (
                      <CheckCircle2 className="h-8 w-8 shrink-0 text-emerald-400" />
                    ) : (
                      <XCircle className="h-8 w-8 shrink-0 text-rose-400" />
                    )}
                    <div>
                      <h4 className="text-lg font-extrabold">{scanResult.product?.name}</h4>
                      <p className="text-xs font-bold uppercase tracking-wider">
                        Safety Evaluation: {scanResult.analysis?.safetyStatus}
                      </p>
                    </div>
                  </div>

                  {/* Explanation */}
                  <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 text-xs space-y-2">
                    <p className="font-bold text-slate-300">Medical AI Explanation:</p>
                    <p className="text-slate-400 leading-relaxed">{scanResult.analysis?.explanation}</p>
                  </div>

                  {/* Flagged Allergens */}
                  {scanResult.analysis?.detectedAllergens?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-rose-400">Triggered Allergens:</p>
                      <div className="flex flex-wrap gap-2">
                        {scanResult.analysis.detectedAllergens.map((alg: any, idx: number) => (
                          <span key={idx} className="rounded-lg bg-rose-500/20 border border-rose-500/40 px-3 py-1 text-xs font-bold text-rose-300">
                            ⚠️ {alg.name} (Matched: {alg.matchedIngredient})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ingredients */}
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400">Full Ingredients List:</p>
                    <p className="text-xs text-slate-300 rounded-xl bg-slate-950 p-3 border border-slate-800 leading-relaxed">
                      {scanResult.product?.ingredients}
                    </p>
                  </div>
                </CardContent>

                <CardFooter className="flex justify-end gap-2 border-t border-slate-800 pt-4">
                  <Button variant="secondary" onClick={() => setScanResult(null)}>
                    Scan Another
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
