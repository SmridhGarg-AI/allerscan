import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Settings, Bell, Lock, Eye, Download, Trash2 } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 pb-20 lg:pb-0">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <Settings className="h-7 w-7 text-brand-400" />
              <span>Application Settings</span>
            </h1>
            <p className="text-xs text-slate-400">
              Configure notifications, privacy preferences, offline storage, and data export.
            </p>
          </div>

          <Card className="border-slate-800 bg-slate-900/80 p-6 space-y-6">
            {/* Notifications */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Bell className="h-4 w-4 text-brand-400" />
                <span>Notification Preferences</span>
              </h3>
              <div className="space-y-2 text-xs">
                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span>Food Safety & Recall Alerts</span>
                  <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-800 text-brand-500" />
                </label>
                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span>Weekly Allergen Summary Reports</span>
                  <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-800 text-brand-500" />
                </label>
              </div>
            </div>

            {/* Data Export */}
            <div className="space-y-3 border-t border-slate-800 pt-6">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Download className="h-4 w-4 text-emerald-400" />
                <span>Data Export & Privacy</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm">
                  Export Profile Data (JSON)
                </Button>
                <Button variant="outline" size="sm">
                  Export Scan History (CSV)
                </Button>
              </div>
            </div>
          </Card>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
