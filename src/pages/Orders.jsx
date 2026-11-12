import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getOrders, cancelOrder } from "../api/orders";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PurchaseHeader from "../components/PurchaseHeader";
import StorefrontBackdrop from "../components/StorefrontBackdrop";

const TRACK_STEPS = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"];

export default function Orders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  async function loadOrders() {
    setLoading(true);
    setError("");
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to load orders from backend."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      loadOrders();
    }
  }, [token]);

  async function handleCancel(orderId) {
    if (!window.confirm(`Are you sure you want to cancel order #${orderId}?`)) {
      return;
    }
    setCancellingId(orderId);
    setError("");
    setSuccessMsg("");
    try {
      await cancelOrder(orderId);
      setSuccessMsg(`Order #${orderId} was cancelled successfully.`);
      await loadOrders();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to cancel order.");
    } finally {
      setCancellingId(null);
    }
  }

  function getStatusBadge(status) {
    switch (status) {
      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "CONFIRMED":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "SHIPPED":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "DELIVERED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "CANCELLED":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  }

  return (
    <div className="relative min-h-screen text-slate-900 flex flex-col">
      <StorefrontBackdrop />
      <Navbar />

      <PurchaseHeader
        badge="Order History & Tracking"
        title="My Orders"
        subtitle="Track live delivery progress and view details of your flagship purchases."
        rightSlot={
          <button
            onClick={loadOrders}
            className="rounded-full border border-white/25 bg-slate-950/45 px-4 py-2 text-xs font-bold text-white backdrop-blur-md hover:bg-white hover:text-slate-900 transition shadow-md cursor-pointer"
          >
            🔄 Refresh Orders
          </button>
        }
      />

      <main className="relative z-10 mx-auto max-w-5xl px-3 py-5 sm:px-6 sm:py-8 flex-1 w-full">
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-3.5 text-xs font-medium text-red-700 border border-red-200 flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 rounded-xl bg-emerald-50 p-3.5 text-xs font-medium text-emerald-700 border border-emerald-200 flex items-center gap-2">
            <span>✅</span>
            <span>{successMsg}</span>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-40 animate-pulse rounded-3xl border border-slate-200 bg-white p-6"
              />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-12 text-center shadow-xl shadow-slate-200/40 max-w-lg mx-auto my-6">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-5xl">
              📦
            </div>
            <h2 className="text-xl font-black text-slate-900">No Orders Placed Yet</h2>
            <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
              You haven't placed any orders yet. Discover our latest products and place your first order!
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand to-indigo-600 px-6 py-3 text-sm font-bold text-white hover:from-brand-dark hover:to-indigo-700 transition shadow-lg shadow-brand/25"
            >
              <span>Start Shopping</span>
              <span>→</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => {
              const canCancel =
                order.status === "PENDING" || order.status === "CONFIRMED";
              const activeStepIdx = TRACK_STEPS.indexOf(order.status);

              return (
                <div
                  key={order.id}
                  className="rounded-3xl border border-slate-200/80 bg-white/95 backdrop-blur-md p-5 sm:p-6 shadow-xs transition-all hover:shadow-lg"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <span className="font-black text-slate-900 text-base">
                        Order #{order.id}
                      </span>
                      <span
                        className={`inline-block rounded-full border px-3 py-0.5 text-[11px] font-bold ${getStatusBadge(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400">
                      Placed on:{" "}
                      <span className="text-slate-700 font-semibold">
                        {order.created_at
                          ? new Date(order.created_at).toLocaleString("en-IN", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })
                          : "Recently"}
                      </span>
                    </div>
                  </div>

                  {/* Live Order Progress Stepper */}
                  {order.status !== "CANCELLED" && activeStepIdx !== -1 && (
                    <div className="py-4 border-b border-slate-100">
                      <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                        {TRACK_STEPS.map((stepLabel, idx) => {
                          const completed = idx <= activeStepIdx;
                          return (
                            <div key={stepLabel} className="flex flex-col gap-1.5 min-w-0">
                              <div
                                className={`h-1.5 rounded-full transition-all ${
                                  completed ? "bg-gradient-to-r from-brand to-emerald-500" : "bg-slate-200"
                                }`}
                              />
                              <span
                                className={`text-[9px] sm:text-[10px] font-bold tracking-tight sm:tracking-wide uppercase truncate text-center sm:text-left ${
                                  completed ? "text-slate-800" : "text-slate-400"
                                }`}
                              >
                                {completed ? "✓ " : ""}
                                {stepLabel}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Delivery & Items info */}
                  <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Delivery Address
                      </span>
                      <p className="font-bold text-slate-800">
                        {order.recipient_name} ({order.phone})
                      </p>
                      <p className="text-slate-600 mt-0.5">
                        {order.address_line1}
                        {order.address_line2 ? `, ${order.address_line2}` : ""},{" "}
                        {order.city}, {order.state} - {order.postal_code}
                      </p>
                    </div>

                    <div className="md:text-right flex flex-col justify-end">
                      <span className="text-xs text-slate-400 block">Total Amount</span>
                      <span className="text-xl font-black text-slate-900">
                        ₹{Number(order.total_amount).toLocaleString("en-IN")}
                      </span>
                      <span className="text-[11px] font-medium text-slate-400">
                        Payment: Cash / UPI on Delivery
                      </span>
                    </div>
                  </div>

                  {/* Bottom Action Bar */}
                  {canCancel && (
                    <div className="border-t border-slate-100 pt-3 flex justify-end">
                      <button
                        onClick={() => handleCancel(order.id)}
                        disabled={cancellingId === order.id}
                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 transition disabled:opacity-50 cursor-pointer"
                      >
                        {cancellingId === order.id ? "Cancelling..." : "Cancel Order"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
