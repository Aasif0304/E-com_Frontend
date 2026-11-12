import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { getPrimaryProductImage } from "../utils/images";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PurchaseHeader from "../components/PurchaseHeader";
import StorefrontBackdrop from "../components/StorefrontBackdrop";
import { ProductThumbnail } from "../components/ProductMedia";

export default function Cart() {
  const { token } = useAuth();
  const { cart, updateQty, removeItem, clearAll } = useCart();
  const navigate = useNavigate();
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  if (!token) {
    return (
      <div className="relative min-h-screen flex flex-col">
        <StorefrontBackdrop />
        <Navbar />
        <PurchaseHeader
          badge="Member Bag"
          title="Your Shopping Cart"
          subtitle="Sign in to view your saved items and complete your order."
          step={1}
        />
        <main className="relative z-10 mx-auto max-w-4xl px-4 py-14 text-center flex-1 w-full">
          <div className="rounded-3xl border border-slate-200/80 bg-white/95 backdrop-blur-md p-10 shadow-xl shadow-slate-200/40 max-w-md mx-auto">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-3xl">
              🔒
            </div>
            <h2 className="text-xl font-black text-slate-900">Please Sign In</h2>
            <p className="mt-2 text-sm text-slate-500">
              You need an account to view and manage your shopping cart.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                to="/login"
                className="rounded-xl bg-gradient-to-r from-brand to-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:from-brand-dark hover:to-indigo-700 transition shadow-md shadow-brand/25"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100 transition"
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
    <div className="relative min-h-screen text-slate-900 flex flex-col">
      <StorefrontBackdrop />
      <Navbar />

      <PurchaseHeader
        badge="Shopping Bag"
        title="Your Shopping Cart"
        subtitle={
          isEmpty
            ? "Your bag is currently empty. Add trending products from our flagship store!"
            : `Review ${items.length} unique item(s) in your bag before proceeding to checkout.`
        }
        step={1}
        rightSlot={
          !isEmpty && (
            <button
              onClick={handleClear}
              disabled={actionLoading}
              className="rounded-full border border-rose-400/40 bg-rose-500/20 px-3.5 py-1.5 text-xs font-bold text-rose-100 backdrop-blur-md hover:bg-rose-500/40 transition cursor-pointer"
            >
              🗑️ Empty Cart
            </button>
          )
        }
      />

      <main className="relative z-10 mx-auto max-w-6xl px-3 py-5 sm:px-6 sm:py-8 flex-1 w-full">
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-3.5 text-xs font-medium text-red-700 border border-red-200 flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {isEmpty ? (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-12 text-center shadow-xl shadow-slate-200/40 max-w-lg mx-auto my-6">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-5xl">
              🛒
            </div>
            <h2 className="text-xl font-black text-slate-900">Your Cart is Empty</h2>
            <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
              Looks like you haven't added anything to your cart yet. Explore our flagship catalog and discover great deals!
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand to-indigo-600 px-6 py-3 text-sm font-bold text-white hover:from-brand-dark hover:to-indigo-700 transition shadow-lg shadow-brand/25"
            >
              <span>Explore Store</span>
              <span>→</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Items List */}
            <div className="space-y-4 lg:col-span-2">
              {items.map((item) => {
                const img = getPrimaryProductImage(item);
                return (
                  <div
                    key={item.cart_item_id}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 sm:gap-4 rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-md p-3.5 sm:p-5 shadow-xs hover:shadow-md transition"
                  >
                    {/* Product Info */}
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                      <Link
                        to={`/product/${item.product_id}`}
                        className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-xl sm:rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200/80"
                      >
                        <ProductThumbnail
                          src={img}
                          alt={item.product_name}
                          className="h-full w-full object-cover hover:scale-105 transition"
                          placeholderIconClassName="h-7 w-7 sm:h-8 sm:w-8"
                        />
                      </Link>

                      <div className="min-w-0">
                        <Link
                          to={`/product/${item.product_id}`}
                          className="font-bold text-sm sm:text-base text-slate-900 hover:text-brand transition block truncate"
                        >
                          {item.product_name}
                        </Link>
                        <p className="text-sm font-extrabold text-slate-700 mt-0.5">
                          ₹{Number(item.price).toLocaleString("en-IN")}
                        </p>
                        {item.stock !== undefined && (
                          <p className="text-[11px] font-medium text-emerald-600 mt-0.5">
                            ✓ {item.stock} available in stock
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Quantity & Price Controls */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-5 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      {/* Qty Selector */}
                      <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 overflow-hidden shadow-2xs shrink-0">
                        <button
                          onClick={() => handleQtyChange(item.cart_item_id, item.quantity - 1)}
                          disabled={actionLoading || item.quantity <= 1}
                          className="px-2.5 sm:px-3 py-1.5 text-sm font-bold text-slate-600 hover:bg-slate-200 disabled:opacity-35 cursor-pointer transition"
                        >
                          −
                        </button>
                        <span className="px-3 sm:px-3.5 py-1.5 text-xs sm:text-sm font-bold text-slate-900 bg-white border-x border-slate-200">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQtyChange(item.cart_item_id, item.quantity + 1)}
                          disabled={actionLoading || item.quantity >= item.stock}
                          className="px-2.5 sm:px-3 py-1.5 text-sm font-bold text-slate-600 hover:bg-slate-200 disabled:opacity-35 cursor-pointer transition"
                        >
                          +
                        </button>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right min-w-[78px] sm:min-w-[88px]">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                          Subtotal
                        </span>
                        <span className="text-sm sm:text-base font-black text-slate-900">
                          ₹{Number(item.subtotal).toLocaleString("en-IN")}
                        </span>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemove(item.cart_item_id)}
                        disabled={actionLoading}
                        title="Remove from cart"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-400 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition cursor-pointer"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="pt-2">
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:underline"
                >
                  <span>←</span>
                  <span>Continue Shopping</span>
                </Link>
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="rounded-3xl border border-slate-200/80 bg-white/95 backdrop-blur-md p-6 shadow-xl shadow-slate-200/40 sticky top-24">
                <h2 className="text-base font-black text-slate-900 mb-4 border-b border-slate-100 pb-3 flex items-center justify-between">
                  <span>Order Summary</span>
                  <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-brand">
                    {cart.total_items || items.reduce((s, i) => s + i.quantity, 0)} Items
                  </span>
                </h2>

                <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200/70 p-3 text-xs text-emerald-800 flex items-center gap-2 font-medium">
                  <span>🚚</span>
                  <span>You qualify for <strong>FREE Express Delivery</strong>!</span>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-bold text-slate-800">
                      ₹{Number(cart.total_amount).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Delivery Charges</span>
                    <span className="font-bold text-emerald-600">FREE</span>
                  </div>

                  <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
                    <span className="text-base font-bold text-slate-900">Total Amount</span>
                    <span className="text-2xl font-black text-brand">
                      ₹{Number(cart.total_amount).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/checkout")}
                  disabled={actionLoading || isEmpty}
                  className="mt-6 w-full rounded-2xl bg-gradient-to-r from-brand via-indigo-600 to-brand py-3.5 text-center text-sm font-bold text-white hover:from-brand-dark hover:to-indigo-700 transition shadow-lg shadow-brand/30 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
                >
                  Proceed to Checkout →
                </button>

                <p className="mt-3 text-center text-[11px] text-slate-400">
                  🔒 Safe & Encrypted Flagship Checkout
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
