import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getOrders, cancelOrder } from "../api/orders";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              My Orders
            </h1>
            <p className="text-sm text-slate-500">
              Track your past orders and current delivery statuses.
            </p>
          </div>

          <button
            onClick={loadOrders}
            className="self-start rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            🔄 Refresh Orders
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-3 text-xs text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 rounded-md bg-emerald-50 p-3 text-xs text-emerald-700 border border-emerald-200">
            {successMsg}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-36 animate-pulse rounded-xl border border-slate-200 bg-white p-6"
              />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <span className="text-6xl block mb-4">📦</span>
            <h2 className="text-lg font-semibold text-slate-800">No Orders Placed Yet</h2>
            <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
              You haven't placed any orders yet. Discover our latest products and place your first order!
            </p>
            <Link
              to="/"
              className="mt-6 inline-block rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark transition shadow-sm"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => {
              const canCancel =
                order.status === "PENDING" || order.status === "CONFIRMED";

              return (
                <div
                  key={order.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-900 text-base">
                        Order #{order.id}
                      </span>
                      <span
                        className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-bold ${getStatusBadge(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400">
                      Placed on:{" "}
                      <span className="text-slate-600 font-medium">
                        {order.created_at
                          ? new Date(order.created_at).toLocaleString("en-IN", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })
                          : "Recently"}
                      </span>
                    </div>
                  </div>

                  {/* Delivery & Items info */}
                  <div className="py-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Delivery Address
                      </span>
                      <p className="font-semibold text-slate-800">
                        {order.recipient_name} ({order.phone})
                      </p>
                      <p className="text-slate-600">
                        {order.address_line1}
                        {order.address_line2 ? `, ${order.address_line2}` : ""},{" "}
                        {order.city}, {order.state} - {order.postal_code}
                      </p>
                    </div>

                    <div className="md:text-right flex flex-col justify-end">
                      <span className="text-xs text-slate-400 block">Total Amount</span>
                      <span className="text-lg font-extrabold text-slate-900">
                        ₹{Number(order.total_amount).toLocaleString("en-IN")}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Payment: Cash on Delivery
                      </span>
                    </div>
                  </div>

                  {/* Bottom Action Bar */}
                  {canCancel && (
                    <div className="border-t border-slate-100 pt-3 flex justify-end">
                      <button
                        onClick={() => handleCancel(order.id)}
                        disabled={cancellingId === order.id}
                        className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition disabled:opacity-50 cursor-pointer"
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

