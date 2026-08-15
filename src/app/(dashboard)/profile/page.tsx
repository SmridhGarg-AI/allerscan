import React from "react";
import Link from "next/link";

export const dynamic = "force-dynamic";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { User, ShieldCheck, AlertTriangle, HeartPulse, Utensils, Settings, Edit3 } from "lucide-react";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  let userProfileData: any = null;
  if (user) {
    userProfileData = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        profile: true,
        allergies: true,
        medicalConditions: true,
        dietPreferences: true,
      },
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 pb-20 lg:pb-0">
      <Navbar user={user} />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
                <User className="h-7 w-7 text-brand-400" />
                <span>User Profile & Allergy Manager</span>
              </h1>
              <p className="text-xs text-slate-400">
                Manage your personal data, medical conditions, active allergies, and AI parameters.
              </p>
            </div>

            <Link href="/onboarding">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Edit3 className="h-4 w-4" />
                <span>Re-run Wizard</span>
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* User Avatar & Info */}
            <Card className="border-slate-800 bg-slate-900/80 p-6 flex flex-col items-center text-center space-y-3">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-600 text-white font-extrabold text-2xl shadow-xl shadow-brand-500/20">
                {user?.fullName ? user.fullName[0].toUpperCase() : "U"}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{user?.fullName || "Sarah Connor"}</h3>
                <p className="text-xs text-slate-400">{user?.email}</p>
                <span className="inline-block mt-2 rounded-full bg-brand-500/10 px-3 py-1 text-[11px] font-bold text-brand-400 border border-brand-500/20">
                  Role: {user?.role || "CUSTOMER"}
                </span>
              </div>
            </Card>

            {/* Profile Overview Details */}
            <Card className="md:col-span-2 border-slate-800 bg-slate-900/80 p-6 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-brand-400" />
                <span>Health Profile Parameters</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Age:</span>
                  <span className="font-bold text-white">{userProfileData?.profile?.age || 28} years</span>
                </div>
                <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Country:</span>
                  <span className="font-bold text-white">{userProfileData?.profile?.country || "United States"}</span>
                </div>
                <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Language:</span>
                  <span className="font-bold text-white">{userProfileData?.profile?.preferredLanguage || "English"}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Configured Allergies & Medical Conditions */}
          <Card className="border-slate-800 bg-slate-900/80 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-400" />
              <span>Active Allergy Profile ({userProfileData?.allergies?.length || 0})</span>
            </h3>

            <div className="flex flex-wrap gap-2">
              {userProfileData?.allergies?.length > 0 ? (
                userProfileData.allergies.map((alg: any) => (
                  <span key={alg.id} className="rounded-xl bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 text-xs font-bold text-rose-300">
                    ⚠️ {alg.allergenName} ({alg.severity})
                  </span>
                ))
              ) : (
                <p className="text-xs text-slate-400">No allergies configured</p>
              )}
            </div>
          </Card>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
