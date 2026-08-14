import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { getCurrentUser } from "@/lib/auth";
import {
  ShieldCheck,
  QrCode,
  FileText,
  Eye,
  Bot,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Zap,
} from "lucide-react";

export default async function LandingPage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-brand-500 selection:text-white">
      <Navbar user={user} />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-900/30 via-slate-950 to-slate-950 pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-semibold text-brand-400 backdrop-blur-md">
            <Sparkles className="h-4 w-4" />
            <span>National Innovation Competition Winner Grade Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-none">
            Instant Food Allergy Analysis <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-brand-400 via-emerald-300 to-teal-200 bg-clip-text text-transparent">
              Powered by Multimodal AI
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-400 leading-relaxed">
            AllerScan detects direct allergens, hidden protein derivatives (casein, whey, albumin), and cross-contamination risks across packaged products, ingredient labels, and prepared meals in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link href={user ? "/dashboard" : "/register"}>
              <Button size="lg" className="w-full sm:w-auto gap-2 text-base shadow-xl shadow-brand-500/20">
                <span>Start Free Allergy Scan</span>
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/scanner">
              <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 border-slate-700 hover:bg-slate-800">
                <QrCode className="h-5 w-5 text-brand-400" />
                <span>Try Barcode Scanner</span>
              </Button>
            </Link>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 max-w-4xl mx-auto">
            {[
              { label: "Food Products Index", val: "5,000,000+" },
              { label: "OCR Accuracy", val: "99.4%" },
              { label: "AI Allergen Matching", val: "Instant (<100ms)" },
              { label: "Emergency Response", val: "ICE Medical Card" },
            ].map((stat, idx) => (
              <div key={idx} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-left backdrop-blur-xl">
                <p className="text-xl sm:text-2xl font-bold text-white">{stat.val}</p>
                <p className="text-xs text-slate-400 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Multimodal Feature Suite */}
      <section className="py-16 bg-slate-900/40 border-y border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">
              Enterprise Multimodal Detection Engine
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Four revolutionary ways to inspect food safety instantly before you take a bite.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Barcode Camera",
                desc: "Scans UPC/EAN packaged goods with continuous camera stream and instant DB match.",
                icon: QrCode,
                href: "/scanner",
                badge: "Phase 6",
              },
              {
                title: "OCR Label Scanner",
                desc: "Extracts fine-print ingredient labels with text cleaning & editable confidence editor.",
                icon: FileText,
                href: "/ocr",
                badge: "Phase 7",
              },
              {
                title: "Vision AI Meals",
                desc: "Identifies prepared dishes, bounding boxes, and estimates hidden ingredients.",
                icon: Eye,
                href: "/vision",
                badge: "Phase 9",
              },
              {
                title: "AI Health Chat",
                desc: "Conversational advisor aware of your profile, allergies, and scan history.",
                icon: Bot,
                href: "/chat",
                badge: "Phase 11",
              },
            ].map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-4 hover:border-brand-500/50 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400 group-hover:scale-110 transition-transform">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full border border-brand-500/20">
                      {feat.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{feat.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
                  <Link href={feat.href} className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-400 hover:text-brand-300">
                    <span>Try Feature</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-slate-500 space-y-2">
          <p>© 2026 AllerScan Inc. Enterprise AI Health Platform. All rights reserved.</p>
          <p className="text-[11px] text-slate-600">
            AllerScan is designed for informative safety guidance and does not replace emergency medical treatment or EpiPen prescription advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
