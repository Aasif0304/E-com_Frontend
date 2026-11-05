import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { getAssetUrl } from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Cart() {
  const { token } = useAuth();
  const { cart, loading, updateQty, removeItem, clearAll } = useCart();
  const navigate = useNavigate();
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="mx-auto max-w-4xl px-4 py-16 text-center">
          <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm max-w-md mx-auto">
            <span className="text-5xl block mb-4">🔒</span>
            <h1 className="text-xl font-bold text-slate-900">Please Log In</h1>
            <p className="mt-2 text-sm text-slate-500">
              You need an account to view and manage your shopping cart.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                to="/login"
                className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark transition"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  async function handleQtyChange(cartItemId, newQty) {
    setError("");
    setActionLoading(true);
    try {
      await updateQty(cartItemId, newQty);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update quantity.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRemove(cartItemId) {
    setError("");
    setActionLoading(true);
    try {
      await removeItem(cartItemId);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to remove item.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleClear() {
    if (!window.confirm("Are you sure you want to empty your entire cart?")) return;
    setError("");
    setActionLoading(true);
    try {
      await clearAll();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to clear cart.");
    } finally {
      setActionLoading(false);
    }
  }

  const items = cart.items || [];
  const isEmpty = items.length === 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Shopping Cart
            </h1>
            <p className="text-sm text-slate-500">
              {isEmpty
                ? "Your cart is currently empty."
                : `You have ${items.length} unique item(s) in your cart.`}
            </p>
          </div>

          {!isEmpty && (
            <button
              onClick={handleClear}
              disabled={actionLoading}
              className="text-xs font-semibold text-red-600 hover:text-red-700 underline cursor-pointer"
            >
              Empty Cart
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-3 text-xs text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {isEmpty ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <span className="text-6xl block mb-4">🛒</span>
            <h2 className="text-lg font-semibold text-slate-800">Your Cart is Empty</h2>
            <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
              Looks like you haven't added anything to your cart yet. Explore our products and start shopping!
            </p>
            <Link
              to="/"
              className="mt-6 inline-block rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark transition shadow-sm"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Items List */}
            <div className="space-y-4 lg:col-span-2">
              {items.map((item) => {
                const img = item.image_url ? getAssetUrl(item.image_url) : null;
                return (
                  <div
                    key={item.cart_item_id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    {/* Product Info */}
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
                        {img ? (
                          <img
                            src={img}
                            alt={item.product_name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl">📦</span>
                        )}
                      </div>

                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {item.product_name}
                        </h3>
                        <p className="text-sm font-bold text-slate-700">
                          ₹{Number(item.price).toLocaleString("en-IN")}
                        </p>
                        {item.stock !== undefined && (
                          <p className="text-xs text-slate-400 mt-0.5">
                            Available: {item.stock} in stock
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Quantity & Price Controls */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                      {/* Qty Selector */}
                      <div className="flex items-center rounded-md border border-slate-300 bg-slate-50">
                        <button
                          onClick={() => handleQtyChange(item.cart_item_id, item.quantity - 1)}
                          disabled={actionLoading || item.quantity <= 1}
                          className="px-2.5 py-1 text-sm font-bold text-slate-600 hover:bg-slate-200 disabled:opacity-40"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 text-sm font-semibold text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQtyChange(item.cart_item_id, item.quantity + 1)}
                          disabled={actionLoading || item.quantity >= item.stock}
                          className="px-2.5 py-1 text-sm font-bold text-slate-600 hover:bg-slate-200 disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right min-w-[80px]">
                        <span className="text-xs text-slate-400 block">Subtotal</span>
                        <span className="text-sm font-bold text-slate-900">
                          ₹{Number(item.subtotal).toLocaleString("en-IN")}
                        </span>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemove(item.cart_item_id)}
                        disabled={actionLoading}
                        title="Remove from cart"
                        className="rounded p-1 text-slate-400 hover:text-red-600 transition"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sticky top-24">
                <h2 className="text-base font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">
                  Order Summary
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Total Items</span>
                    <span className="font-semibold text-slate-800">
                      {cart.total_items || items.reduce((s, i) => s + i.quantity, 0)}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-800">
                      ₹{Number(cart.total_amount).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Delivery Charges</span>
                    <span className="font-semibold text-emerald-600">FREE</span>
                  </div>

                  <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
                    <span className="text-base font-bold text-slate-900">Total Amount</span>
                    <span className="text-xl font-extrabold text-slate-900">
                      ₹{Number(cart.total_amount).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/checkout")}
                  disabled={actionLoading || isEmpty}
                  className="mt-6 w-full rounded-lg bg-brand py-3 text-center text-sm font-bold text-white hover:bg-brand-dark transition shadow-md disabled:opacity-50 cursor-pointer"
                >
                  Proceed to Checkout →
                </button>

                <p className="mt-3 text-center text-xs text-slate-400">
                  Safe & Secure Checkout
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

