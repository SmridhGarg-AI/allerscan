"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  User,
  AlertTriangle,
  HeartPulse,
  Utensils,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Plus,
  X,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";

const DEFAULT_ALLERGENS = [
  "Milk",
  "Peanuts",
  "Tree Nuts",
  "Eggs",
  "Soy",
  "Wheat",
  "Gluten",
  "Shellfish",
  "Fish",
  "Sesame",
  "Mustard",
  "Celery",
  "Sulphites",
  "Molluscs",
];

const DEFAULT_CONDITIONS = [
  "Lactose Intolerance",
  "Celiac Disease",
  "Diabetes",
  "IBS",
  "High Blood Pressure",
  "Heart Disease",
];

const DEFAULT_DIETS = [
  "Gluten-Free",
  "Dairy-Free",
  "Vegan",
  "Vegetarian",
  "Jain",
  "Halal",
  "Kosher",
  "Low Sugar",
  "Keto",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [age, setAge] = useState("28");
  const [country, setCountry] = useState("United States");
  const [language, setLanguage] = useState("English");
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(["Milk", "Peanuts"]);
  const [customAllergyInput, setCustomAllergyInput] = useState("");
  const [selectedConditions, setSelectedConditions] = useState<string[]>(["Lactose Intolerance"]);
  const [selectedDiets, setSelectedDiets] = useState<string[]>(["Dairy-Free", "Gluten-Free"]);

  const toggleItem = (list: string[], setList: (val: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleAddCustomAllergy = () => {
    if (customAllergyInput.trim() && !selectedAllergies.includes(customAllergyInput.trim())) {
      setSelectedAllergies([...selectedAllergies, customAllergyInput.trim()]);
      setCustomAllergyInput("");
    }
  };

  const handleSaveOnboarding = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age,
          country,
          preferredLanguage: language,
          allergies: selectedAllergies,
          medicalConditions: selectedConditions,
          dietPreferences: selectedDiets,
        }),
      });

      if (!res.ok) throw new Error("Failed to save profile");
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Failed to save profile. Proceeding to dashboard...");
      router.push("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 md:p-10 flex flex-col justify-center items-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-900/20 via-slate-950 to-slate-950 pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10 space-y-6">
        {/* Progress Bar Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span className="flex items-center gap-1.5 text-brand-400">
              <Sparkles className="h-4 w-4" />
              AllerScan Personalization Wizard
            </span>
            <span>Step {step} of 5</span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        <Card className="border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl">
          {/* STEP 1: WELCOME */}
          {step === 1 && (
            <div className="p-6 sm:p-8 space-y-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
                <ShieldCheck className="h-8 w-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Welcome to AllerScan! 👋</h2>
                <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                  Let's customize your AI allergy profile so AllerScan can evaluate foods, scan ingredient labels, and calculate real-time safety risk scores for you.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-left">
                {[
                  { title: "Multimodal AI", desc: "Barcode, OCR label & meal vision detection." },
                  { title: "Hidden Allergens", desc: "Recognizes protein derivatives & synonyms." },
                  { title: "ICE Emergency", desc: "Instant medical ID & emergency action card." },
                ].map((item, i) => (
                  <div key={i} className="rounded-xl border border-slate-800 bg-slate-950/50 p-3 space-y-1">
                    <p className="text-xs font-bold text-brand-300">{item.title}</p>
                    <p className="text-[11px] text-slate-400">{item.desc}</p>
                  </div>
                ))}
              </div>

              <Button size="lg" className="w-full" onClick={() => setStep(2)}>
                <span>Begin Personalization</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {/* STEP 2: PERSONAL DATA */}
          {step === 2 && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <User className="h-5 w-5 text-brand-400" />
                  <span>Personal Details</span>
                </h2>
                <p className="text-xs text-slate-400">Help us localize nutrition guidelines and safety parameters.</p>
              </div>

              <div className="space-y-4">
                <Input
                  label="Your Age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="28"
                />

                <Input
                  label="Country"
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="United States"
                />

                <Input
                  label="Preferred Language"
                  type="text"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  placeholder="English"
                />
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-800">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={() => setStep(3)}>
                  Next: Allergy Profile
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: ALLERGY SELECTOR */}
          {step === 3 && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                  <span>Select Your Allergies</span>
                </h2>
                <p className="text-xs text-slate-400">Select all allergens that trigger an immune reaction or sensitivity for you.</p>
              </div>

              <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-1">
                {DEFAULT_ALLERGENS.map((allergen) => {
                  const isSelected = selectedAllergies.includes(allergen);
                  return (
                    <button
                      key={allergen}
                      type="button"
                      onClick={() => toggleItem(selectedAllergies, setSelectedAllergies, allergen)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-md shadow-rose-500/10"
                          : "bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-rose-400" />}
                      <span>{allergen}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Allergy Adder */}
              <div className="flex gap-2 pt-2">
                <Input
                  placeholder="Add custom allergy (e.g. Yeast, Chocolate)"
                  value={customAllergyInput}
                  onChange={(e) => setCustomAllergyInput(e.target.value)}
                  className="text-xs"
                />
                <Button variant="secondary" size="md" onClick={handleAddCustomAllergy}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-800">
                <Button variant="ghost" onClick={() => setStep(2)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={() => setStep(4)}>
                  Next: Medical Conditions
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: MEDICAL CONDITIONS & DIET */}
          {step === 4 && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <HeartPulse className="h-5 w-5 text-emerald-400" />
                  <span>Medical Conditions & Dietary Preferences</span>
                </h2>
                <p className="text-xs text-slate-400">Specify health requirements for tailor-made AI ingredient recommendations.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Medical Conditions</label>
                  <div className="flex flex-wrap gap-2">
                    {DEFAULT_CONDITIONS.map((cond) => {
                      const isSelected = selectedConditions.includes(cond);
                      return (
                        <button
                          key={cond}
                          type="button"
                          onClick={() => toggleItem(selectedConditions, setSelectedConditions, cond)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            isSelected
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                              : "bg-slate-950/60 text-slate-400 border-slate-800"
                          }`}
                        >
                          {cond}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Dietary Preferences</label>
                  <div className="flex flex-wrap gap-2">
                    {DEFAULT_DIETS.map((diet) => {
                      const isSelected = selectedDiets.includes(diet);
                      return (
                        <button
                          key={diet}
                          type="button"
                          onClick={() => toggleItem(selectedDiets, setSelectedDiets, diet)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            isSelected
                              ? "bg-brand-500/20 text-brand-300 border-brand-500/50"
                              : "bg-slate-950/60 text-slate-400 border-slate-800"
                          }`}
                        >
                          {diet}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-800">
                <Button variant="ghost" onClick={() => setStep(3)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={() => setStep(5)}>
                  Review & Finalize
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW & SAVE */}
          {step === 5 && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-white">Review Your Safety Profile</h2>
                <p className="text-xs text-slate-400">Confirm your preferences before activating AllerScan AI analysis.</p>
              </div>

              <div className="space-y-3 rounded-2xl bg-slate-950/60 border border-slate-800 p-4 text-xs">
                <div>
                  <p className="text-slate-500 font-semibold">Active Allergens ({selectedAllergies.length}):</p>
                  <p className="text-rose-400 font-bold mt-1">
                    {selectedAllergies.length > 0 ? selectedAllergies.join(", ") : "None Selected"}
                  </p>
                </div>
                <div className="border-t border-slate-800 pt-2">
                  <p className="text-slate-500 font-semibold">Medical Conditions:</p>
                  <p className="text-emerald-400 font-bold mt-1">
                    {selectedConditions.length > 0 ? selectedConditions.join(", ") : "None Selected"}
                  </p>
                </div>
                <div className="border-t border-slate-800 pt-2">
                  <p className="text-slate-500 font-semibold">Dietary Rules:</p>
                  <p className="text-brand-400 font-bold mt-1">
                    {selectedDiets.length > 0 ? selectedDiets.join(", ") : "None Selected"}
                  </p>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-800">
                <Button variant="ghost" onClick={() => setStep(4)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
                <Button variant="mint" size="lg" onClick={handleSaveOnboarding} isLoading={isLoading}>
                  <span>Save & Go to Dashboard</span>
                  <CheckCircle2 className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
