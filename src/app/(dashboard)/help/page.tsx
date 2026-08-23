"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { OfflineIndicator } from "@/components/ui/OfflineIndicator";
import { HelpCircle, BookOpen, MessageSquare, ShieldAlert, Send, CheckCircle2, Bot } from "lucide-react";
import Link from "next/link";

export default function HelpPage() {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, category, message, type: "TICKET" }),
      });

      if (res.ok) {
        setSubmittedSuccess(true);
        setSubject("");
        setMessage("");
        setTimeout(() => setSubmittedSuccess(false), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqs = [
    {
      q: "How does AllerScan detect hidden allergens?",
      a: "AllerScan uses a multi-provider AI engine that maps hidden protein derivatives (such as casein, whey, or lactoglobulin for milk, or semolina for wheat, plus INS/E-numbers) to your configured allergy profile rather than relying solely on exact text matches.",
    },
    {
      q: "What should I do if a product is flagged as UNSAFE?",
      a: "Do not consume the product. Check the flagged ingredients in the AllerScan analysis breakdown and refer to the suggested safe alternative foods.",
    },
    {
      q: "How does ICE Emergency Mode work?",
      a: "The Emergency tab provides instant access to your Medical ID, active critical allergens, primary doctor details, a scannable QR Medical Card, and a one-touch Emergency Call button for first responders.",
    },
    {
      q: "Can I use AllerScan offline?",
      a: "Yes! AllerScan automatically caches your active health profile and recent scan logs in memory so critical safety rules remain available even without cellular connection.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 pb-20 lg:pb-0">
      <Navbar />
      <OfflineIndicator />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
                <HelpCircle className="h-7 w-7 text-brand-400" />
                <span>Help Center & Support Desk</span>
              </h1>
              <p className="text-xs text-slate-400">
                Frequently asked questions, clinical guides, and direct customer support ticket submission.
              </p>
            </div>

            <Link href="/chat">
              <Button variant="primary" size="sm" className="gap-1.5">
                <Bot className="h-4 w-4" />
                <span>Chat with AI Support</span>
              </Button>
            </Link>
          </div>

          {/* FAQs Grid */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {faqs.map((item, idx) => (
                <Card key={idx} className="border-slate-800 bg-slate-900/80 p-5 space-y-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-brand-400" />
                    <span>{item.q}</span>
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed pl-6">{item.a}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* Contact Support Ticket Form */}
          <Card className="border-slate-800 bg-slate-900/80 p-6 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-emerald-400" />
              <span>Submit Support Ticket or Feedback</span>
            </h2>

            {submittedSuccess && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>Support ticket submitted successfully! Our team will respond shortly.</span>
              </div>
            )}

            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300">Ticket Subject</label>
                  <Input
                    placeholder="e.g. Issue with OCR scanner"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-10 mt-1 rounded-xl border border-slate-800 bg-slate-950 px-3 text-xs text-white"
                  >
                    <option value="GENERAL">General Support</option>
                    <option value="ALLERGY_ENGINE">Allergy Risk Engine</option>
                    <option value="PRODUCT_DATABASE">Product Data Correction</option>
                    <option value="BUG_REPORT">Bug Report</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300">Message / Details</label>
                <textarea
                  rows={4}
                  placeholder="Describe your question or issue in detail..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 mt-1"
                  required
                />
              </div>

              <Button type="submit" variant="primary" size="md" isLoading={isSubmitting} disabled={!subject.trim() || !message.trim()}>
                <Send className="h-4 w-4 mr-2" /> Submit Support Ticket
              </Button>
            </form>
          </Card>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
