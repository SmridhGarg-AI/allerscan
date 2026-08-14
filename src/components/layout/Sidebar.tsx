"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  QrCode,
  FileText,
  Eye,
  Search,
  History,
  Heart,
  Bot,
  ShieldAlert,
  HelpCircle,
  User,
  Settings,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Barcode Scanner", href: "/scanner", icon: QrCode },
  { name: "OCR Label Scanner", href: "/ocr", icon: FileText },
  { name: "Vision AI Scanner", href: "/vision", icon: Eye },
  { name: "Food Database", href: "/products", icon: Search },
  { name: "AI Health Chat", href: "/chat", icon: Bot },
  { name: "Scan History", href: "/history", icon: History },
  { name: "Favorites", href: "/favorites", icon: Heart },
  { name: "ICE Emergency", href: "/emergency", icon: ShieldAlert, danger: true },
  { name: "Help Center", href: "/help", icon: HelpCircle },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-slate-200/80 bg-white/60 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/60 p-4 space-y-6 shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="space-y-1">
        <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Core Features
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all",
                isActive
                  ? "bg-brand-600 text-white shadow-md shadow-brand-600/20 dark:bg-brand-500"
                  : item.danger
                  ? "text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : item.danger ? "text-rose-500" : "text-slate-500 dark:text-slate-400")} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
