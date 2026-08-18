"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Mail, Lock, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("demo@allerscan.com");
  const [password, setPassword] = useState("DemoUser123!");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (!data.data.user.onboardingCompleted) {
        router.push("/onboarding");
      } else if (data.data.user.role === "ADMINISTRATOR") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-900/20 via-slate-950 to-slate-950 pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-500/30">
              <Shield className="h-7 w-7" />
            </div>
          </Link>
          <h1 className="text-2xl font-extrabold text-white">Welcome to AllerScan</h1>
          <p className="text-xs text-slate-400">Sign in to your AI Health Safety Portal</p>
        </div>

        <Card className="border-slate-800 bg-slate-900/80 shadow-2xl backdrop-blur-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg">Account Login</CardTitle>
            <CardDescription className="text-xs">
              Enter your registered credentials to access your profile.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Input
                label="Email Address"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="h-4 w-4" />}
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="h-4 w-4" />}
                required
              />

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-800 text-brand-500 focus:ring-brand-500" />
                  <span>Remember me</span>
                </label>
                <Link href="#" className="font-semibold text-brand-400 hover:underline">
                  Forgot Password?
                </Link>
              </div>
            </CardContent>

            <CardFooter className="flex-col space-y-4 pt-2">
              <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <div className="text-center text-xs text-slate-400">
                Don't have an account?{" "}
                <Link href="/register" className="font-bold text-brand-400 hover:underline">
                  Create Account
                </Link>
              </div>

              {/* Quick Login Info */}
              <div className="w-full rounded-xl bg-slate-800/50 p-3 text-[11px] text-slate-400 space-y-1 border border-slate-700/50">
                <p className="font-bold text-slate-300">Default Login Account:</p>
                <p>👤 Account: <code className="text-brand-300">demo@allerscan.com</code> / <code className="text-brand-300">DemoUser123!</code></p>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
