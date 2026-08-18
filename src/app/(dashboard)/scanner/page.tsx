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
  Upload,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  X,
  RefreshCw,
} from "lucide-react";
import { createWorker } from "tesseract.js";

export default function BarcodeScannerPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [manualBarcode, setManualBarcode] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  const handleBarcodeLookup = async (codeToScan: string) => {
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
        alert(data.error || "Product not found for barcode " + codeToScan);
      }
    } catch (err) {
      console.error(err);
      alert("Barcode scan error.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleImageBarcodeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
    setIsScanning(true);
    setScanResult(null);

    try {
      // Perform OCR extraction to read numeric barcode digits from uploaded image file
      const worker = await createWorker("eng");
      const ret = await worker.recognize(file);
      await worker.terminate();

      const text = ret.data.text || "";
      const digitMatch = text.match(/\b\d{8,14}\b/);

      if (digitMatch) {
        const detectedBarcode = digitMatch[0];
        setManualBarcode(detectedBarcode);
        await handleBarcodeLookup(detectedBarcode);
      } else {
        alert("Could not detect barcode digits in image. Please enter barcode number manually below.");
      }
    } catch (err) {
      console.error("Barcode Image Error:", err);
      alert("Error reading barcode image.");
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
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <QrCode className="h-7 w-7 text-brand-400" />
              <span>Real Barcode Image & Camera Scanner</span>
            </h1>
            <p className="text-xs text-slate-400">
              Upload any downloaded barcode image file or enter UPC / EAN barcode numbers to evaluate food safety.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Real File Uploader Card */}
            <Card className="border-slate-800 bg-slate-900/60 p-6 flex flex-col items-center justify-center text-center space-y-4 min-h-[280px] border-dashed relative overflow-hidden">
              {selectedImage ? (
                <div className="w-full h-full space-y-3">
                  <div className="relative h-44 w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                    <img src={selectedImage} alt="Uploaded Barcode" className="h-full w-full object-contain" />
                  </div>
                  <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-semibold text-white transition-colors">
                    <Upload className="h-4 w-4" />
                    <span>Upload Different Barcode Photo</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageBarcodeUpload} />
                  </label>
                </div>
              ) : (
                <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center space-y-3 p-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
                    <Upload className="h-8 w-8" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white">Click or Drag & Drop Barcode Image</p>
                    <p className="text-xs text-slate-400">Select any food packaging barcode photograph (PNG, JPG, WEBP)</p>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageBarcodeUpload} />
                </label>
              )}

              {isScanning && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-2">
                  <RefreshCw className="h-8 w-8 text-brand-400 animate-spin" />
                  <p className="text-xs font-bold text-white">Processing Barcode Image...</p>
                </div>
              )}
            </Card>

            {/* Manual Barcode Search Form */}
            <Card className="border-slate-800 bg-slate-900/80 p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Enter Product Barcode Digits
                </label>
                <p className="text-xs text-slate-400">
                  Enter 8, 12, or 13-digit UPC/EAN barcode numbers directly to check database status.
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (manualBarcode.trim()) handleBarcodeLookup(manualBarcode.trim());
                }}
                className="space-y-3"
              >
                <Input
                  placeholder="Enter barcode digits (e.g. 089425000008)"
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  leftIcon={<Search className="h-4 w-4" />}
                  className="text-xs h-12"
                />

                <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isScanning} disabled={!manualBarcode.trim()}>
                  <Search className="h-4 w-4 mr-2" />
                  <span>Lookup Barcode Safety</span>
                </Button>
              </form>
            </Card>
          </div>

          <MedicalDisclaimer compact />

          {/* Scan Result Modal / View */}
          {scanResult && (
            <Card className="border-slate-800 bg-slate-900 p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-brand-400" />
                    <span>AllerScan Product Safety Evaluation</span>
                  </h3>
                  <p className="text-xs text-slate-400">Barcode: {scanResult.product?.barcode}</p>
                </div>
                <button onClick={() => setScanResult(null)} className="text-slate-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

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
                    Safety Status: {scanResult.analysis?.safetyStatus}
                  </p>
                </div>
              </div>

              {/* Explanation */}
              <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 text-xs space-y-2">
                <p className="font-bold text-slate-300">Medical AI Explanation:</p>
                <p className="text-slate-400 leading-relaxed">{scanResult.analysis?.explanation}</p>
              </div>

              {/* Triggered Allergens */}
              {scanResult.analysis?.detectedAllergens?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-rose-400">Triggered Allergens in Your Profile:</p>
                  <div className="flex flex-wrap gap-2">
                    {scanResult.analysis.detectedAllergens.map((alg: any, idx: number) => (
                      <span key={idx} className="rounded-lg bg-rose-500/20 border border-rose-500/40 px-3 py-1 text-xs font-bold text-rose-300">
                        ⚠️ {alg.name} (Matched: {alg.matchedIngredient})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Ingredients */}
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400">Full Ingredients List:</p>
                <p className="text-xs text-slate-300 rounded-xl bg-slate-950 p-3 border border-slate-800 leading-relaxed">
                  {scanResult.product?.ingredients}
                </p>
              </div>
            </Card>
          )}
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
