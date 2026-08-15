import React from "react";
import Link from "next/link";

export const dynamic = "force-dynamic";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Heart, QrCode } from "lucide-react";

export default async function FavoritesPage() {
  const user = await getCurrentUser();

  const safeProducts = await prisma.product.findMany({
    where: { aiSafetyStatus: "SAFE" },
    take: 6,
    include: { brand: true },
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 pb-20 lg:pb-0">
      <Navbar user={user} />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <Heart className="h-7 w-7 text-rose-500 fill-rose-500" />
              <span>Saved Safe Favorites</span>
            </h1>
            <p className="text-xs text-slate-400">
              Verified safe products bookmarked for quick grocery shopping & reference.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {safeProducts.map((prod) => (
              <Link key={prod.id} href={`/products/${prod.id}`}>
                <Card className="border-slate-800 bg-slate-900/80 p-4 space-y-3 hover:border-brand-500/50 transition-all group">
                  <div className="relative h-36 w-full overflow-hidden rounded-xl bg-slate-800">
                    <img
                      src={prod.image || "https://images.unsplash.com/photo-1563636619-e9143da7973b"}
                      alt={prod.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant="safe">SAFE</Badge>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-brand-400 uppercase">{prod.brand?.name || "Verified Safe"}</p>
                    <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-brand-300">{prod.name}</h4>
                    <p className="text-[10px] text-slate-400">Barcode: {prod.barcode}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
