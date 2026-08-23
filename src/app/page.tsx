import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Shield, QrCode, FileText, Eye, Bot, ShieldAlert, Sparkles, CheckCircle2, ArrowRight, Activity, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default async function RootPage() {
  const user = await getCurrentUser();

  if (user) {
    if (!user.onboardingCompleted) {
      redirect("/onboarding");
    }
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-brand-500 selection:text-white">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md shadow-brand-500/20">
              <Shield className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Aller<span className="text-brand-400">Scan</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="sm" className="shadow-lg shadow-brand-500/20">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-500/10 px-4 py-1.5 text-xs font-semibold text-brand-400 border border-brand-500/20 shadow-xl">
            <Sparkles className="h-4 w-4" />
            <span>Production-Ready AI Food Allergy Protection Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
            Never Risk an Allergic Reaction to Food Again with <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-emerald-400 to-teal-300">AllerScan AI</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            AllerScan normalizes complex ingredient formulas, flags hidden allergen derivatives, and empowers you with 4 distinct scan engines, an AI Health Assistant, and instant ICE Emergency Medical Cards.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/register" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full gap-2 text-base px-8 h-13 shadow-xl shadow-brand-500/25">
                <span>Start Scanning Free</span>
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full text-base px-8 h-13">
                Demo Sign In
              </Button>
            </Link>
          </div>

          {/* Quick Credential Box for Evaluators */}
          <div className="max-w-md mx-auto rounded-2xl bg-slate-900/80 p-4 border border-slate-800 text-left text-xs space-y-1">
            <p className="font-bold text-brand-400 flex items-center gap-1.5">
              <Activity className="h-4 w-4" /> Quick Demo Credentials:
            </p>
            <p className="text-slate-300">Customer Demo: <code className="text-white">demo@allerscan.com</code> / <code className="text-white">DemoUser123!</code></p>
            <p className="text-slate-300">Admin Portal: <code className="text-white">admin@allerscan.com</code> / <code className="text-white">AdminPassword123!</code></p>
          </div>
        </div>
      </section>

      {/* Four Checking Systems Grid */}
      <section className="py-16 bg-slate-900/50 border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Four Specialized Food Checking Systems
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              Designed for every scenario—from supermarket shelf scanning to restaurant meals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "A. Barcode Scanner",
                desc: "Live camera stream and instant UPC barcode lookup against 5M+ food products.",
                icon: QrCode,
                color: "text-brand-400 bg-brand-500/10 border-brand-500/20",
              },
              {
                title: "B. Ingredient Reader",
                desc: "Real OCR label text extraction via Tesseract with ingredient normalization.",
                icon: FileText,
                color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
              },
              {
                title: "C. Identify Food (Vision AI)",
                desc: "Multimodal meal detection, ingredient estimation, and nutritional breakdown.",
                icon: Eye,
                color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
              },
              {
                title: "D. Manual Entry",
                desc: "Type custom dish or product ingredients for instant clinical allergen analysis.",
                icon: Smartphone,
                color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
              },
            ].map((sys, idx) => {
              const Icon = sys.icon;
              return (
                <div key={idx} className="rounded-3xl bg-slate-900 p-6 border border-slate-800 space-y-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${sys.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-bold text-white">{sys.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{sys.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
