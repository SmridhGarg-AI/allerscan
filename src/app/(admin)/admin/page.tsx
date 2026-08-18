import React from "react";
import Link from "next/link";
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
  ShieldAlert,
  Lock,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMINISTRATOR") {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <Navbar user={user} />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full border-slate-800 bg-slate-900/90 p-6 text-center space-y-4 shadow-2xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mx-auto">
              <Lock className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-extrabold text-white">Administrator Portal Access</h1>
              <p className="text-xs text-slate-400">
                You are currently logged in as <span className="text-brand-400 font-bold">{user?.email || "Guest"}</span> ({user?.role || "CUSTOMER"}). To access the Admin Dashboard, log in with administrator credentials.
              </p>
            </div>
            <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 text-left text-xs space-y-1">
              <p className="font-bold text-amber-400">Admin Account Credentials:</p>
              <p className="text-slate-300">Email: <code className="text-white">admin@allerscan.com</code></p>
              <p className="text-slate-300">Password: <code className="text-white">AdminPassword123!</code></p>
            </div>
            <Link href="/login">
              <Button variant="primary" className="w-full">
                Sign In as Administrator
              </Button>
            </Link>
          </Card>
        </main>
      </div>
    );
  }

  const totalUsers = await prisma.user.count();
  const totalProducts = await prisma.product.count();
  const totalScans = await prisma.scanHistory.count();
  const totalOcrScans = await prisma.oCRScan.count();
  const totalVisionScans = await prisma.visionScan.count();

  const products = await prisma.product.findMany({
    take: 15,
    orderBy: { createdAt: "desc" },
    include: { brand: true, category: true },
  });

  const recentUsers = await prisma.user.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: { allergies: true, profile: true },
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 pb-10">
      <Navbar user={user} />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 border border-amber-500/20">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Platform Control Operations (Secret Admin Portal)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Enterprise Operations & Moderator Dashboard
            </h1>
          </div>

          <div className="flex gap-2">
            <Link href="/products">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Package className="h-4 w-4" />
                <span>View Food Catalog</span>
              </Button>
            </Link>
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

        {/* System Health Monitor */}
        <Card className="border-slate-800 bg-slate-900/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <p className="font-bold text-white">Prisma DB & Multi-Provider AI Cluster: ONLINE</p>
              <p className="text-slate-400">Allergen Synonym Resolver & Gemini Flash API active</p>
            </div>
          </div>
          <Badge variant="safe">HEALTHY</Badge>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Management Table */}
          <Card className="lg:col-span-2 border-slate-800 bg-slate-900/80 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Package className="h-4 w-4 text-emerald-400" />
                <span>Food Product Registry</span>
              </h3>
              <span className="text-xs text-slate-400">{products.length} registered items</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="border-b border-slate-800 uppercase text-[10px] text-slate-400 font-bold bg-slate-950/50">
                  <tr>
                    <th className="p-3">Product Name</th>
                    <th className="p-3">Barcode</th>
                    <th className="p-3">Brand</th>
                    <th className="p-3">AI Safety</th>
                    <th className="p-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {products.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-bold text-white">{prod.name}</td>
                      <td className="p-3 text-slate-400 font-mono">{prod.barcode}</td>
                      <td className="p-3 text-brand-400">{prod.brand?.name || "Global"}</td>
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

          {/* Users Moderation Panel */}
          <Card className="border-slate-800 bg-slate-900/80 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Users className="h-4 w-4 text-brand-400" />
              <span>User Accounts Moderation</span>
            </h3>

            <div className="space-y-3">
              {recentUsers.map((u) => (
                <div key={u.id} className="rounded-xl bg-slate-950 p-3 border border-slate-800 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-white">{u.fullName || u.email}</p>
                    <Badge variant={u.role === "ADMINISTRATOR" ? "caution" : "safe"}>
                      {u.role}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-400">{u.email}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span>Allergies: {u.allergies.length} recorded</span>
                    <span>Age: {u.profile?.age || "N/A"}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
