import React from "react";
import { AlertTriangle, ShieldCheck } from "lucide-react";

export function MedicalDisclaimer({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 p-2.5 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-xl">
        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
        <span>
          <strong>Medical Notice:</strong> AI analysis is for informational safety guidance only. Not a substitute for professional medical advice or EpiPen prescription.
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 dark:bg-amber-950/30 dark:border-amber-900/50">
      <div className="flex gap-3">
        <ShieldCheck className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs leading-relaxed text-amber-900 dark:text-amber-200">
          <h4 className="font-semibold text-amber-800 dark:text-amber-300">
            Official AllerScan Medical Disclaimer
          </h4>
          <p>
            AllerScan provides AI-assisted food label ingredient analysis to help users make informed decisions. This analysis is not a substitute for professional medical advice, clinical diagnosis, or treatment. Always read physical product packaging labels and consult your physician or allergist regarding severe allergies and medical management.
          </p>
        </div>
      </div>
    </div>
  );
}
