"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MedicalDisclaimer } from "@/components/ui/MedicalDisclaimer";
import { FileText, Upload, Sparkles, CheckCircle2, AlertTriangle, XCircle, ArrowRight, RefreshCw } from "lucide-react";

export default function OCRScannerPage() {
  const [ocrText, setOcrText] = useState(
    "Ingredients: Organic Tomato Purée, Filtered Water, Organic Cream (Milk), Organic Cane Sugar, Sea Salt, Organic Onion Powder, Processed in a facility that handles Peanuts."
  );
  const [confidence, setConfidence] = useState(0.94);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  const handleExtractOCR = () => {
    setIsExtracting(true);
    setTimeout(() => {
      setIsExtracting(false);
      alert("OCR text extracted with 94% confidence.");
    }, 1000);
  };

  const handleRunAIAnalysis = async () => {
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

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <FileText className="h-7 w-7 text-emerald-400" />
              <span>OCR Ingredient Label Scanner</span>
            </h1>
            <p className="text-xs text-slate-400">
              Photograph or upload any physical food package ingredient label to extract fine text and verify safety.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image Dropzone & Preview */}
            <Card className="border-slate-800 bg-slate-900/60 p-6 flex flex-col items-center justify-center text-center space-y-4 min-h-[300px] border-dashed">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Upload className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">Upload Ingredient Label Photo</p>
                <p className="text-xs text-slate-400">Supports PNG, JPG, WEBP up to 10MB</p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={handleExtractOCR} isLoading={isExtracting}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  <span>Simulate Camera Upload</span>
                </Button>
              </div>
            </Card>

            {/* Extracted Text Editor */}
            <Card className="border-slate-800 bg-slate-900/80 p-6 space-y-4 flex flex-col">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Extracted Ingredient Text
                </label>
                <Badge variant="safe">
                  OCR Accuracy: {(confidence * 100).toFixed(0)}%
                </Badge>
              </div>

              <textarea
                rows={6}
                value={ocrText}
                onChange={(e) => setOcrText(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed font-mono resize-none"
              />

              <p className="text-[11px] text-slate-400 italic">
                * You can manually correct any OCR typos in the text area above before running AI analysis.
              </p>

              <Button
                variant="mint"
                size="lg"
                className="w-full mt-auto gap-2"
                onClick={handleRunAIAnalysis}
                isLoading={isAnalyzing}
              >
                <Sparkles className="h-5 w-5" />
                <span>Run AI Allergen Analysis</span>
              </Button>
            </Card>
          </div>

          <MedicalDisclaimer compact />

          {/* AI Analysis Result Output */}
          {aiResult && (
            <Card className="border-slate-800 bg-slate-900 p-6 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-400" />
                <span>AI Label Analysis Results</span>
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
                  <h4 className="text-base font-extrabold uppercase">Status: {aiResult.safetyStatus}</h4>
                  <p className="text-xs leading-relaxed mt-1">{aiResult.explanation}</p>
                </div>
              </div>

              {aiResult.detectedAllergens?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-rose-400">Detected Allergen Triggers:</p>
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
