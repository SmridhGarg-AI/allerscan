"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { MedicalDisclaimer } from "@/components/ui/MedicalDisclaimer";
import { Bot, Send, User, Sparkles, AlertCircle } from "lucide-react";

export default function ChatPage() {
  const [messages, setMessages] = useState<Array<{ sender: "USER" | "ASSISTANT"; text: string }>>([
    {
      sender: "ASSISTANT",
      text: "Hello! I am your AllerScan AI Health Assistant. I analyze food products, ingredients, and nutrition against your active allergy profile. How can I help you today?",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim()) return;

    const userMsg = { sender: "USER" as const, text: query };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage("");

    setIsSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });

      const data = await res.json();
      if (res.ok && data.data) {
        setMessages((prev) => [...prev, { sender: "ASSISTANT", text: data.data.reply }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const suggestedPrompts = [
    "Is almond milk safe for milk allergies?",
    "Explain difference between lactose intolerance & milk allergy",
    "What ingredients mean hidden wheat or gluten?",
    "Suggest high protein peanut-free snacks",
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 pb-20 lg:pb-0">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-4 max-w-4xl mx-auto flex flex-col min-h-[calc(100vh-4rem)]">
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <Bot className="h-7 w-7 text-brand-400" />
              <span>AI Health Assistant Chat</span>
            </h1>
            <p className="text-xs text-slate-400">
              Conversational advisor aware of your profile, allergies, and scan history.
            </p>
          </div>

          <MedicalDisclaimer compact />

          {/* Chat Stream Window */}
          <Card className="flex-1 border-slate-800 bg-slate-900/80 p-4 space-y-4 overflow-y-auto max-h-[500px]">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.sender === "USER" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "ASSISTANT" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={`rounded-2xl p-3.5 text-xs leading-relaxed max-w-[80%] ${
                    msg.sender === "USER"
                      ? "bg-brand-600 text-white rounded-tr-none"
                      : "bg-slate-950 text-slate-200 border border-slate-800 rounded-tl-none"
                  }`}
                >
                  {msg.text}
                </div>
                {msg.sender === "USER" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-300">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
          </Card>

          {/* Suggested Prompts */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {suggestedPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                className="rounded-full bg-slate-900 border border-slate-800 px-3 py-1 text-[11px] font-medium text-slate-400 hover:text-brand-300 hover:border-brand-500/40 transition-colors"
              >
                💡 {prompt}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-2"
          >
            <Input
              placeholder="Ask AI about ingredients, food safety, or dairy-free options..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="text-xs h-12"
            />
            <Button type="submit" variant="primary" className="h-12 px-5" isLoading={isSending}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
