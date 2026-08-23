"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { OfflineIndicator } from "@/components/ui/OfflineIndicator";
import { Settings, Bell, Lock, Eye, Download, ShieldCheck, CheckCircle2 } from "lucide-react";
import { exportDataAsJSON, exportScanHistoryAsCSV } from "@/lib/export";

export default function SettingsPage() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [safetyAlerts, setSafetyAlerts] = useState(true);
  const [recallAlerts, setRecallAlerts] = useState(true);
  const [shareAnalytics, setShareAnalytics] = useState(true);

  const [saveSuccess, setSaveSuccess] = useState("");

  useEffect(() => {
    fetch("/api/user/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          const n = data.data.notificationSettings;
          const p = data.data.privacySettings;
          if (n) {
            setPushEnabled(n.pushEnabled);
            setEmailEnabled(n.emailEnabled);
            setSafetyAlerts(n.safetyAlerts);
            setRecallAlerts(n.recallAlerts);
          }
          if (p) {
            setShareAnalytics(p.shareAnonymousAnalytics);
          }
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSaveSettings = async () => {
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notificationSettings: {
            pushEnabled,
            emailEnabled,
            safetyAlerts,
            recallAlerts,
          },
          privacySettings: {
            shareAnonymousAnalytics: shareAnalytics,
          },
        }),
      });

      if (res.ok) {
        setSaveSuccess("Settings saved successfully!");
        setTimeout(() => setSaveSuccess(""), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportDataJSON = async () => {
    try {
      const res = await fetch("/api/user/profile");
      const data = await res.json();
      if (data.data) {
        exportDataAsJSON(data.data, "allerscan-user-export.json");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 pb-20 lg:pb-0">
      <Navbar />
      <OfflineIndicator />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <Settings className="h-7 w-7 text-brand-400" />
              <span>Application Settings & Notifications</span>
            </h1>
            <p className="text-xs text-slate-400">
              Configure notification channels, privacy parameters, dark mode, and export offline data.
            </p>
          </div>

          {saveSuccess && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs font-bold text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>{saveSuccess}</span>
            </div>
          )}

          <Card className="border-slate-800 bg-slate-900/80 p-6 space-y-6">
            {/* Notifications Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Bell className="h-4 w-4 text-brand-400" />
                <span>Notification Preferences</span>
              </h3>
              <div className="space-y-2 text-xs">
                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <span>Food Recall Alerts</span>
                  <input
                    type="checkbox"
                    checked={recallAlerts}
                    onChange={(e) => setRecallAlerts(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-800 text-brand-500 h-4 w-4"
                  />
                </label>
                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <span>Instant Allergen Safety Alerts</span>
                  <input
                    type="checkbox"
                    checked={safetyAlerts}
                    onChange={(e) => setSafetyAlerts(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-800 text-brand-500 h-4 w-4"
                  />
                </label>
                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <span>Push Notifications</span>
                  <input
                    type="checkbox"
                    checked={pushEnabled}
                    onChange={(e) => setPushEnabled(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-800 text-brand-500 h-4 w-4"
                  />
                </label>
              </div>
            </div>

            {/* Privacy Section */}
            <div className="space-y-3 border-t border-slate-800 pt-6">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Lock className="h-4 w-4 text-purple-400" />
                <span>Privacy & AI Improvements</span>
              </h3>
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer text-xs">
                <span>Share Anonymous Analytics to Improve AI Models</span>
                <input
                  type="checkbox"
                  checked={shareAnalytics}
                  onChange={(e) => setShareAnalytics(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-brand-500 h-4 w-4"
                />
              </label>
            </div>

            {/* Data Export */}
            <div className="space-y-3 border-t border-slate-800 pt-6">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Download className="h-4 w-4 text-emerald-400" />
                <span>Offline Backup & Data Export</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={handleExportDataJSON} className="gap-2">
                  <Download className="h-4 w-4" /> Export Complete Profile (JSON)
                </Button>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 flex justify-end">
              <Button variant="primary" size="sm" onClick={handleSaveSettings}>
                Save All Settings
              </Button>
            </div>
          </Card>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
