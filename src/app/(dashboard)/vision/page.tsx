"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MedicalDisclaimer } from "@/components/ui/MedicalDisclaimer";
import { Eye, Camera, Sparkles, CheckCircle2, AlertTriangle, XCircle, ArrowRight } from "lucide-react";

export default function VisionAIPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [visionResult, setVisionResult] = useState<any>(null);

  const handleRunVisionAI = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/vision/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: "sample_meal.jpg" }),
      });

      const data = await res.json();
      if (res.ok && data.data) {
        setVisionResult(data.data);
      }
    } catch (err) {
      console.error(err);
      alert("Vision AI failed.");
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
              <Eye className="h-7 w-7 text-purple-400" />
              <span>Vision AI Meal Recognition</span>
            </h1>
            <p className="text-xs text-slate-400">
              Identify multi-food dishes, estimate ingredients, and analyze allergy risks directly from meal photos.
            </p>
          </div>

          <Card className="border-slate-800 bg-slate-900/60 p-6 flex flex-col items-center justify-center text-center space-y-4 min-h-[280px]">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Camera className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-white">Capture or Select Meal Photograph</p>
              <p className="text-xs text-slate-400">Identifies dishes, sauces, side items, and hidden ingredients</p>
            </div>

            <Button variant="primary" size="lg" className="gap-2 shadow-lg shadow-purple-600/20 bg-purple-600 hover:bg-purple-700" onClick={handleRunVisionAI} isLoading={isAnalyzing}>
              <Sparkles className="h-5 w-5" />
              <span>Analyze Sample Meal Photo</span>
            </Button>
          </Card>

          <MedicalDisclaimer compact />

          {/* Vision Results */}
          {visionResult && (
            <Card className="border-slate-800 bg-slate-900 p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Eye className="h-5 w-5 text-purple-400" />
                  <span>Detected Meal Components</span>
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
                    <p className="text-xs text-slate-400">Estimated bounding region: [{food.boundingBox.join(", ")}]</p>
                  </div>
                ))}
              </div>

              {/* Estimated Macro Nutrition */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-300">Estimated Meal Nutrition:</p>
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

              {/* Handoff to AI Allergy Engine */}
              <div className="rounded-2xl p-4 border bg-emerald-500/10 border-emerald-500/30 text-emerald-300 space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  <span>AI Safety Evaluation: {visionResult.analysis?.safetyStatus}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{visionResult.analysis?.explanation}</p>
              </div>
            </Card>
          )}
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
