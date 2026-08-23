"use client";

import React, { useState, useEffect } from "react";
import { WifiOff, Wifi } from "lucide-react";

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 3000);
    };

    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);
      window.addEventListener("offline", handleOffline);
      window.addEventListener("online", handleOnline);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("offline", handleOffline);
        window.removeEventListener("online", handleOnline);
      }
    };
  }, []);

  if (!isOffline && !showReconnected) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-50 px-4 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        {isOffline ? (
          <div className="flex items-center justify-between rounded-xl bg-amber-500/90 text-slate-950 px-4 py-2.5 shadow-xl backdrop-blur-md border border-amber-400 text-xs font-bold animate-bounce">
            <div className="flex items-center gap-2">
              <WifiOff className="h-4 w-4 shrink-0" />
              <span>Offline Mode Active — Viewing cached health profile & scan logs</span>
            </div>
          </div>
        ) : showReconnected ? (
          <div className="flex items-center justify-between rounded-xl bg-emerald-500/90 text-slate-950 px-4 py-2.5 shadow-xl backdrop-blur-md border border-emerald-400 text-xs font-bold">
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 shrink-0" />
              <span>Back Online! Syncing scan results...</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
