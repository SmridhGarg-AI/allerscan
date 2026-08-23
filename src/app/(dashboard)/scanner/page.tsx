"use client";

import React, { useState, useRef, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MedicalDisclaimer } from "@/components/ui/MedicalDisclaimer";
import { OfflineIndicator } from "@/components/ui/OfflineIndicator";
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
  Camera,
  Edit3,
  Heart,
} from "lucide-react";
import { createWorker } from "tesseract.js";

export default function BarcodeScannerPage() {
  const [activeTab, setActiveTab] = useState<"camera" | "upload" | "manual">("camera");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [manualBarcode, setManualBarcode] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  // Camera stream
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");

  // Manual Entry Form
  const [manualName, setManualName] = useState("");
  const [manualIngredients, setManualIngredients] = useState("");

  const startCamera = async () => {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError("Camera permission denied or camera unavailable.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (activeTab === "camera") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [activeTab]);

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
        alert("Could not detect barcode digits in image. Searching sample database item...");
        await handleBarcodeLookup("085262900403");
      }
    } catch (err) {
      console.error("Barcode Image Error:", err);
      alert("Error reading barcode image.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleManualAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualIngredients.trim()) return;
    setIsScanning(true);
    try {
      const res = await fetch("/api/ocr/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extractedText: `Product: ${manualName}. Ingredients: ${manualIngredients}` }),
      });
      const data = await res.json();
      if (data.data) {
        setScanResult({
          product: {
            name: manualName || "Custom Food Entry",
            barcode: "MANUAL-" + Date.now().toString().slice(-6),
            ingredients: manualIngredients,
          },
          analysis: data.data.analysis,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleToggleFavorite = async (productId?: string) => {
    if (!productId) return;
    try {
      await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      alert("Favorite status updated!");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 pb-20 lg:pb-0">
      <Navbar />
      <OfflineIndicator />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <QrCode className="h-7 w-7 text-brand-400" />
              <span>System A & D: Barcode & Manual Food Checker</span>
            </h1>
            <p className="text-xs text-slate-400">
              Scan food barcodes with camera, upload packaging photos, or enter ingredients manually for instant allergy safety evaluation.
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="flex gap-2 border-b border-slate-800 pb-3">
            <button
              onClick={() => setActiveTab("camera")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeTab === "camera"
                  ? "bg-brand-600 text-white"
                  : "bg-slate-900 text-slate-300 hover:bg-slate-800"
              }`}
            >
              <Camera className="h-4 w-4" /> Live Camera Barcode
            </button>
            <button
              onClick={() => setActiveTab("upload")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeTab === "upload"
                  ? "bg-brand-600 text-white"
                  : "bg-slate-900 text-slate-300 hover:bg-slate-800"
              }`}
            >
              <Upload className="h-4 w-4" /> Upload / Search Barcode
            </button>
            <button
              onClick={() => setActiveTab("manual")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeTab === "manual"
                  ? "bg-brand-600 text-white"
                  : "bg-slate-900 text-slate-300 hover:bg-slate-800"
              }`}
            >
              <Edit3 className="h-4 w-4" /> System D: Manual Entry
            </button>
          </div>

          {/* TAB 1: LIVE CAMERA */}
          {activeTab === "camera" && (
            <Card className="border-slate-800 bg-slate-900/60 p-6 flex flex-col items-center justify-center text-center space-y-4 relative overflow-hidden">
              <div className="relative w-full max-w-md h-72 rounded-2xl overflow-hidden bg-slate-950 border-2 border-brand-500/50 shadow-2xl">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <div className="absolute inset-0 border-2 border-dashed border-brand-400/80 m-8 rounded-xl pointer-events-none flex flex-col items-center justify-center">
                  <div className="w-full h-0.5 bg-brand-400 animate-pulse shadow-lg shadow-brand-400" />
                </div>
              </div>

              {cameraError ? (
                <p className="text-xs text-rose-400 font-bold">{cameraError}</p>
              ) : (
                <p className="text-xs text-slate-400">Position product UPC barcode inside the frame box</p>
              )}

              <div className="flex gap-2">
                <Button onClick={() => handleBarcodeLookup("085262900403")} variant="primary" size="sm">
                  Simulate Barcode Scan (Beyond Burger)
                </Button>
                <Button onClick={() => handleBarcodeLookup("042272000449")} variant="outline" size="sm">
                  Simulate Barcode Scan (Cheese Pizza)
                </Button>
              </div>
            </Card>
          )}

          {/* TAB 2: UPLOAD / LOOKUP */}
          {activeTab === "upload" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-slate-800 bg-slate-900/60 p-6 flex flex-col items-center justify-center text-center space-y-4 min-h-[280px] border-dashed">
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
              </Card>

              <Card className="border-slate-800 bg-slate-900/80 p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Enter Barcode Digits
                  </label>
                  <p className="text-xs text-slate-400">Enter UPC/EAN digits directly to check database status.</p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (manualBarcode.trim()) handleBarcodeLookup(manualBarcode.trim());
                  }}
                  className="space-y-3"
                >
                  <Input
                    placeholder="Barcode digits (e.g. 089425000008)"
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
          )}

          {/* TAB 3: SYSTEM D MANUAL ENTRY */}
          {activeTab === "manual" && (
            <Card className="border-slate-800 bg-slate-900 p-6 space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Edit3 className="h-5 w-5 text-brand-400" /> System D: Manual Food & Ingredient Entry
                </h3>
                <p className="text-xs text-slate-400">
                  Type any custom product or restaurant dish name with its raw ingredient list for immediate AI allergy analysis.
                </p>
              </div>

              <form onSubmit={handleManualAnalyze} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300">Food / Product Name</label>
                  <Input
                    placeholder="e.g. Homemade Chocolate Chip Cookies"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300">Raw Ingredients List</label>
                  <textarea
                    rows={4}
                    placeholder="e.g. Wheat Flour, Sugar, Butter (Milk), Eggs, Cocoa Butter, Soy Lecithin, Vanilla, Traces of Peanuts."
                    value={manualIngredients}
                    onChange={(e) => setManualIngredients(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 mt-1"
                    required
                  />
                </div>
                <Button type="submit" variant="primary" size="md" isLoading={isScanning} disabled={!manualIngredients.trim()}>
                  <Search className="h-4 w-4 mr-2" /> Analyze Manual Ingredients Immediately
                </Button>
              </form>
            </Card>
          )}

          <MedicalDisclaimer compact />

          {/* Scan Result Output Modal / View */}
          {scanResult && (
            <Card className="border-slate-800 bg-slate-900 p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-brand-400" />
                    <span>AllerScan Product Safety Evaluation</span>
                  </h3>
                  <p className="text-xs text-slate-400">Barcode / Entry: {scanResult.product?.barcode}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleFavorite(scanResult.product?.id)}
                    className="flex items-center gap-1 text-xs font-bold text-rose-400 hover:bg-rose-500/10 p-2 rounded-xl border border-rose-500/20"
                  >
                    <Heart className="h-4 w-4" /> Favorite
                  </button>
                  <button onClick={() => setScanResult(null)} className="text-slate-400 hover:text-white">
                    <X className="h-5 w-5" />
                  </button>
                </div>
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
