"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { User, ShieldCheck, AlertTriangle, HeartPulse, Utensils, Bell, Lock, Download, Trash2, Plus, X, CheckCircle2 } from "lucide-react";
import { exportDataAsJSON, exportScanHistoryAsCSV } from "@/lib/export";

export function ProfileClientManager({ initialData }: { initialData: any }) {
  const [profileData, setProfileData] = useState(initialData);
  const [activeTab, setActiveTab] = useState<"profile" | "allergies" | "preferences" | "settings">("profile");

  // Form states
  const [fullName, setFullName] = useState(initialData?.fullName || "");
  const [age, setAge] = useState(initialData?.profile?.age || 28);
  const [country, setCountry] = useState(initialData?.profile?.country || "United States");
  const [language, setLanguage] = useState(initialData?.profile?.preferredLanguage || "English");

  // Allergy form
  const [newAllergen, setNewAllergen] = useState("");
  const [newSeverity, setNewSeverity] = useState("HIGH");
  const [newNotes, setNewNotes] = useState("");

  // Condition form
  const [newCondition, setNewCondition] = useState("");
  // Diet form
  const [newDiet, setNewDiet] = useState("");

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState("");

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess("");
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, age, country, preferredLanguage: language }),
      });
      if (res.ok) {
        setSaveSuccess("Profile details saved successfully!");
        setTimeout(() => setSaveSuccess(""), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddAllergy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAllergen.trim()) return;
    try {
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "ALLERGY", name: newAllergen.trim(), severity: newSeverity, notes: newNotes }),
      });
      const data = await res.json();
      if (data.data) {
        setProfileData((prev: any) => ({
          ...prev,
          allergies: [...(prev.allergies || []), data.data],
        }));
        setNewAllergen("");
        setNewNotes("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAllergy = async (id: string) => {
    try {
      await fetch(`/api/user/profile?id=${id}&type=ALLERGY`, { method: "DELETE" });
      setProfileData((prev: any) => ({
        ...prev,
        allergies: prev.allergies.filter((a: any) => a.id !== id),
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCondition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCondition.trim()) return;
    try {
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "MEDICAL_CONDITION", name: newCondition.trim() }),
      });
      const data = await res.json();
      if (data.data) {
        setProfileData((prev: any) => ({
          ...prev,
          medicalConditions: [...(prev.medicalConditions || []), data.data],
        }));
        setNewCondition("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCondition = async (id: string) => {
    try {
      await fetch(`/api/user/profile?id=${id}&type=MEDICAL_CONDITION`, { method: "DELETE" });
      setProfileData((prev: any) => ({
        ...prev,
        medicalConditions: prev.medicalConditions.filter((c: any) => c.id !== id),
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddDiet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiet.trim()) return;
    try {
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "DIET_PREFERENCE", name: newDiet.trim() }),
      });
      const data = await res.json();
      if (data.data) {
        setProfileData((prev: any) => ({
          ...prev,
          dietPreferences: [...(prev.dietPreferences || []), data.data],
        }));
        setNewDiet("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDiet = async (id: string) => {
    try {
      await fetch(`/api/user/profile?id=${id}&type=DIET_PREFERENCE`, { method: "DELETE" });
      setProfileData((prev: any) => ({
        ...prev,
        dietPreferences: prev.dietPreferences.filter((d: any) => d.id !== id),
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportData = () => {
    exportDataAsJSON(profileData, `allerscan-profile-${profileData?.email || "user"}.json`);
  };

  const handleDeleteAccount = async () => {
    setDeleteError("");
    try {
      const res = await fetch("/api/user/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setDeleteError(data.error || "Failed to delete account");
        return;
      }
      window.location.href = "/login";
    } catch (err) {
      setDeleteError("Network error occurred");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === "profile"
              ? "bg-brand-600 text-white"
              : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200"
          }`}
        >
          <User className="h-4 w-4" /> Personal Profile
        </button>
        <button
          onClick={() => setActiveTab("allergies")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === "allergies"
              ? "bg-brand-600 text-white"
              : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200"
          }`}
        >
          <AlertTriangle className="h-4 w-4 text-amber-400" /> Allergies & Medical ({profileData?.allergies?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("preferences")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === "preferences"
              ? "bg-brand-600 text-white"
              : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200"
          }`}
        >
          <Utensils className="h-4 w-4" /> Dietary Preferences
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === "settings"
              ? "bg-brand-600 text-white"
              : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200"
          }`}
        >
          <Lock className="h-4 w-4" /> Privacy & Export
        </button>
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs font-bold text-emerald-400">
          <CheckCircle2 className="h-4 w-4" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* TAB 1: PROFILE */}
      {activeTab === "profile" && (
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 flex flex-col items-center text-center space-y-3 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 text-white font-extrabold text-3xl shadow-xl shadow-brand-500/20">
                {fullName ? fullName[0].toUpperCase() : "U"}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{fullName}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{profileData?.email}</p>
                <span className="inline-block mt-2 rounded-full bg-brand-500/10 px-3 py-1 text-[11px] font-bold text-brand-500 border border-brand-500/20">
                  Role: {profileData?.role}
                </span>
              </div>
            </Card>

            <Card className="md:col-span-2 p-6 space-y-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-brand-500" /> Personal Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Full Name</label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1" required />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Age (Years)</label>
                  <Input type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} className="mt-1" required />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Country / Region</label>
                  <Input value={country} onChange={(e) => setCountry(e.target.value)} className="mt-1" required />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Preferred Language</label>
                  <Input value={language} onChange={(e) => setLanguage(e.target.value)} className="mt-1" required />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" variant="primary" size="sm" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Profile Details"}
                </Button>
              </div>
            </Card>
          </div>
        </form>
      )}

      {/* TAB 2: ALLERGIES & MEDICAL */}
      {activeTab === "allergies" && (
        <div className="space-y-6">
          <Card className="p-6 space-y-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-500" /> Active Allergens Manager
            </h3>

            {/* Add Allergy Form */}
            <form onSubmit={handleAddAllergy} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="sm:col-span-1">
                <Input placeholder="Allergen (e.g. Milk, Peanut)" value={newAllergen} onChange={(e) => setNewAllergen(e.target.value)} required />
              </div>
              <div>
                <select
                  value={newSeverity}
                  onChange={(e) => setNewSeverity(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-300 bg-white px-3 text-xs dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                >
                  <option value="CRITICAL">🔴 CRITICAL (Anaphylaxis)</option>
                  <option value="HIGH">🟧 HIGH (Severe)</option>
                  <option value="MEDIUM">🟨 MEDIUM (Moderate)</option>
                  <option value="LOW">🟩 LOW (Mild)</option>
                </select>
              </div>
              <div className="sm:col-span-1">
                <Input placeholder="Notes / Triggers" value={newNotes} onChange={(e) => setNewNotes(e.target.value)} />
              </div>
              <div>
                <Button type="submit" variant="primary" size="sm" className="w-full h-10 gap-1">
                  <Plus className="h-4 w-4" /> Add Allergen
                </Button>
              </div>
            </form>

            {/* List Allergies */}
            <div className="flex flex-wrap gap-2 pt-2">
              {profileData?.allergies?.length > 0 ? (
                profileData.allergies.map((alg: any) => (
                  <span
                    key={alg.id}
                    className="inline-flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 text-xs font-bold text-rose-400"
                  >
                    <span>⚠️ {alg.allergenName} ({alg.severity})</span>
                    <button onClick={() => handleDeleteAllergy(alg.id)} className="hover:text-rose-600">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))
              ) : (
                <p className="text-xs text-slate-500">No active allergies configured yet.</p>
              )}
            </div>
          </Card>

          {/* Medical Conditions */}
          <Card className="p-6 space-y-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <HeartPulse className="h-4 w-4 text-indigo-500" /> Medical Conditions
            </h3>

            <form onSubmit={handleAddCondition} className="flex gap-3">
              <Input placeholder="Condition (e.g. Celiac Disease, Asthma)" value={newCondition} onChange={(e) => setNewCondition(e.target.value)} className="max-w-md" required />
              <Button type="submit" variant="outline" size="sm" className="gap-1">
                <Plus className="h-4 w-4" /> Add
              </Button>
            </form>

            <div className="flex flex-wrap gap-2 pt-2">
              {profileData?.medicalConditions?.length > 0 ? (
                profileData.medicalConditions.map((cond: any) => (
                  <span
                    key={cond.id}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 px-3 py-1.5 text-xs font-bold text-indigo-400"
                  >
                    <span>🏥 {cond.conditionName}</span>
                    <button onClick={() => handleDeleteCondition(cond.id)} className="hover:text-indigo-600">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))
              ) : (
                <p className="text-xs text-slate-500">No medical conditions configured.</p>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: DIETARY PREFERENCES */}
      {activeTab === "preferences" && (
        <Card className="p-6 space-y-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <Utensils className="h-4 w-4 text-emerald-500" /> Dietary Preferences & Food Rules
          </h3>

          <form onSubmit={handleAddDiet} className="flex gap-3">
            <Input placeholder="Preference (e.g. Vegan, Gluten-Free, Keto)" value={newDiet} onChange={(e) => setNewDiet(e.target.value)} className="max-w-md" required />
            <Button type="submit" variant="outline" size="sm" className="gap-1">
              <Plus className="h-4 w-4" /> Add Preference
            </Button>
          </form>

          <div className="flex flex-wrap gap-2 pt-2">
            {profileData?.dietPreferences?.length > 0 ? (
              profileData.dietPreferences.map((diet: any) => (
                <span
                  key={diet.id}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 text-xs font-bold text-emerald-400"
                >
                  <span>🥗 {diet.preferenceName}</span>
                  <button onClick={() => handleDeleteDiet(diet.id)} className="hover:text-emerald-600">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))
            ) : (
              <p className="text-xs text-slate-500">No dietary preferences configured.</p>
            )}
          </div>
        </Card>
      )}

      {/* TAB 4: EXPORT & SECURITY */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          <Card className="p-6 space-y-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Download className="h-4 w-4 text-brand-500" /> Health Data Export
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Download your complete medical profile, active allergen rules, and scan history in JSON format.
            </p>
            <Button onClick={handleExportData} variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" /> Export Health Profile JSON
            </Button>
          </Card>

          <Card className="p-6 space-y-4 border-rose-500/30 bg-rose-500/5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-rose-500 flex items-center gap-2">
              <Trash2 className="h-4 w-4" /> Danger Zone: Delete Account
            </h3>
            <p className="text-xs text-slate-400">
              Permanently remove your account, scan history, medical ID, and customized AI rules.
            </p>
            <Button onClick={() => setShowDeleteModal(true)} variant="danger" size="sm" className="gap-2">
              <Trash2 className="h-4 w-4" /> Delete AllerScan Account
            </Button>
          </Card>

          {showDeleteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
              <div className="w-full max-w-md rounded-3xl bg-slate-900 p-6 border border-slate-800 space-y-4">
                <h3 className="text-base font-bold text-white">Confirm Account Deletion</h3>
                <p className="text-xs text-slate-400">
                  Please enter your password to confirm permanent account deletion.
                </p>
                <Input type="password" placeholder="Account Password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} required />
                {deleteError && <p className="text-xs text-rose-400 font-bold">{deleteError}</p>}
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" size="sm" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                  <Button variant="danger" size="sm" onClick={handleDeleteAccount}>Confirm Delete</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
