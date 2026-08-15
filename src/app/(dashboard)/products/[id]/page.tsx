import React from "react";
import Link from "next/link";

export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { analyzeIngredients } from "@/lib/ai";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MedicalDisclaimer } from "@/components/ui/MedicalDisclaimer";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  QrCode,
  Globe,
  Sparkles,
  Heart,
  Share2,
  ChevronLeft,
} from "lucide-react";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  const product = await prisma.product.findUnique({
    where: { id },
    include: { brand: true, category: true, nutrition: true },
  });

  if (!product) {
    notFound();
  }

  // Evaluate AI safety against user profile
  let userAllergies: Array<{ name: string; severity?: string }> = [];
  let dietPreferences: string[] = [];

  if (user) {
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { allergies: true, dietPreferences: true },
    });
    if (fullUser) {
      userAllergies = fullUser.allergies.map((a) => ({ name: a.allergenName, severity: a.severity }));
      dietPreferences = fullUser.dietPreferences.map((d) => d.preferenceName);
    }
  }

  const aiAnalysis = await analyzeIngredients({
    ingredients: product.ingredients,
    allergies: userAllergies,
    dietPreferences,
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 pb-20 lg:pb-0">
      <Navbar user={user} />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
          {/* Back Navigation */}
          <Link href="/products" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white">
            <ChevronLeft className="h-4 w-4" />
            <span>Back to Products</span>
          </Link>

          {/* Product Header Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative h-64 md:h-full w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
              <img
                src={product.image || "https://images.unsplash.com/photo-1563636619-e9143da7973b"}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="md:col-span-2 space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-bold text-brand-400 uppercase tracking-wider">{product.brand?.name || "AllerScan Verified"}</p>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{product.name}</h1>
                <p className="text-xs text-slate-400 flex items-center gap-2 pt-1">
                  <span>Barcode: {product.barcode}</span>
                  <span>•</span>
                  <span>Origin: {product.country || "United States"}</span>
                </p>
              </div>

              {/* Safety Evaluation Banner */}
              <div className={`rounded-2xl p-4 border flex items-center gap-4 ${
                aiAnalysis.safetyStatus === "SAFE"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-300"
              }`}>
                {aiAnalysis.safetyStatus === "SAFE" ? (
                  <CheckCircle2 className="h-8 w-8 shrink-0 text-emerald-400" />
                ) : (
                  <XCircle className="h-8 w-8 shrink-0 text-rose-400" />
                )}
                <div>
                  <h3 className="text-base font-extrabold uppercase">Safety Evaluation: {aiAnalysis.safetyStatus}</h3>
                  <p className="text-xs leading-relaxed mt-1">{aiAnalysis.explanation}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Heart className="h-4 w-4 text-rose-500" />
                  <span>Favorite</span>
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Share2 className="h-4 w-4" />
                  <span>Share Product</span>
                </Button>
              </div>
            </div>
          </div>

          <MedicalDisclaimer compact />

          {/* Ingredient Explorer */}
          <Card className="border-slate-800 bg-slate-900/80 p-6 space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Full Ingredient Breakdown
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed rounded-xl bg-slate-950 p-4 border border-slate-800">
              {product.ingredients}
            </p>
          </Card>

          {/* Nutrition Facts */}
          {product.nutrition && (
            <Card className="border-slate-800 bg-slate-900/80 p-6 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Nutrition Facts ({product.nutrition.servingSize})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="rounded-xl bg-slate-950 p-3 border border-slate-800">
                  <p className="text-lg font-bold text-brand-400">{product.nutrition.calories}</p>
                  <p className="text-[10px] text-slate-400">Calories</p>
                </div>
                <div className="rounded-xl bg-slate-950 p-3 border border-slate-800">
                  <p className="text-lg font-bold text-emerald-400">{product.nutrition.protein}g</p>
                  <p className="text-[10px] text-slate-400">Protein</p>
                </div>
                <div className="rounded-xl bg-slate-950 p-3 border border-slate-800">
                  <p className="text-lg font-bold text-amber-400">{product.nutrition.sugar}g</p>
                  <p className="text-[10px] text-slate-400">Sugar</p>
                </div>
                <div className="rounded-xl bg-slate-950 p-3 border border-slate-800">
                  <p className="text-lg font-bold text-purple-400">{product.nutrition.sodium}mg</p>
                  <p className="text-[10px] text-slate-400">Sodium</p>
                </div>
              </div>
            </Card>
          )}
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
