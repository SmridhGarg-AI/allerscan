import React from "react";
import Link from "next/link";

export const dynamic = "force-dynamic";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MedicalDisclaimer } from "@/components/ui/MedicalDisclaimer";
import {
  QrCode,
  FileText,
  Eye,
  Search,
  ShieldAlert,
  Sparkles,
  Heart,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  // Retrieve user allergy profile
  let allergies: string[] = [];
  let conditions: string[] = [];
  let diets: string[] = [];

  if (user) {
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { allergies: true, medicalConditions: true, dietPreferences: true },
    });
    if (fullUser) {
      allergies = fullUser.allergies.map((a) => a.allergenName);
      conditions = fullUser.medicalConditions.map((c) => c.conditionName);
      diets = fullUser.dietPreferences.map((d) => d.preferenceName);
    }
  }

  // Fetch recent products & safe recommendations
  const recentProducts = await prisma.product.findMany({
    take: 4,
    include: { brand: true, category: true },
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 pb-20 lg:pb-0">
      <Navbar user={user} />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
          {/* Greeting Hero Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-brand-900/60 via-slate-900 to-slate-900 border border-slate-800 p-6 backdrop-blur-xl shadow-xl">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-400 border border-brand-500/20">
                <Sparkles className="h-3.5 w-3.5" />
                <span>AI Health Portal Active</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Good day, {user?.fullName || "Sarah"} 👋
              </h1>
              <p className="text-xs text-slate-400">
                AllerScan is actively shielding your nutrition intake against {allergies.length} configured allergen profiles.
              </p>
            </div>

            <div className="flex gap-2">
              <Link href="/scanner">
                <Button variant="primary" size="md" className="gap-2 shadow-lg shadow-brand-500/20">
                  <QrCode className="h-4 w-4" />
                  <span>Scan Barcode</span>
                </Button>
              </Link>
              <Link href="/emergency">
                <Button variant="danger" size="md" className="gap-2">
                  <ShieldAlert className="h-4 w-4" />
                  <span>ICE Emergency</span>
                </Button>
              </Link>
            </div>
          </div>

          <MedicalDisclaimer compact />

          {/* Quick Actions Grid */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              Quick Scan Actions
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { title: "Barcode Scan", desc: "Camera UPC reader", icon: QrCode, href: "/scanner", color: "text-brand-400 bg-brand-500/10" },
                { title: "OCR Label", desc: "Extract ingredient text", icon: FileText, href: "/ocr", color: "text-emerald-400 bg-emerald-500/10" },
                { title: "Vision AI", desc: "Meal photo recognition", icon: Eye, href: "/vision", color: "text-purple-400 bg-purple-500/10" },
                { title: "Food Search", desc: "Search 5M+ database", icon: Search, href: "/products", color: "text-amber-400 bg-amber-500/10" },
              ].map((act, i) => {
                const Icon = act.icon;
                return (
                  <Link key={i} href={act.href}>
                    <Card className="p-4 border-slate-800 bg-slate-900/60 hover:border-brand-500/50 hover:bg-slate-900/90 transition-all group">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${act.color} mb-3 group-hover:scale-110 transition-transform`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="text-xs font-bold text-white group-hover:text-brand-300">{act.title}</p>
                      <p className="text-[10px] text-slate-400">{act.desc}</p>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Allergy Summary & Daily Health Tip */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Allergy Summary Card */}
            <Card className="border-slate-800 bg-slate-900/60 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-brand-400" />
                  <h3 className="text-base font-bold text-white">Active Allergy Profile</h3>
                </div>
                <Link href="/profile" className="text-xs font-semibold text-brand-400 hover:underline">
                  Manage
                </Link>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-slate-400 font-medium">Configured Allergens:</p>
                <div className="flex flex-wrap gap-1.5">
                  {allergies.length > 0 ? (
                    allergies.map((allg, idx) => (
                      <span key={idx} className="rounded-lg bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 text-xs font-bold text-rose-300">
                        ⚠️ {allg}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">No allergies configured</span>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-800/80 pt-3 flex justify-between text-xs text-slate-400">
                <span>Medical: {conditions.join(", ") || "None"}</span>
                <span>Diets: {diets.join(", ") || "None"}</span>
              </div>
            </Card>

            {/* Daily Health Tip */}
            <Card className="border-slate-800 bg-slate-900/60 p-6 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <Sparkles className="h-5 w-5" />
                <h3 className="text-base font-bold text-white">Today's AllerScan AI Tip</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                "Hidden derivatives like Casein and Whey proteins are derived from cow's milk. Always check fine-print emulsifiers when selecting packaged soups or energy bars!"
              </p>
              <div className="pt-2 text-[11px] font-semibold text-brand-400">
                Medical Category: Clinical Allergy Advice
              </div>
            </Card>
          </div>

          {/* Product Database Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                Recommended Safe Foods
              </h2>
              <Link href="/products" className="text-xs font-bold text-brand-400 flex items-center gap-1 hover:underline">
                <span>Browse All</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentProducts.map((prod) => (
                <Link key={prod.id} href={`/products/${prod.id}`}>
                  <Card className="border-slate-800 bg-slate-900/80 p-4 space-y-3 hover:border-brand-500/50 transition-all group">
                    <div className="relative h-36 w-full overflow-hidden rounded-xl bg-slate-800">
                      <img
                        src={prod.image || "https://images.unsplash.com/photo-1563636619-e9143da7973b"}
                        alt={prod.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge variant={prod.aiSafetyStatus === "SAFE" ? "safe" : "unsafe"}>
                          {prod.aiSafetyStatus}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[11px] font-bold text-brand-400 uppercase">{prod.brand?.name || "AllerScan Verified"}</p>
                      <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-brand-300">{prod.name}</h4>
                      <p className="text-[10px] text-slate-400 line-clamp-1">Barcode: {prod.barcode}</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
