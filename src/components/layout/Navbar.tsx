"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, Bell, User, LogOut, ShieldAlert, LayoutDashboard, Sun, Moon, Check, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Navbar({ user }: { user?: any }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    // Theme initialization
    if (typeof document !== "undefined") {
      const isDark = document.documentElement.classList.contains("dark");
      setIsDarkMode(isDark);
    }

    // Fetch notifications if user logged in
    if (user) {
      fetch("/api/notifications")
        .then((res) => res.json())
        .then((data) => {
          if (data.data) setNotifications(data.data);
        })
        .catch(() => {});
    }
  }, [user]);

  const toggleTheme = () => {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      if (root.classList.contains("dark")) {
        root.classList.remove("dark");
        setIsDarkMode(false);
      } else {
        root.classList.add("dark");
        setIsDarkMode(true);
      }
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const markAllNotificationsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              Aller<span className="text-brand-600 dark:text-brand-400">Scan</span>
            </span>
            <span className="ml-1.5 rounded-full bg-brand-500/10 px-2 py-0.5 text-[10px] font-semibold text-brand-600 dark:text-brand-400">
              AI Health
            </span>
          </div>
        </Link>

        {/* Right Action Bar */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            title="Toggle theme"
          >
            {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-600" />}
          </button>

          {/* ICE Emergency Button */}
          <Link href="/emergency">
            <Button variant="danger" size="sm" className="hidden sm:inline-flex gap-1.5 shadow-rose-600/20">
              <ShieldAlert className="h-4 w-4" />
              <span>ICE Emergency</span>
            </Button>
          </Link>

          {/* Notifications Drawer Toggle */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-extrabold text-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl backdrop-blur-2xl dark:border-slate-800 dark:bg-slate-900 z-50">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 px-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Bell className="h-3.5 w-3.5 text-brand-400" />
                      <span>Notifications ({notifications.length})</span>
                    </h4>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-[11px] font-semibold text-brand-500 hover:underline flex items-center gap-1"
                      >
                        <Check className="h-3 w-3" /> Mark Read
                      </button>
                    )}
                  </div>

                  <div className="mt-2 max-h-64 overflow-y-auto space-y-2 pr-1">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`rounded-xl p-3 text-xs border ${
                            !n.isRead
                              ? "bg-brand-500/10 border-brand-500/30 text-slate-100"
                              : "bg-slate-950/50 border-slate-800/60 text-slate-400"
                          }`}
                        >
                          <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                            {n.title}
                          </p>
                          <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                            {n.message}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="py-4 text-center text-xs text-slate-500">No new notifications</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Profile Avatar Dropdown */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 p-1.5 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white shadow-sm">
                  {user.fullName ? user.fullName[0].toUpperCase() : "U"}
                </div>
                <span className="hidden md:inline text-xs font-semibold text-slate-700 dark:text-slate-200 max-w-[100px] truncate">
                  {user.fullName}
                </span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl backdrop-blur-2xl dark:border-slate-800 dark:bg-slate-900 z-50">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{user.fullName}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                    <span className="inline-block mt-1 rounded-full bg-brand-500/10 px-2 py-0.5 text-[10px] font-bold text-brand-400 border border-brand-500/20">
                      Role: {user.role}
                    </span>
                  </div>
                  <div className="py-1 space-y-0.5">
                    <Link
                      href="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      <LayoutDashboard className="h-4 w-4 text-brand-500" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      <User className="h-4 w-4 text-slate-400" />
                      <span>Profile & Allergies</span>
                    </Link>

                    {user.role === "ADMINISTRATOR" && (
                      <Link
                        href="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-indigo-400 hover:bg-indigo-500/10"
                      >
                        <ShieldCheck className="h-4 w-4 text-indigo-400" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
