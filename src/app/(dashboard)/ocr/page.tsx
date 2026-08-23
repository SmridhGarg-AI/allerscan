"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MedicalDisclaimer } from "@/components/ui/MedicalDisclaimer";
import { OfflineIndicator } from "@/components/ui/OfflineIndicator";
import { FileText, Upload, Sparkles, CheckCircle2, AlertTriangle, XCircle, RefreshCw, Image as ImageIcon } from "lucide-react";
import { createWorker } from "tesseract.js";

export default function OCRScannerPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState("");
  const [confidence, setConfidence] = useState<number | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
    setOcrText("");
    setConfidence(null);
    setAiResult(null);

    // Perform real OCR using Tesseract.js
    setIsExtracting(true);
    try {
      const worker = await createWorker("eng");
      const ret = await worker.recognize(file);
      setOcrText(ret.data.text || "No text detected in image.");
      setConfidence(ret.data.confidence / 100);
      await worker.terminate();
    } catch (err) {
      console.error("OCR Extraction Error:", err);
      alert("Failed to read text from image. Please try a clearer photo.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleRunAIAnalysis = async () => {
    if (!ocrText.trim()) {
      alert("Please upload an ingredient label image first.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/ocr/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extractedText: ocrText }),
      });

      const data = await res.json();
      if (res.ok && data.data) {
        setAiResult(data.data.analysis);
      } else {
        alert(data.error || "Analysis failed.");
      }
    } catch (err) {
      console.error(err);
      alert("AI analysis failed.");
    } finally {
      setIsAnalyzing(false);
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
              <FileText className="h-7 w-7 text-emerald-400" />
              <span>System B: Real OCR Ingredient Label Reader</span>
            </h1>
            <p className="text-xs text-slate-400">
              Upload any food package label or photograph to extract ingredient text, normalize raw terms, and detect active allergens.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Real File Uploader & Image Preview */}
            <Card className="border-slate-800 bg-slate-900/60 p-6 flex flex-col items-center justify-center text-center space-y-4 min-h-[300px] border-dashed relative overflow-hidden">
              {selectedImage ? (
                <div className="w-full h-full space-y-3">
                  <div className="relative h-48 w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                    <img src={selectedImage} alt="Uploaded Label" className="h-full w-full object-contain" />
                  </div>
                  <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-semibold text-white transition-colors">
                    <Upload className="h-4 w-4" />
                    <span>Upload Different Label</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
              ) : (
                <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center space-y-3 p-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Upload className="h-8 w-8" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white">Click or Drag & Drop Label Image</p>
                    <p className="text-xs text-slate-400">Select any food package ingredient photo (PNG, JPG, WEBP)</p>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              )}

              {isExtracting && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-2">
                  <RefreshCw className="h-8 w-8 text-emerald-400 animate-spin" />
                  <p className="text-xs font-bold text-white">Extracting Text from Image...</p>
                </div>
              )}
            </Card>

            {/* Extracted Text Editor */}
            <Card className="border-slate-800 bg-slate-900/80 p-6 space-y-4 flex flex-col">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Extracted Ingredient Text
                </label>
                {confidence !== null && (
                  <Badge variant={confidence > 0.7 ? "safe" : "caution"}>
                    OCR Accuracy: {(confidence * 100).toFixed(0)}%
                  </Badge>
                )}
              </div>

              <textarea
                rows={7}
                placeholder="Uploaded label text will appear here automatically..."
                value={ocrText}
                onChange={(e) => setOcrText(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed font-mono resize-none"
              />

              <p className="text-[11px] text-slate-400 italic">
                * You can edit or refine any extracted words before submitting to the AI Allergy Engine.
              </p>

              <Button
                variant="mint"
                size="lg"
                className="w-full mt-auto gap-2"
                onClick={handleRunAIAnalysis}
                isLoading={isAnalyzing}
                disabled={!ocrText.trim()}
              >
                <Sparkles className="h-5 w-5" />
                <span>Run AI Allergen Safety Analysis</span>
              </Button>
            </Card>
          </div>

          <MedicalDisclaimer compact />

          {/* AI Analysis Result Output */}
          {aiResult && (
            <Card className="border-slate-800 bg-slate-900 p-6 space-y-4 shadow-xl">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-400" />
                <span>AI Allergen Risk Analysis</span>
              </h3>

              <div className={`rounded-2xl p-4 border flex items-center gap-4 ${
                aiResult.safetyStatus === "SAFE"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-300"
              }`}>
                {aiResult.safetyStatus === "SAFE" ? (
                  <CheckCircle2 className="h-8 w-8 shrink-0 text-emerald-400" />
                ) : (
                  <XCircle className="h-8 w-8 shrink-0 text-rose-400" />
                )}
                <div>
                  <h4 className="text-base font-extrabold uppercase">Safety Evaluation: {aiResult.safetyStatus}</h4>
                  <p className="text-xs leading-relaxed mt-1">{aiResult.explanation}</p>
                </div>
              </div>

              {aiResult.detectedAllergens?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-rose-400">Triggered Allergens in Label:</p>
                  <div className="flex flex-wrap gap-2">
                    {aiResult.detectedAllergens.map((alg: any, idx: number) => (
                      <span key={idx} className="rounded-lg bg-rose-500/20 border border-rose-500/40 px-3 py-1 text-xs font-bold text-rose-300">
                        ⚠️ {alg.name} (Matched term: {alg.matchedIngredient})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
