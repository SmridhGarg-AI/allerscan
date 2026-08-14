"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Search, Filter, ChevronRight, QrCode } from "lucide-react";

export default function ProductSearchPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const url = new URL("/api/products/search", window.location.origin);
      if (query) url.searchParams.set("q", query);
      if (category) url.searchParams.set("category", category);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.data) {
        setProducts(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [query, category]);

  const categories = [
    { name: "All Foods", value: "" },
    { name: "🥛 Dairy & Eggs", value: "Dairy" },
    { name: "🍫 Snacks", value: "Snacks" },
    { name: "🍞 Bakery", value: "Bakery" },
    { name: "🥤 Beverages", value: "Beverages" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 pb-20 lg:pb-0">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <Search className="h-7 w-7 text-brand-400" />
              <span>Global Food Product Database</span>
            </h1>
            <p className="text-xs text-slate-400">
              Search verified product barcodes, ingredients, nutrition facts, and safety certifications.
            </p>
          </div>

          {/* Search Bar & Category Filter Bar */}
          <div className="space-y-3">
            <Input
              placeholder="Search products by name, brand, barcode, or ingredient (e.g. Silk, Almond, Quaker)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              leftIcon={<Search className="h-4 w-4 text-slate-400" />}
              className="text-sm h-12"
            />

            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    category === cat.value
                      ? "bg-brand-600 text-white border-brand-500 shadow-md shadow-brand-600/20"
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-64 rounded-2xl bg-slate-900/50 animate-pulse border border-slate-800" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {products.map((prod) => (
                <Link key={prod.id} href={`/products/${prod.id}`}>
                  <Card className="border-slate-800 bg-slate-900/80 p-4 space-y-3 hover:border-brand-500/50 transition-all group">
                    <div className="relative h-40 w-full overflow-hidden rounded-xl bg-slate-800">
                      <img
                        src={prod.image || "https://images.unsplash.com/photo-1563636619-e9143da7973b"}
                        alt={prod.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge variant={prod.aiSafetyStatus === "SAFE" ? "safe" : "unsafe"}>
                          {prod.aiSafetyStatus}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[11px] font-bold text-brand-400 uppercase">{prod.brand?.name || "Verified Brand"}</p>
                      <h4 className="text-sm font-bold text-white line-clamp-1 group-hover:text-brand-300">{prod.name}</h4>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        <QrCode className="h-3 w-3" />
                        <span>Barcode: {prod.barcode}</span>
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center border-slate-800 bg-slate-900/40 space-y-2">
              <Search className="h-10 w-10 text-slate-500 mx-auto" />
              <p className="text-sm font-bold text-white">No products found matching search query</p>
              <p className="text-xs text-slate-400">Try searching for "Silk", "Quaker", "Amy's", or "Chocolate"</p>
            </Card>
          )}
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
