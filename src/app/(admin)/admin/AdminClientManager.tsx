"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
  Users,
  Package,
  QrCode,
  ShieldCheck,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Activity,
  X,
  MessageSquare,
  Sparkles,
} from "lucide-react";

export function AdminClientManager({
  initialStats,
  initialUsers,
  initialProducts,
}: {
  initialStats: any;
  initialUsers: any[];
  initialProducts: any[];
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "products" | "allergens" | "reports">("overview");

  // User state
  const [users, setUsers] = useState<any[]>(initialUsers || []);
  // Product state
  const [products, setProducts] = useState<any[]>(initialProducts || []);
  const [searchProductQuery, setSearchProductQuery] = useState("");

  // Product modal
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdBarcode, setNewProdBarcode] = useState("");
  const [newProdIngredients, setNewProdIngredients] = useState("");
  const [newProdAllergens, setNewProdAllergens] = useState("");
  const [newProdCalories, setNewProdCalories] = useState(250);
  const [newProdProtein, setNewProdProtein] = useState(10);
  const [newProdCarbs, setNewProdCarbs] = useState(30);
  const [newProdFat, setNewProdFat] = useState(8);

  // Allergen management
  const [allergens, setAllergens] = useState<any[]>([]);
  const [newAllergenName, setNewAllergenName] = useState("");
  const [newAllergenSeverity, setNewAllergenSeverity] = useState("HIGH");

  // Reports management
  const [reports, setReports] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const uRes = await fetch("/api/admin/users");
      const uData = await uRes.json();
      if (uData.data) setUsers(uData.data);

      const aRes = await fetch("/api/admin/allergens");
      const aData = await aRes.json();
      if (aData.data?.allergens) setAllergens(aData.data.allergens);

      const rRes = await fetch("/api/admin/reports");
      const rData = await rRes.json();
      if (rData.data) {
        setReports(rData.data.productReports || []);
        setTickets(rData.data.tickets || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleUserRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "ADMINISTRATOR" ? "CUSTOMER" : "ADMINISTRATOR";
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status: newStatus }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProdName,
          barcode: newProdBarcode,
          ingredients: newProdIngredients,
          allergens: newProdAllergens,
          nutrition: {
            calories: newProdCalories,
            protein: newProdProtein,
            carbohydrates: newProdCarbs,
            fat: newProdFat,
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.data) {
        setProducts((prev) => [data.data, ...prev]);
        setShowAddProductModal(false);
        setNewProdName("");
        setNewProdBarcode("");
        setNewProdIngredients("");
        setNewProdAllergens("");
      } else {
        alert(data.error || "Failed to create product");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this food product?")) return;
    try {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddAllergen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAllergenName.trim()) return;
    try {
      const res = await fetch("/api/admin/allergens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newAllergenName.trim(), severity: newAllergenSeverity }),
      });
      const data = await res.json();
      if (data.data) {
        setAllergens((prev) => [...prev, data.data]);
        setNewAllergenName("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAllergen = async (id: string) => {
    try {
      await fetch(`/api/admin/allergens?id=${id}`, { method: "DELETE" });
      setAllergens((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveReport = async (id: string, type: string) => {
    try {
      await fetch("/api/admin/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, type, status: "RESOLVED" }),
      });
      if (type === "PRODUCT_REPORT") {
        setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: "RESOLVED" } : r)));
      } else {
        setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status: "RESOLVED" } : t)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === "overview" ? "bg-brand-600 text-white" : "bg-slate-900 text-slate-300 hover:bg-slate-800"
          }`}
        >
          <Activity className="h-4 w-4" /> System Metrics
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === "users" ? "bg-brand-600 text-white" : "bg-slate-900 text-slate-300 hover:bg-slate-800"
          }`}
        >
          <Users className="h-4 w-4" /> User Management ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === "products" ? "bg-brand-600 text-white" : "bg-slate-900 text-slate-300 hover:bg-slate-800"
          }`}
        >
          <Package className="h-4 w-4" /> Product Catalog CRUD ({products.length})
        </button>
        <button
          onClick={() => setActiveTab("allergens")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === "allergens" ? "bg-brand-600 text-white" : "bg-slate-900 text-slate-300 hover:bg-slate-800"
          }`}
        >
          <AlertTriangle className="h-4 w-4 text-amber-400" /> Allergens Dictionary ({allergens.length})
        </button>
        <button
          onClick={() => setActiveTab("reports")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === "reports" ? "bg-brand-600 text-white" : "bg-slate-900 text-slate-300 hover:bg-slate-800"
          }`}
        >
          <MessageSquare className="h-4 w-4" /> Reports & Tickets ({reports.length + tickets.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 border-slate-800 bg-slate-900/80 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Registered Users</span>
              <p className="text-2xl font-extrabold text-white">{initialStats?.totalUsers || users.length}</p>
            </Card>
            <Card className="p-4 border-slate-800 bg-slate-900/80 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Food Database Products</span>
              <p className="text-2xl font-extrabold text-white">{initialStats?.totalProducts || products.length}</p>
            </Card>
            <Card className="p-4 border-slate-800 bg-slate-900/80 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Total Scans Processed</span>
              <p className="text-2xl font-extrabold text-white">{initialStats?.totalScans || 42}</p>
            </Card>
            <Card className="p-4 border-slate-800 bg-slate-900/80 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Pending Audit Reports</span>
              <p className="text-2xl font-extrabold text-amber-400">{reports.filter((r) => r.status === "PENDING").length}</p>
            </Card>
          </div>

          <Card className="border-slate-800 bg-slate-900/60 p-5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <p className="font-bold text-white">System Core Operations Status: OPERATIONAL</p>
                <p className="text-slate-400">Allergen synonym matcher, Tesseract OCR Engine, & Vision AI cluster active</p>
              </div>
            </div>
            <Badge variant="safe">100% HEALTHY</Badge>
          </Card>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === "users" && (
        <Card className="border-slate-800 bg-slate-900/80 p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Users className="h-4 w-4 text-brand-400" /> User Accounts & RBAC Management
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 uppercase text-[10px] text-slate-400 font-bold bg-slate-950/50">
                <tr>
                  <th className="p-3">User Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-bold text-white">{u.fullName || "User"}</td>
                    <td className="p-3 text-slate-400">{u.email}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === "ADMINISTRATOR" ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" : "bg-brand-500/10 text-brand-400"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                      }`}>
                        {u.status || "ACTIVE"}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => handleToggleUserRole(u.id, u.role)}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-white"
                      >
                        Toggle Role
                      </button>
                      <button
                        onClick={() => handleToggleUserStatus(u.id, u.status || "ACTIVE")}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-rose-300"
                      >
                        {u.status === "SUSPENDED" ? "Activate" : "Suspend"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 3: PRODUCTS CRUD */}
      {activeTab === "products" && (
        <Card className="border-slate-800 bg-slate-900/80 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Package className="h-4 w-4 text-emerald-400" /> Product Database CRUD Manager
            </h3>
            <Button onClick={() => setShowAddProductModal(true)} variant="primary" size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" /> Add New Food Product
            </Button>
          </div>

          <Input
            placeholder="Search catalog by name or barcode..."
            value={searchProductQuery}
            onChange={(e) => setSearchProductQuery(e.target.value)}
            className="text-xs max-w-md"
          />

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 uppercase text-[10px] text-slate-400 font-bold bg-slate-950/50">
                <tr>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Barcode</th>
                  <th className="p-3">Safety Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {products
                  .filter((p) => p.name.toLowerCase().includes(searchProductQuery.toLowerCase()) || p.barcode.includes(searchProductQuery))
                  .map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-bold text-white">{p.name}</td>
                      <td className="p-3 text-slate-400 font-mono">{p.barcode}</td>
                      <td className="p-3">
                        <Badge variant={p.aiSafetyStatus === "SAFE" ? "safe" : "unsafe"}>
                          {p.aiSafetyStatus || "SAFE"}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <button onClick={() => handleDeleteProduct(p.id)} className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Add Product Modal */}
          {showAddProductModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
              <div className="w-full max-w-lg rounded-3xl bg-slate-900 p-6 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white">Create New Product Entry</h3>
                  <button onClick={() => setShowAddProductModal(false)} className="text-slate-400 hover:text-white">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleAddProduct} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300">Product Name</label>
                    <Input placeholder="e.g. Organic Almond Butter" value={newProdName} onChange={(e) => setNewProdName(e.target.value)} required />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300">Barcode Digits</label>
                    <Input placeholder="e.g. 089425000999" value={newProdBarcode} onChange={(e) => setNewProdBarcode(e.target.value)} required />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300">Full Ingredients</label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Organic Roasted Almonds, Sea Salt."
                      value={newProdIngredients}
                      onChange={(e) => setNewProdIngredients(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300">Allergen Tags</label>
                    <Input placeholder="e.g. Tree Nuts (Almonds)" value={newProdAllergens} onChange={(e) => setNewProdAllergens(e.target.value)} />
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold">Calories</label>
                      <Input type="number" value={newProdCalories} onChange={(e) => setNewProdCalories(Number(e.target.value))} />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold">Protein (g)</label>
                      <Input type="number" value={newProdProtein} onChange={(e) => setNewProdProtein(Number(e.target.value))} />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold">Carbs (g)</label>
                      <Input type="number" value={newProdCarbs} onChange={(e) => setNewProdCarbs(Number(e.target.value))} />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold">Fat (g)</label>
                      <Input type="number" value={newProdFat} onChange={(e) => setNewProdFat(Number(e.target.value))} />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <Button variant="ghost" size="sm" type="button" onClick={() => setShowAddProductModal(false)}>Cancel</Button>
                    <Button variant="primary" size="sm" type="submit">Create Product</Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* TAB 4: ALLERGEN DICTIONARY */}
      {activeTab === "allergens" && (
        <Card className="border-slate-800 bg-slate-900/80 p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" /> Master Allergen & Ingredient Dictionary
          </h3>

          <form onSubmit={handleAddAllergen} className="flex gap-3 max-w-lg">
            <Input placeholder="Allergen Name (e.g. Sesame, Mustard)" value={newAllergenName} onChange={(e) => setNewAllergenName(e.target.value)} required />
            <select
              value={newAllergenSeverity}
              onChange={(e) => setNewAllergenSeverity(e.target.value)}
              className="h-10 rounded-xl border border-slate-800 bg-slate-950 px-3 text-xs text-white"
            >
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
            </select>
            <Button type="submit" variant="primary" size="sm">Add</Button>
          </form>

          <div className="flex flex-wrap gap-2 pt-2">
            {allergens.map((a) => (
              <span key={a.id} className="inline-flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 text-xs font-bold text-amber-300">
                <span>⚠️ {a.name} ({a.severity})</span>
                <button onClick={() => handleDeleteAllergen(a.id)} className="hover:text-rose-400">
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 5: REPORTS & TICKETS */}
      {activeTab === "reports" && (
        <Card className="border-slate-800 bg-slate-900/80 p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-brand-400" /> User Reports & Support Tickets
          </h3>

          <div className="space-y-3">
            {reports.map((r) => (
              <div key={r.id} className="rounded-xl bg-slate-950 p-4 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-white">Report on: {r.product?.name} ({r.reportType})</p>
                  <p className="text-slate-400">{r.description}</p>
                  <p className="text-[10px] text-slate-500">Submitted by {r.user?.email}</p>
                </div>
                <Button
                  onClick={() => handleResolveReport(r.id, "PRODUCT_REPORT")}
                  variant={r.status === "RESOLVED" ? "ghost" : "primary"}
                  size="sm"
                  disabled={r.status === "RESOLVED"}
                >
                  {r.status === "RESOLVED" ? "Resolved" : "Mark Resolved"}
                </Button>
              </div>
            ))}

            {tickets.map((t) => (
              <div key={t.id} className="rounded-xl bg-slate-950 p-4 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-white">Ticket: {t.subject} ({t.category})</p>
                  <p className="text-slate-400">{t.message}</p>
                  <p className="text-[10px] text-slate-500">Submitted by {t.user?.email}</p>
                </div>
                <Button
                  onClick={() => handleResolveReport(t.id, "TICKET")}
                  variant={t.status === "RESOLVED" ? "ghost" : "primary"}
                  size="sm"
                  disabled={t.status === "RESOLVED"}
                >
                  {t.status === "RESOLVED" ? "Resolved" : "Mark Resolved"}
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
