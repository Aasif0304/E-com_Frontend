import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getAllAdminOrders,
  getAdminOrderDetails,
  updateOrderStatus,
} from "../../api/orders";

const STATUS_TABS = [
  "ALL",
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const ALLOWED_TRANSITIONS = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");
  const [search, setSearch] = useState("");

  // Slide-over Drawer Details State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Status Action Loading
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionNotice, setActionNotice] = useState("");

  async function loadOrders() {
    setLoading(true);
    setError("");
    try {
      const data = await getAllAdminOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to fetch customer orders from backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  // Open slide-over drawer and fetch full line items
  async function openOrderDrawer(orderId) {
    setDrawerOpen(true);
    setDetailsLoading(true);
    try {
      const details = await getAdminOrderDetails(orderId);
      setSelectedOrder(details);
    } catch (err) {
      alert("Failed to load full order details.");
      setDrawerOpen(false);
    } finally {
      setDetailsLoading(false);
    }
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setSelectedOrder(null);
  }

  // Handle status pipeline transitions
  async function handleStatusChange(orderId, newStatus) {
    setActionLoadingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      // Update in orders list
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      // Update in currently open drawer
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
      setActionNotice(`Order #${orderId} marked as ${newStatus}!`);
      setTimeout(() => setActionNotice(""), 4000);
    } catch (err) {
      alert(
        err.response?.data?.detail || "Could not update status. Check transitions."
      );
    } finally {
      setActionLoadingId(null);
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesTab = activeTab === "ALL" || order.status === activeTab;
    const term = search.toLowerCase();
    const matchesSearch =
      order.id?.toString().includes(term) ||
      order.recipient_name?.toLowerCase().includes(term) ||
      order.phone?.includes(term);
    return matchesTab && matchesSearch;
  });

  function renderStatusBadge(status) {
    const map = {
      PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      CONFIRMED: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
      SHIPPED: "bg-sky-500/10 text-sky-400 border-sky-500/30",
      DELIVERED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      CANCELLED: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    };
    return (
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
          map[status] || "bg-slate-700 text-slate-300"
        }`}
      >
        {status}
      </span>
    );
  }

  function getStatusButtons(order) {
    const transitions = ALLOWED_TRANSITIONS[order.status] || [];
    if (transitions.length === 0) {
      return (
        <span className="text-xs text-slate-500 italic">No further actions</span>
      );
    }

    return (
      <div className="flex items-center gap-1.5 flex-wrap justify-end">
        {transitions.includes("CONFIRMED") && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStatusChange(order.id, "CONFIRMED");
            }}
            disabled={actionLoadingId === order.id}
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            Confirm
          </button>
        )}
        {transitions.includes("SHIPPED") && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStatusChange(order.id, "SHIPPED");
            }}
            disabled={actionLoadingId === order.id}
            className="px-3 py-1 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            Ship
          </button>
        )}
        {transitions.includes("DELIVERED") && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStatusChange(order.id, "DELIVERED");
            }}
            disabled={actionLoadingId === order.id}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            Deliver
          </button>
        )}
        {transitions.includes("CANCELLED") && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (
                window.confirm(
                  `Are you sure you want to cancel Order #${order.id}?`
                )
              ) {
                handleStatusChange(order.id, "CANCELLED");
              }
            }}
            disabled={actionLoadingId === order.id}
            className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 disabled:opacity-50 text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notice */}
      {actionNotice && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 text-white font-medium text-sm shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200">
          <span>{actionNotice}</span>
          <button onClick={() => setActionNotice("")} className="ml-2 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Top Breadcrumb & Page Header with Back to Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Link
              to="/admin"
              className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              <span>← Back to Dashboard</span>
            </Link>
            <span>/</span>
            <span className="text-slate-300">Orders Management</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">
            Customer Orders & Fulfillment
          </h1>
          <p className="text-sm text-slate-400">
            Track customer deliveries, inspect line items, and advance fulfillment pipeline
          </p>
        </div>

        <button
          onClick={loadOrders}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer self-start sm:self-auto"
        >
          <span>🔄</span> Refresh Orders
        </button>
      </div>

      {/* Status Filter Tabs & Search Bar (Dribbble Ronas IT style) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/80 p-4 rounded-xl border border-slate-700/60 shadow-lg">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {STATUS_TABS.map((tab) => {
            const count =
              tab === "ALL"
                ? orders.length
                : orders.filter((o) => o.status === tab).length;
            const active = activeTab === tab;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                  active
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "bg-slate-700/60 hover:bg-slate-700 text-slate-300"
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    active ? "bg-indigo-800 text-indigo-100" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search by ID, customer name, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-3.5 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">
          {error}
        </div>
      )}

      {/* Orders Table (Clicking row opens slide-out drawer) */}
      <div className="bg-slate-800/90 rounded-2xl border border-slate-700/80 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-700/80">
              <tr>
                <th className="py-4 px-6">Order ID</th>
                <th className="py-4 px-6">Placed At</th>
                <th className="py-4 px-6">Customer</th>
                <th className="py-4 px-6">Total Amount</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Fulfillment Actions</th>
                <th className="py-4 px-6 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mb-2"></div>
                    <p>Loading orders pipeline...</p>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    No orders found matching "{activeTab}".
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => openOrderDrawer(order.id)}
                    className="hover:bg-slate-700/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-6 font-mono font-medium text-indigo-400 group-hover:underline">
                      #{order.id}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-400 whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-slate-200">
                        {order.recipient_name || `User #${order.user_id}`}
                      </div>
                      {order.phone && (
                        <div className="text-xs text-slate-400">
                          📞 {order.phone}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-100 whitespace-nowrap">
                      ₹{Number(order.total_amount).toLocaleString("en-IN")}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      {renderStatusBadge(order.status)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {getStatusButtons(order)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openOrderDrawer(order.id);
                        }}
                        className="px-3 py-1.5 bg-slate-700 hover:bg-indigo-600 text-slate-200 hover:text-white text-xs font-semibold rounded-lg transition cursor-pointer"
                      >
                        Inspect →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🌟 SIGNATURE RONAS IT SLIDE-OVER DRAWER WITH DEDICATED BACK BUTTON */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Dark Backdrop (Click to go back) */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={closeDrawer}
          />

          {/* Slide-over Drawer Panel */}
          <div className="relative w-full max-w-xl bg-slate-900 border-l border-slate-700/80 shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-200">
            {/* Drawer Header with Prominent BACK Button */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <button
                onClick={closeDrawer}
                className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-indigo-300 font-semibold text-xs rounded-xl transition cursor-pointer border border-slate-750"
              >
                <span>←</span>
                <span>Back to Orders List</span>
              </button>

              <div className="flex items-center gap-3">
                {selectedOrder && (
                  <span className="font-mono text-sm font-bold text-slate-300">
                    Order #{selectedOrder.id}
                  </span>
                )}
                <button
                  onClick={closeDrawer}
                  className="h-8 w-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold transition cursor-pointer"
                  title="Close panel"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {detailsLoading || !selectedOrder ? (
                <div className="py-20 text-center text-slate-400">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mb-3"></div>
                  <p className="text-sm font-medium">Fetching complete customer invoice & delivery address...</p>
                </div>
              ) : (
                <>
                  {/* Status & Date Banner */}
                  <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/70 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400">Placed Date</p>
                      <p className="text-sm font-semibold text-slate-200 mt-0.5">
                        {new Date(selectedOrder.created_at).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Current Status:</span>
                      {renderStatusBadge(selectedOrder.status)}
                    </div>
                  </div>

                  {/* Customer & Shipping Address Card */}
                  <div className="p-5 rounded-xl bg-slate-800/80 border border-slate-700/70 space-y-2">
                    <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                      <span>📍</span> Delivery & Customer Address
                    </h3>
                    {selectedOrder.delivery_address ? (
                      <div className="text-sm text-slate-300 space-y-1 pt-1">
                        <p className="font-bold text-white text-base">
                          {selectedOrder.delivery_address.recipient_name}
                        </p>
                        <p className="text-slate-400 font-mono text-xs">
                          📞 {selectedOrder.delivery_address.phone}
                        </p>
                        <p className="pt-1 text-slate-300">
                          {selectedOrder.delivery_address.address_line1}
                        </p>
                        {selectedOrder.delivery_address.address_line2 && (
                          <p className="text-slate-300">
                            {selectedOrder.delivery_address.address_line2}
                          </p>
                        )}
                        <p className="font-medium text-slate-200">
                          {selectedOrder.delivery_address.city},{" "}
                          {selectedOrder.delivery_address.state} —{" "}
                          <span className="font-mono">
                            {selectedOrder.delivery_address.postal_code}
                          </span>
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">
                        No address attached.
                      </p>
                    )}
                  </div>

                  {/* Order Line Items Table */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Items Breakdown</span>
                      <span>({selectedOrder.items?.length || 0} product(s))</span>
                    </h3>

                    <div className="border border-slate-700/70 rounded-xl overflow-hidden bg-slate-800/50">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-900/80 text-slate-400 uppercase">
                          <tr>
                            <th className="py-3 px-4">Product</th>
                            <th className="py-3 px-4 text-center">Qty</th>
                            <th className="py-3 px-4 text-right">Unit Price</th>
                            <th className="py-3 px-4 text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/40">
                          {selectedOrder.items?.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-700/20">
                              <td className="py-3 px-4 font-semibold text-slate-100">
                                {item.product_name}
                              </td>
                              <td className="py-3 px-4 text-center font-mono font-bold">
                                x{item.quantity}
                              </td>
                              <td className="py-3 px-4 text-right font-mono text-slate-300">
                                ₹{Number(item.unit_price).toLocaleString("en-IN")}
                              </td>
                              <td className="py-3 px-4 text-right font-bold text-slate-100">
                                ₹{Number(item.subtotal).toLocaleString("en-IN")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-slate-900/90 font-bold border-t border-slate-700">
                          <tr>
                            <td colSpan="3" className="py-3.5 px-4 text-right text-slate-300 text-sm">
                              Grand Total:
                            </td>
                            <td className="py-3.5 px-4 text-right text-indigo-400 text-base">
                              ₹{Number(selectedOrder.total_amount).toLocaleString("en-IN")}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Drawer Footer with Actions & Return Button */}
            {selectedOrder && (
              <div className="p-5 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Pipeline Actions:</span>
                  {getStatusButtons(selectedOrder)}
                </div>

                <button
                  type="button"
                  onClick={closeDrawer}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-xl transition cursor-pointer self-end sm:self-auto"
                >
                  Close Drawer
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
