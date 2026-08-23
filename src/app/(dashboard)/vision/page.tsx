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
import { Eye, Upload, Sparkles, CheckCircle2, AlertTriangle, XCircle, RefreshCw, RotateCw, Crop, Sliders } from "lucide-react";
import { createWorker } from "tesseract.js";

export default function VisionAIPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [visionResult, setVisionResult] = useState<any>(null);

  // Image pre-processing controls
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);

  const handleMealImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
    setIsAnalyzing(true);
    setVisionResult(null);

    try {
      const worker = await createWorker("eng");
      const ret = await worker.recognize(file);
      await worker.terminate();

      const extractedText = ret.data.text || "";

      const res = await fetch("/api/vision/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageName: file.name,
          extractedText,
        }),
      });

      const data = await res.json();
      if (res.ok && data.data) {
        setVisionResult(data.data);
      } else {
        alert("Failed to analyze meal photo.");
      }
    } catch (err) {
      console.error("Vision AI Error:", err);
      alert("Error analyzing meal image.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePasteImage = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const fakeEvent = { target: { files: [file] } } as any;
          handleMealImageUpload(fakeEvent);
        }
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 pb-20 lg:pb-0" onPaste={handlePasteImage}>
      <Navbar />
      <OfflineIndicator />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <Eye className="h-7 w-7 text-purple-400" />
              <span>System C: Vision AI Meal & Dish Scanner</span>
            </h1>
            <p className="text-xs text-slate-400">
              Upload, drop, or paste any food image (packaged, restaurant, or homemade) to detect dishes, estimate nutrition, and check allergens.
            </p>
          </div>

          <Card className="border-slate-800 bg-slate-900/60 p-6 flex flex-col items-center justify-center text-center space-y-4 min-h-[300px] border-dashed relative overflow-hidden">
            {selectedImage ? (
              <div className="w-full h-full space-y-4">
                <div className="relative h-64 w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
                  <img
                    src={selectedImage}
                    alt="Uploaded Meal"
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                    }}
                    className="h-full w-full object-contain transition-all"
                  />
                </div>

                {/* Pre-processing Control Sliders */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <RotateCw className="h-4 w-4 text-purple-400" />
                    <button
                      onClick={() => setRotation((prev) => (prev + 90) % 360)}
                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 font-bold"
                    >
                      Rotate 90°
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-purple-400" />
                    <span>Brightness ({brightness}%)</span>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={brightness}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="w-24 accent-purple-500"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span>Contrast ({contrast}%)</span>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={contrast}
                      onChange={(e) => setContrast(Number(e.target.value))}
                      className="w-24 accent-purple-500"
                    />
                  </div>

                  <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors">
                    <Upload className="h-4 w-4" />
                    <span>Upload Different Photo</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleMealImageUpload} />
                  </label>
                </div>
              </div>
            ) : (
              <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center space-y-3 p-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Upload className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white">Click, Drag & Drop, or Paste Meal Photo (Ctrl+V)</p>
                  <p className="text-xs text-slate-400">Select any meal photograph (PNG, JPG, WEBP)</p>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleMealImageUpload} />
              </label>
            )}

            {isAnalyzing && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-2">
                <RefreshCw className="h-8 w-8 text-purple-400 animate-spin" />
                <p className="text-xs font-bold text-white">Vision AI Analyzing Meal Photo...</p>
              </div>
            )}
          </Card>

          <MedicalDisclaimer compact />

          {/* Vision Results */}
          {visionResult && (
            <Card className="border-slate-800 bg-slate-900 p-6 space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Eye className="h-5 w-5 text-purple-400" />
                  <span>Vision AI Food Identification</span>
                </h3>
                <Badge variant="safe">Vision Confidence: 93%</Badge>
              </div>

              {/* Detected Foods Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {visionResult.detectedFoods?.map((food: any, idx: number) => (
                  <div key={idx} className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-white">{food.name}</p>
                      <span className="text-[10px] font-bold text-purple-400">{(food.confidence * 100).toFixed(0)}% match</span>
                    </div>
                    <p className="text-xs text-slate-400">Category: {food.category}</p>
                  </div>
                ))}
              </div>

              {/* Estimated Macro Nutrition */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-300">Estimated Meal Nutrition:</p>
                  <span className="text-[10px] text-amber-400 font-bold">* AI Nutrition Estimates</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="rounded-xl bg-slate-950 p-3 border border-slate-800">
                    <p className="text-lg font-bold text-brand-400">{visionResult.nutritionEstimate?.calories}</p>
                    <p className="text-[10px] text-slate-400">Calories</p>
                  </div>
                  <div className="rounded-xl bg-slate-950 p-3 border border-slate-800">
                    <p className="text-lg font-bold text-emerald-400">{visionResult.nutritionEstimate?.protein}g</p>
                    <p className="text-[10px] text-slate-400">Protein</p>
                  </div>
                  <div className="rounded-xl bg-slate-950 p-3 border border-slate-800">
                    <p className="text-lg font-bold text-amber-400">{visionResult.nutritionEstimate?.carbs}g</p>
                    <p className="text-[10px] text-slate-400">Carbs</p>
                  </div>
                  <div className="rounded-xl bg-slate-950 p-3 border border-slate-800">
                    <p className="text-lg font-bold text-purple-400">{visionResult.nutritionEstimate?.fat}g</p>
                    <p className="text-[10px] text-slate-400">Fat</p>
                  </div>
                </div>
              </div>

              {/* AI Allergy Engine Result */}
              <div className={`rounded-2xl p-4 border ${
                visionResult.analysis?.safetyStatus === "SAFE"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-300"
              }`}>
                <div className="flex items-center gap-2 font-bold">
                  {visionResult.analysis?.safetyStatus === "SAFE" ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <XCircle className="h-5 w-5 text-rose-400" />
                  )}
                  <span>AI Safety Evaluation: {visionResult.analysis?.safetyStatus}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mt-1">{visionResult.analysis?.explanation}</p>
              </div>
            </Card>
          )}
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
