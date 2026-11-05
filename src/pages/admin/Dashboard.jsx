import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import { getAssetUrl } from "../../api/axios";
import { updateProductStock } from "../../api/products";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Restocking action state
  const [restockingId, setRestockingId] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  async function loadDashboardData() {
    setLoading(true);
    setError("");
    try {
      const [prodsRes, catsRes, ordersRes] = await Promise.allSettled([
        api.get("/products/"),
        api.get("/categories/"),
        api.get("/admin/orders/"),
      ]);

      const prods = prodsRes.status === "fulfilled" ? prodsRes.value.data : [];
      const cats = catsRes.status === "fulfilled" ? catsRes.value.data : [];
      const ords = ordersRes.status === "fulfilled" ? ordersRes.value.data : [];

      setProducts(prods);
      setCategories(cats);
      setOrders(ords);
    } catch (err) {
      setError("Failed to fetch dashboard metrics. Please check backend connection.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  }

  // Quick Restock handler: increments stock by delta and saves to backend
  async function handleQuickRestock(productId, currentStock, delta) {
    const newStock = Math.max(0, (currentStock || 0) + delta);
    setRestockingId(productId);
    try {
      await updateProductStock(productId, newStock);
      // Update local state
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
      );
      showToast(`✅ Successfully added +${delta} units! (New Stock: ${newStock})`);
    } catch (err) {
      alert("Failed to restock product. Please try again.");
    } finally {
      setRestockingId(null);
    }
  }

  // Calculations
  const totalRevenue = orders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

  const pendingOrders = orders.filter((o) => o.status === "PENDING").length;
  const deliveredOrders = orders.filter((o) => o.status === "DELIVERED").length;

  const lowStockProducts = products.filter(
    (p) => (p.stock !== undefined ? p.stock : 0) < 5
  );

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 6);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl bg-emerald-600 text-white font-medium text-sm shadow-2xl shadow-emerald-600/40 animate-in fade-in slide-in-from-top-4 duration-200">
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage("")}
            className="text-white/80 hover:text-white font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 md:p-8 rounded-2xl border border-slate-700/60 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Live Store Analytics
            </span>
            <span className="text-xs text-slate-400">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.name || "Store Admin"} 👋
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Here is your live inventory status, sales performance, and customer orders.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/products"
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <span>＋</span> Add Product
          </Link>

          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            <span>🏪</span> View Store ↗
          </Link>

          <button
            onClick={loadDashboardData}
            title="Refresh dashboard data"
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl transition cursor-pointer"
          >
            🔄
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">
          {error}
        </div>
      )}

      {/* KPI Cards Row (Dribbble Ronas IT style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700/80 shadow-lg relative overflow-hidden group hover:border-indigo-500/50 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-lg text-indigo-400">
              💰
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl md:text-3xl font-extrabold text-white">
              ₹{totalRevenue.toLocaleString("en-IN")}
            </span>
          </div>
          <p className="text-xs text-emerald-400 font-medium mt-2 flex items-center gap-1">
            <span>↑</span> Active across completed orders
          </p>
        </div>

        {/* Customer Orders */}
        <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700/80 shadow-lg relative overflow-hidden group hover:border-sky-500/50 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Customer Orders
            </span>
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-lg text-sky-400">
              🚚
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold text-white">
              {orders.length}
            </span>
            <span className="text-xs text-slate-400">total placed</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            <strong className="text-amber-400">{pendingOrders}</strong> pending ·{" "}
            <strong className="text-emerald-400">{deliveredOrders}</strong> delivered
          </p>
        </div>

        {/* Products in Catalog */}
        <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700/80 shadow-lg relative overflow-hidden group hover:border-emerald-500/50 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active Products
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-lg text-emerald-400">
              📦
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold text-white">
              {products.length}
            </span>
            <span className="text-xs text-slate-400">items in store</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Across <strong>{categories.length}</strong> categories
          </p>
        </div>

        {/* Low Stock Alerts */}
        <div
          className={`p-5 rounded-2xl border shadow-lg relative overflow-hidden group transition ${
            lowStockProducts.length > 0
              ? "bg-rose-950/30 border-rose-500/40 hover:border-rose-500/70"
              : "bg-slate-800/90 border-slate-700/80"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-300 uppercase tracking-wider">
              Low Stock Alerts
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-lg text-rose-400">
              ⚠️
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold text-rose-400">
              {lowStockProducts.length}
            </span>
            <span className="text-xs text-slate-400">items need restock</span>
          </div>
          <p className="text-xs text-rose-300/80 mt-2">
            {lowStockProducts.length > 0
              ? "Requires immediate attention"
              : "All products well-stocked"}
          </p>
        </div>
      </div>

      {/* ⚠️ LOW STOCK & QUICK RESTOCK SECTION (Direct Restock from Dashboard) */}
      {lowStockProducts.length > 0 && (
        <div className="bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900 border border-rose-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-500/20 pb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white font-bold text-xl shadow-lg shadow-rose-600/30">
                ⚠️
              </span>
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">
                  Low Stock Inventory Attention
                </h3>
                <p className="text-xs text-rose-300/80">
                  {lowStockProducts.length} product(s) are critically low or out of stock. Increase quantity directly below:
                </p>
              </div>
            </div>

            <Link
              to="/admin/products"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 self-start sm:self-auto"
            >
              Open Full Inventory →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {lowStockProducts.map((p) => {
              const stock = p.stock || 0;
              const isRestocking = restockingId === p.id;

              return (
                <div
                  key={p.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 transition"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                      {p.image_url ? (
                        <img
                          src={getAssetUrl(p.image_url)}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xl">📦</span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-100 text-sm line-clamp-1">
                        {p.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-400">
                          ₹{Number(p.price).toLocaleString("en-IN")}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            stock === 0
                              ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {stock === 0 ? "0 units (Out of Stock)" : `${stock} units left`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Restock Buttons */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <span className="text-[11px] font-semibold text-slate-400 mr-1 hidden sm:inline">
                      Add:
                    </span>
                    <button
                      disabled={isRestocking}
                      onClick={() => handleQuickRestock(p.id, stock, 5)}
                      className="px-2.5 py-1.5 bg-slate-700 hover:bg-indigo-600 text-slate-200 hover:text-white text-xs font-bold rounded-lg transition-all cursor-pointer disabled:opacity-50"
                      title="Add 5 units"
                    >
                      +5
                    </button>
                    <button
                      disabled={isRestocking}
                      onClick={() => handleQuickRestock(p.id, stock, 10)}
                      className="px-2.5 py-1.5 bg-slate-700 hover:bg-indigo-600 text-slate-200 hover:text-white text-xs font-bold rounded-lg transition-all cursor-pointer disabled:opacity-50"
                      title="Add 10 units"
                    >
                      +10
                    </button>
                    <button
                      disabled={isRestocking}
                      onClick={() => handleQuickRestock(p.id, stock, 25)}
                      className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all cursor-pointer disabled:opacity-50 shadow-md shadow-indigo-600/30"
                      title="Add 25 units"
                    >
                      +25
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RECENT ORDERS TABLE (Dribbble Ronas IT style) */}
      <div className="bg-slate-800/90 rounded-2xl border border-slate-700/80 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-700/80 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">
              Recent Customer Orders
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Latest fulfillment pipeline requests from shoppers
            </p>
          </div>

          <Link
            to="/admin/orders"
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
          >
            <span>View All Orders ({orders.length})</span>
            <span>→</span>
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            No customer orders recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-700/80">
                <tr>
                  <th className="py-3.5 px-6">Order ID</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6">Customer</th>
                  <th className="py-3.5 px-6">Amount</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {recentOrders.map((ord) => {
                  const statusColors = {
                    PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/30",
                    CONFIRMED: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
                    SHIPPED: "bg-sky-500/10 text-sky-400 border-sky-500/30",
                    DELIVERED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
                    CANCELLED: "bg-rose-500/10 text-rose-400 border-rose-500/30",
                  };

                  return (
                    <tr
                      key={ord.id}
                      className="hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="py-4 px-6 font-mono font-medium text-indigo-400">
                        #{ord.id}
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-400 whitespace-nowrap">
                        {new Date(ord.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-slate-200">
                          {ord.recipient_name || `User #${ord.user_id}`}
                        </div>
                        {ord.phone && (
                          <div className="text-xs text-slate-400">
                            📞 {ord.phone}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-100 whitespace-nowrap">
                        ₹{Number(ord.total_amount).toLocaleString("en-IN")}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            statusColors[ord.status] || "bg-slate-700 text-slate-300"
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <button
                          onClick={() => navigate("/admin/orders")}
                          className="px-3 py-1.5 bg-slate-700 hover:bg-indigo-600 text-slate-200 hover:text-white text-xs font-medium rounded-lg transition cursor-pointer"
                        >
                          Manage →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
