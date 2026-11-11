import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { getAddresses, createAddress } from "../api/addresses";
import { createOrder } from "../api/orders";
import { getAssetUrl } from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PurchaseHeader from "../components/PurchaseHeader";

const fieldCls =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none transition focus:border-brand focus:ring-3 focus:ring-brand/15";

export default function Checkout() {
  const { cart, fetchCart } = useCart();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);

  // New Address Form State
  const [newAddress, setNewAddress] = useState({
    recipient_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    is_default: false,
  });

  const [placingOrder, setPlacingOrder] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [error, setError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Fetch addresses on load
  async function loadAddresses() {
    setLoadingAddresses(true);
    try {
      const data = await getAddresses();
      setAddresses(data);
      const def = data.find((a) => a.is_default) || data[0];
      if (def) {
        setSelectedAddressId(def.id);
      } else {
        setShowAddressForm(true);
      }
    } catch {
      setError("Failed to load delivery addresses.");
    } finally {
      setLoadingAddresses(false);
    }
  }

  useEffect(() => {
    loadAddresses();
  }, []);

  async function handleAddAddress(e) {
    e.preventDefault();
    setError("");
    setSavingAddress(true);
    try {
      const created = await createAddress(newAddress);
      setAddresses((prev) => [created, ...prev]);
      setSelectedAddressId(created.id);
      setShowAddressForm(false);
      setNewAddress({
        recipient_name: "",
        phone: "",
        address_line1: "",
        address_line2: "",
        city: "",
        state: "",
        postal_code: "",
        is_default: false,
      });
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to save address. Please check all fields."
      );
    } finally {
      setSavingAddress(false);
    }
  }

  async function handlePlaceOrder() {
    if (!selectedAddressId) {
      setError("Please select or add a delivery address.");
      return;
    }
    if (!cart.items || cart.items.length === 0) {
      setError("Your cart is empty. Please add items before checking out.");
      return;
    }

    setError("");
    setPlacingOrder(true);
    try {
      const order = await createOrder(selectedAddressId);
      await fetchCart();
      setOrderSuccess(order);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to place order. Please try again."
      );
    } finally {
      setPlacingOrder(false);
    }
  }

  const items = cart.items || [];

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <PurchaseHeader
          badge="Order Confirmed"
          title="Thank You For Shopping!"
          subtitle={`Order #${orderSuccess.id} has been received and is being prepared for dispatch.`}
          step={3}
        />
        <main className="mx-auto max-w-2xl px-4 py-12 text-center flex-1 w-full">
          <div className="rounded-3xl border border-emerald-200/80 bg-white p-8 sm:p-10 shadow-xl shadow-emerald-500/10">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 text-5xl">
              🎉
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              Order Placed Successfully!
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Your order <strong className="text-slate-900">#{orderSuccess.id}</strong> is confirmed and will ship soon.
            </p>

            <div className="mt-6 rounded-2xl bg-slate-50 p-5 text-left text-xs text-slate-600 border border-slate-200/80 space-y-2">
              <p>
                <strong className="text-slate-800">Recipient:</strong>{" "}
                {orderSuccess.delivery_address?.recipient_name} ({orderSuccess.delivery_address?.phone})
              </p>
              <p>
                <strong className="text-slate-800">Delivery To:</strong>{" "}
                {orderSuccess.delivery_address?.address_line1},{" "}
                {orderSuccess.delivery_address?.city}, {orderSuccess.delivery_address?.state} -{" "}
                {orderSuccess.delivery_address?.postal_code}
              </p>
              <p>
                <strong className="text-slate-800">Total Amount:</strong>{" "}
                <span className="font-bold text-slate-900">
                  ₹{Number(orderSuccess.total_amount).toLocaleString("en-IN")}
                </span>
              </p>
              <p>
                <strong className="text-slate-800">Status:</strong>{" "}
                <span className="inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                  {orderSuccess.status}
                </span>
              </p>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/orders"
                className="rounded-2xl bg-gradient-to-r from-brand to-indigo-600 px-6 py-3 text-sm font-bold text-white hover:from-brand-dark hover:to-indigo-700 transition shadow-lg shadow-brand/25"
              >
                Track My Orders →
              </Link>
              <Link
                to="/"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100 transition"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />

      <PurchaseHeader
        badge="Secure Flagship Checkout"
        title="Checkout & Delivery"
        subtitle="Select your delivery address and review your order summary before confirming."
        step={2}
      />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 flex-1 w-full">
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-3.5 text-xs font-medium text-red-700 border border-red-200 flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column: Address Selection & Payment */}
          <div className="space-y-6 lg:col-span-2">
            {/* Step 1: Address */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-50 text-sm">
                    📍
                  </span>
                  <span>1. Delivery Address</span>
                </h2>
                {!showAddressForm && (
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-bold text-brand hover:bg-indigo-100 transition cursor-pointer"
                  >
                    + Add New Address
                  </button>
                )}
              </div>

              {loadingAddresses ? (
                <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`block cursor-pointer rounded-2xl border p-4 transition ${
                        selectedAddressId === addr.id
                          ? "border-brand bg-indigo-50/40 ring-2 ring-brand/20"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="mt-1 accent-brand"
                        />
                        <div className="flex-1 text-sm">
                          <div className="flex items-center gap-2 font-bold text-slate-900">
                            <span>{addr.recipient_name}</span>
                            <span className="text-xs text-slate-500 font-medium">
                              ({addr.phone})
                            </span>
                            {addr.is_default && (
                              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-brand">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 mt-1">
                            {addr.address_line1}
                            {addr.address_line2 ? `, ${addr.address_line2}` : ""},{" "}
                            {addr.city}, {addr.state} - {addr.postal_code}
                          </p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {/* Add New Address Form */}
              {showAddressForm && (
                <form
                  onSubmit={handleAddAddress}
                  className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-3"
                >
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Add New Delivery Address
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-600 mb-1 font-semibold">
                        Recipient Name *
                      </label>
                      <input
                        required
                        className={fieldCls}
                        value={newAddress.recipient_name}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, recipient_name: e.target.value })
                        }
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1 font-semibold">
                        Phone Number (10 digits) *
                      </label>
                      <input
                        required
                        minLength={10}
                        maxLength={15}
                        className={fieldCls}
                        value={newAddress.phone}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, phone: e.target.value })
                        }
                        placeholder="9876543210"
                      />
                    </div>
                  </div>

                  <div className="text-xs">
                    <label className="block text-slate-600 mb-1 font-semibold">
                      Address Line 1 *
                    </label>
                    <input
                      required
                      className={fieldCls}
                      value={newAddress.address_line1}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, address_line1: e.target.value })
                      }
                      placeholder="Street, Door No, Area"
                    />
                  </div>

                  <div className="text-xs">
                    <label className="block text-slate-600 mb-1 font-semibold">
                      Address Line 2 (Optional)
                    </label>
                    <input
                      className={fieldCls}
                      value={newAddress.address_line2}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, address_line2: e.target.value })
                      }
                      placeholder="Landmark, Apartment"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-600 mb-1 font-semibold">City *</label>
                      <input
                        required
                        className={fieldCls}
                        value={newAddress.city}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, city: e.target.value })
                        }
                        placeholder="Chennai"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1 font-semibold">State *</label>
                      <input
                        required
                        className={fieldCls}
                        value={newAddress.state}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, state: e.target.value })
                        }
                        placeholder="Tamil Nadu"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1 font-semibold">Postal Code *</label>
                      <input
                        required
                        className={fieldCls}
                        value={newAddress.postal_code}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, postal_code: e.target.value })
                        }
                        placeholder="600001"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 text-xs">
                    <input
                      type="checkbox"
                      id="is_default"
                      checked={newAddress.is_default}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, is_default: e.target.checked })
                      }
                      className="accent-brand"
                    />
                    <label htmlFor="is_default" className="text-slate-700 font-medium">
                      Set as default delivery address
                    </label>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    {addresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        className="rounded-xl border border-slate-300 bg-white px-4 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={savingAddress}
                      className="rounded-xl bg-brand px-5 py-1.5 text-xs font-bold text-white hover:bg-brand-dark disabled:opacity-50 cursor-pointer"
                    >
                      {savingAddress ? "Saving..." : "Save Address"}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Step 2: Payment Method */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2 mb-4">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-50 text-sm">
                  💳
                </span>
                <span>2. Payment Method</span>
              </h2>
              <div className="rounded-2xl border border-brand bg-indigo-50/40 p-4 flex items-center gap-3 ring-2 ring-brand/15">
                <input type="radio" checked readOnly className="accent-brand" />
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Cash / UPI on Delivery (Pay at Doorstep)
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pay conveniently with Cash or scan UPI QR when your package arrives.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-200/40 sticky top-24">
              <h2 className="text-base font-black text-slate-900 mb-4 border-b border-slate-100 pb-3">
                Order Review
              </h2>

              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto mb-4">
                {items.map((item) => {
                  const thumb = item.image_url ? getAssetUrl(item.image_url) : null;
                  return (
                    <div key={item.cart_item_id} className="py-3 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-100 border border-slate-200/70 overflow-hidden flex items-center justify-center">
                          {thumb ? (
                            <img src={thumb} alt={item.product_name} className="h-full w-full object-cover" />
                          ) : (
                            <span>📦</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 truncate">{item.product_name}</p>
                          <p className="text-slate-400">
                            Qty: {item.quantity} × ₹{Number(item.price).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                      <span className="font-extrabold text-slate-900 shrink-0">
                        ₹{Number(item.subtotal).toLocaleString("en-IN")}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2.5 border-t border-slate-200 pt-3 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-800">
                    ₹{Number(cart.total_amount).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Express Delivery</span>
                  <span className="font-bold text-emerald-600">FREE</span>
                </div>
                <div className="border-t border-slate-100 pt-2.5 flex justify-between items-baseline text-sm font-bold text-slate-900">
                  <span>Total Payable</span>
                  <span className="text-xl font-black text-brand">
                    ₹{Number(cart.total_amount).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={placingOrder || !selectedAddressId || items.length === 0}
                className="mt-6 w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3.5 text-center text-sm font-bold text-white hover:from-emerald-700 hover:to-teal-700 transition shadow-lg shadow-emerald-600/25 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
              >
                {placingOrder ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      ></path>
                    </svg>
                    <span>Placing Order...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Place Order</span>
                    <span>✓</span>
                  </>
                )}
              </button>

              <p className="mt-3 text-center text-[11px] text-slate-400">
                🔒 100% Buyer Protection • Encrypted Order Flow
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
