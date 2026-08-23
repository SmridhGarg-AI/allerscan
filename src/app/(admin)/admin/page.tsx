import React from "react";
import Link from "next/link";
export const dynamic = "force-dynamic";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AdminClientManager } from "./AdminClientManager";
import { Sparkles, Lock, ShieldCheck } from "lucide-react";

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

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { brand: true, category: true },
  });

  const usersList = await prisma.user.findMany({
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
              <span>Enterprise Control Operations (Admin Portal)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Administrator Dashboard & Management Center
            </h1>
          </div>
        </div>

        <AdminClientManager
          initialStats={{ totalUsers, totalProducts, totalScans }}
          initialUsers={usersList}
          initialProducts={products}
        />
      </main>
    </div>
  );
}
