"use client";

import React, { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { MedicalDisclaimer } from "@/components/ui/MedicalDisclaimer";
import { OfflineIndicator } from "@/components/ui/OfflineIndicator";
import {
  Bot,
  Send,
  User,
  Sparkles,
  Copy,
  Check,
  Share2,
  Pin,
  Trash2,
  Edit2,
  Square,
  Search,
  MessageSquare,
  Plus,
} from "lucide-react";

export default function ChatPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{ sender: "USER" | "ASSISTANT"; text: string }>>([
    {
      sender: "ASSISTANT",
      text: "Hello! I am your AllerScan AI Health Assistant. I analyze food products, ingredients, and nutrition against your active allergy profile. How can I help you today?",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [searchConvQuery, setSearchConvQuery] = useState("");
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Load conversations
  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/chat/conversations");
      const data = await res.json();
      if (data.data) {
        setConversations(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

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
        body: JSON.stringify({ message: query, conversationId: activeConvId }),
      });

      const data = await res.json();
      if (res.ok && data.data) {
        setMessages((prev) => [...prev, { sender: "ASSISTANT", text: data.data.reply }]);
        if (data.data.conversationId && !activeConvId) {
          setActiveConvId(data.data.conversationId);
          fetchConversations();
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handlePinConv = async (id: string, currentPinStatus: boolean) => {
    try {
      await fetch("/api/chat/conversations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isPinned: !currentPinStatus }),
      });
      fetchConversations();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteConv = async (id: string) => {
    try {
      await fetch(`/api/chat/conversations?id=${id}`, { method: "DELETE" });
      if (activeConvId === id) {
        setActiveConvId(null);
        setMessages([
          {
            sender: "ASSISTANT",
            text: "Hello! I am your AllerScan AI Health Assistant. I analyze food products, ingredients, and nutrition against your active allergy profile. How can I help you today?",
          },
        ]);
      }
      fetchConversations();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectConv = (conv: any) => {
    setActiveConvId(conv.id);
    if (conv.messages && conv.messages.length > 0) {
      setMessages(conv.messages.map((m: any) => ({ sender: m.sender, text: m.text })));
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
      <OfflineIndicator />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-4 max-w-6xl mx-auto flex flex-col min-h-[calc(100vh-4rem)]">
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <Bot className="h-7 w-7 text-brand-400" />
              <span>AI Health Assistant & Clinical Chat</span>
            </h1>
            <p className="text-xs text-slate-400">
              Conversational advisor aware of your profile, active allergies, and scan history.
            </p>
          </div>

          <MedicalDisclaimer compact />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
            {/* Conversation Sidebar */}
            <Card className="hidden md:flex md:col-span-1 border-slate-800 bg-slate-900/80 p-3 flex-col space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Chats</h4>
                <button
                  onClick={() => {
                    setActiveConvId(null);
                    setMessages([
                      {
                        sender: "ASSISTANT",
                        text: "Hello! I am your AllerScan AI Health Assistant. How can I help you today?",
                      },
                    ]);
                  }}
                  className="flex items-center gap-1 text-[11px] font-bold text-brand-400 hover:underline"
                >
                  <Plus className="h-3.5 w-3.5" /> New
                </button>
              </div>

              <Input
                placeholder="Search history..."
                value={searchConvQuery}
                onChange={(e) => setSearchConvQuery(e.target.value)}
                className="text-xs h-8"
              />

              <div className="flex-1 space-y-1 overflow-y-auto max-h-[380px] pr-1">
                {conversations
                  .filter((c) => c.title.toLowerCase().includes(searchConvQuery.toLowerCase()))
                  .map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => handleSelectConv(conv)}
                      className={`group flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-colors ${
                        activeConvId === conv.id
                          ? "bg-brand-600 text-white font-bold"
                          : "bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{conv.title}</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePinConv(conv.id, conv.isPinned);
                          }}
                          className="hover:text-amber-400"
                        >
                          <Pin className={`h-3 w-3 ${conv.isPinned ? "text-amber-400 opacity-100" : ""}`} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteConv(conv.id);
                          }}
                          className="hover:text-rose-400"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </Card>

            {/* Main Chat Stream Window */}
            <div className="md:col-span-3 flex flex-col space-y-3">
              <Card className="flex-1 border-slate-800 bg-slate-900/80 p-4 space-y-4 overflow-y-auto max-h-[480px]">
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
                      className={`relative group rounded-2xl p-3.5 text-xs leading-relaxed max-w-[85%] ${
                        msg.sender === "USER"
                          ? "bg-brand-600 text-white rounded-tr-none"
                          : "bg-slate-950 text-slate-200 border border-slate-800 rounded-tl-none"
                      }`}
                    >
                      <p>{msg.text}</p>

                      {/* Action buttons for assistant messages */}
                      {msg.sender === "ASSISTANT" && (
                        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center gap-2 text-[10px] text-slate-400">
                          <button
                            onClick={() => handleCopyText(msg.text, idx)}
                            className="hover:text-white flex items-center gap-1"
                          >
                            {copiedIdx === idx ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                            <span>{copiedIdx === idx ? "Copied" : "Copy"}</span>
                          </button>
                          <button
                            onClick={() => {
                              if (navigator.share) {
                                navigator.share({ title: "AllerScan Advice", text: msg.text });
                              }
                            }}
                            className="hover:text-white flex items-center gap-1"
                          >
                            <Share2 className="h-3 w-3" /> Share
                          </button>
                        </div>
                      )}
                    </div>
                    {msg.sender === "USER" && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-300">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))}

                {isSending && (
                  <div className="flex items-center gap-2 text-xs text-brand-400 italic">
                    <Sparkles className="h-4 w-4 animate-spin" />
                    <span>AllerScan AI is formulating response...</span>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </Card>

              {/* Suggested Prompts */}
              <div className="flex flex-wrap gap-1.5">
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
            </div>
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
