import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Card } from "@/components/ui/Card";
import { HelpCircle, BookOpen, MessageSquare, ShieldAlert } from "lucide-react";

export default function HelpPage() {
  const faqs = [
    {
      q: "How does AllerScan detect hidden allergens?",
      a: "AllerScan uses a multi-provider AI engine that maps hidden protein derivatives (such as casein, whey, or lactoglobulin for milk, or semolina for wheat) to your configured allergy profile rather than relying solely on exact text matches.",
    },
    {
      q: "What should I do if a product is flagged as UNSAFE?",
      a: "Do not consume the product. Check the flagged ingredients in the AllerScan analysis breakdown and refer to the suggested safe alternative foods.",
    },
    {
      q: "How does ICE Emergency Mode work?",
      a: "The Emergency tab provides instant access to your Medical ID, active critical allergens, primary doctor details, and a one-touch Emergency Call button for first responders.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 pb-20 lg:pb-0">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <HelpCircle className="h-7 w-7 text-brand-400" />
              <span>Help Center & Support</span>
            </h1>
            <p className="text-xs text-slate-400">
              Frequently asked questions, system usage guides, and customer support.
            </p>
          </div>

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
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
