import React from "react";
import Link from "next/link";
export const dynamic = "force-dynamic";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { OfflineIndicator } from "@/components/ui/OfflineIndicator";
import { ProfileClientManager } from "./ProfileClientManager";
import { User, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/Button";

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
        notificationSettings: true,
        privacySettings: true,
      },
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 pb-20 lg:pb-0">
      <Navbar user={user} />
      <OfflineIndicator />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
                <User className="h-7 w-7 text-brand-400" />
                <span>User Profile & Health Parameters</span>
              </h1>
              <p className="text-xs text-slate-400">
                Manage your active allergies, medical conditions, diet rules, and account parameters.
              </p>
            </div>

            <Link href="/onboarding">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Edit3 className="h-4 w-4" />
                <span>Onboarding Wizard</span>
              </Button>
            </Link>
          </div>

          <ProfileClientManager initialData={userProfileData} />
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
