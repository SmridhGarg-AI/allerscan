import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { History, QrCode, Calendar, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function HistoryPage() {
  const user = await getCurrentUser();

  let scanHistories: any[] = [];
  if (user) {
    scanHistories = await prisma.scanHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { product: true },
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 pb-20 lg:pb-0">
      <Navbar user={user} />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <History className="h-7 w-7 text-brand-400" />
              <span>Scan History Log</span>
            </h1>
            <p className="text-xs text-slate-400">
              Complete history of your barcode scans, OCR label extractions, and Vision AI meal analyses.
            </p>
          </div>

          {scanHistories.length > 0 ? (
            <div className="space-y-3">
              {scanHistories.map((scan) => (
                <Card key={scan.id} className="border-slate-800 bg-slate-900/80 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400">
                      <QrCode className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{scan.product?.name || `Barcode: ${scan.barcode}`}</h4>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(scan.createdAt)}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant={scan.safetyStatus === "SAFE" ? "safe" : "unsafe"}>
                      {scan.safetyStatus}
                    </Badge>
                    {scan.product?.id && (
                      <Link href={`/products/${scan.product.id}`} className="text-slate-400 hover:text-white">
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center border-slate-800 bg-slate-900/40 space-y-2">
              <History className="h-10 w-10 text-slate-500 mx-auto" />
              <p className="text-sm font-bold text-white">No scans recorded yet</p>
              <p className="text-xs text-slate-400">Use the Barcode Camera or OCR Label Scanner to analyze products.</p>
            </Card>
          )}
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
