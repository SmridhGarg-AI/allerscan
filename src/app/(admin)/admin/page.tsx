import React from "react";
import Link from "next/link";

export const dynamic = "force-dynamic";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Sparkles,
  Users,
  Package,
  QrCode,
  FileText,
  Eye,
  ShieldCheck,
  Activity,
  Plus,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

import { notFound } from "next/navigation";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMINISTRATOR") {
    notFound();
  }

  const totalUsers = await prisma.user.count();
  const totalProducts = await prisma.product.count();
  const totalScans = await prisma.scanHistory.count();
  const totalOcrScans = await prisma.oCRScan.count();
  const totalVisionScans = await prisma.visionScan.count();

  const products = await prisma.product.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: { brand: true, category: true },
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar user={user} />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 border border-amber-500/20">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Admin Platform Operations (Phase 12)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Enterprise Admin Dashboard
            </h1>
          </div>

          <div className="flex gap-2">
            <Button variant="primary" size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              <span>Add Product</span>
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Total Users", val: totalUsers, icon: Users, color: "text-brand-400" },
            { label: "Food Products", val: totalProducts, icon: Package, color: "text-emerald-400" },
            { label: "Barcode Scans", val: totalScans, icon: QrCode, color: "text-amber-400" },
            { label: "OCR Scans", val: totalOcrScans, icon: FileText, color: "text-purple-400" },
            { label: "Vision AI Scans", val: totalVisionScans, icon: Eye, color: "text-rose-400" },
          ].map((m, idx) => {
            const Icon = m.icon;
            return (
              <Card key={idx} className="border-slate-800 bg-slate-900/80 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">{m.label}</span>
                  <Icon className={`h-4 w-4 ${m.color}`} />
                </div>
                <p className="text-2xl font-extrabold text-white">{m.val}</p>
              </Card>
            );
          })}
        </div>

        {/* System Health Status */}
        <Card className="border-slate-800 bg-slate-900/60 p-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <p className="font-bold text-white">Database & API Status: OPERATIONAL</p>
              <p className="text-slate-400">Multi-provider AI Cluster active (Gemini API / Fallback Engine)</p>
            </div>
          </div>
          <Badge variant="safe">HEALTHY</Badge>
        </Card>

        {/* Products Management Table */}
        <Card className="border-slate-800 bg-slate-900/80 p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Product Database Registry
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 uppercase text-[10px] text-slate-400 font-bold bg-slate-950/50">
                <tr>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Barcode</th>
                  <th className="p-3">Brand</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">AI Safety</th>
                  <th className="p-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-bold text-white">{prod.name}</td>
                    <td className="p-3 text-slate-400 font-mono">{prod.barcode}</td>
                    <td className="p-3 text-brand-400">{prod.brand?.name || "N/A"}</td>
                    <td className="p-3 text-slate-300">{prod.category?.name || "N/A"}</td>
                    <td className="p-3">
                      <Badge variant={prod.aiSafetyStatus === "SAFE" ? "safe" : "unsafe"}>
                        {prod.aiSafetyStatus}
                      </Badge>
                    </td>
                    <td className="p-3 text-slate-500">{formatDate(prod.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
}
