import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { getAddresses, createAddress } from "../api/addresses";
import { createOrder } from "../api/orders";
import { getAssetUrl } from "../api/axios";
import Navbar from "../components/Navbar";

export default function Checkout() {
  const { cart, fetchCart } = useCart();
  const navigate = useNavigate();

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
      // Select default address if present, or first address
      const def = data.find((a) => a.is_default) || data[0];
      if (def) {
        setSelectedAddressId(def.id);
      } else {
        setShowAddressForm(true); // If no address, open the form directly
      }
    } catch (err) {
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
      await fetchCart(); // Refresh cart (which backend clears)
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
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="mx-auto max-w-2xl px-4 py-16 text-center">
          <div className="rounded-2xl border border-emerald-200 bg-white p-8 shadow-sm">
            <span className="text-6xl block mb-4">🎉</span>
            <h1 className="text-2xl font-bold text-slate-900">
              Order Placed Successfully!
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Thank you for your purchase. Your order <strong>#{orderSuccess.id}</strong> has been registered.
            </p>

            <div className="mt-6 rounded-xl bg-slate-50 p-4 text-left text-xs text-slate-600 border border-slate-200 space-y-1.5">
              <p>
                <strong>Recipient:</strong> {orderSuccess.delivery_address?.recipient_name} ({orderSuccess.delivery_address?.phone})
              </p>
              <p>
                <strong>Delivery To:</strong> {orderSuccess.delivery_address?.address_line1},{" "}
                {orderSuccess.delivery_address?.city}, {orderSuccess.delivery_address?.state} - {orderSuccess.delivery_address?.postal_code}
              </p>
              <p>
                <strong>Total Amount:</strong> ₹{Number(orderSuccess.total_amount).toLocaleString("en-IN")}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span className="inline-block rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                  {orderSuccess.status}
                </span>
              </p>
            </div>

            <div className="mt-8 flex justify-center gap-3">
              <Link
                to="/orders"
                className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark transition shadow-sm"
              >
                View My Orders
              </Link>
              <Link
                to="/"
                className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Checkout
          </h1>
          <p className="text-sm text-slate-500">
            Select delivery address and confirm your order.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-3 text-xs text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column: Address Selection & Payment */}
          <div className="space-y-6 lg:col-span-2">
            {/* Step 1: Address */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>📍</span> 1. Delivery Address
                </h2>
                {!showAddressForm && (
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="text-xs font-semibold text-brand hover:underline cursor-pointer"
                  >
                    + Add New Address
                  </button>
                )}
              </div>

              {loadingAddresses ? (
                <div className="h-24 animate-pulse rounded bg-slate-100" />
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`block cursor-pointer rounded-lg border p-4 transition ${
                        selectedAddressId === addr.id
                          ? "border-brand bg-brand/5 ring-2 ring-brand/20"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="mt-1 text-brand focus:ring-brand"
                        />
                        <div className="flex-1 text-sm">
                          <div className="flex items-center gap-2 font-semibold text-slate-900">
                            <span>{addr.recipient_name}</span>
                            <span className="text-xs text-slate-500 font-normal">
                              ({addr.phone})
                            </span>
                            {addr.is_default && (
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
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

              {/* Add New Address Form Modal/Inline */}
              {showAddressForm && (
                <form
                  onSubmit={handleAddAddress}
                  className="mt-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3"
                >
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Add New Address
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-600 mb-1 font-medium">
                        Recipient Name *
                      </label>
                      <input
                        required
                        className="w-full rounded border border-slate-300 bg-white px-3 py-1.5 outline-none focus:border-brand"
                        value={newAddress.recipient_name}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, recipient_name: e.target.value })
                        }
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1 font-medium">
                        Phone Number (10 digits) *
                      </label>
                      <input
                        required
                        minLength={10}
                        maxLength={15}
                        className="w-full rounded border border-slate-300 bg-white px-3 py-1.5 outline-none focus:border-brand"
                        value={newAddress.phone}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, phone: e.target.value })
                        }
                        placeholder="9876543210"
                      />
                    </div>
                  </div>

                  <div className="text-xs">
                    <label className="block text-slate-600 mb-1 font-medium">
                      Address Line 1 *
                    </label>
                    <input
                      required
                      className="w-full rounded border border-slate-300 bg-white px-3 py-1.5 outline-none focus:border-brand"
                      value={newAddress.address_line1}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, address_line1: e.target.value })
                      }
                      placeholder="Street, Door No, Area"
                    />
                  </div>

                  <div className="text-xs">
                    <label className="block text-slate-600 mb-1 font-medium">
                      Address Line 2 (Optional)
                    </label>
                    <input
                      className="w-full rounded border border-slate-300 bg-white px-3 py-1.5 outline-none focus:border-brand"
                      value={newAddress.address_line2}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, address_line2: e.target.value })
                      }
                      placeholder="Landmark, Apartment"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-600 mb-1 font-medium">City *</label>
                      <input
                        required
                        className="w-full rounded border border-slate-300 bg-white px-3 py-1.5 outline-none focus:border-brand"
                        value={newAddress.city}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, city: e.target.value })
                        }
                        placeholder="Chennai"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1 font-medium">State *</label>
                      <input
                        required
                        className="w-full rounded border border-slate-300 bg-white px-3 py-1.5 outline-none focus:border-brand"
                        value={newAddress.state}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, state: e.target.value })
                        }
                        placeholder="Tamil Nadu"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1 font-medium">Postal Code *</label>
                      <input
                        required
                        className="w-full rounded border border-slate-300 bg-white px-3 py-1.5 outline-none focus:border-brand"
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
                    />
                    <label htmlFor="is_default" className="text-slate-700">
                      Set as default delivery address
                    </label>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    {addresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        className="rounded border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={savingAddress}
                      className="rounded bg-brand px-4 py-1 text-xs font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
                    >
                      {savingAddress ? "Saving..." : "Save Address"}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Step 2: Payment Method */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-3">
                <span>💳</span> 2. Payment Method
              </h2>
              <div className="rounded-lg border border-brand bg-brand/5 p-4 flex items-center gap-3">
                <input type="radio" checked readOnly className="text-brand focus:ring-brand" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Cash on Delivery (Pay on Delivery)
                  </p>
                  <p className="text-xs text-slate-500">
                    Pay securely in cash or via UPI upon delivery.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sticky top-24">
              <h2 className="text-base font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">
                Order Review
              </h2>

              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto mb-4">
                {items.map((item) => (
                  <div key={item.cart_item_id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-800">{item.product_name}</p>
                      <p className="text-slate-400">Qty: {item.quantity} × ₹{Number(item.price).toLocaleString("en-IN")}</p>
                    </div>
                    <span className="font-bold text-slate-900">
                      ₹{Number(item.subtotal).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t border-slate-200 pt-3 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>₹{Number(cart.total_amount).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery</span>
                  <span className="font-semibold text-emerald-600">FREE</span>
                </div>
                <div className="border-t border-slate-100 pt-2 flex justify-between text-sm font-bold text-slate-900">
                  <span>Total Payable</span>
                  <span className="text-base font-extrabold text-brand">
                    ₹{Number(cart.total_amount).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={placingOrder || !selectedAddressId || items.length === 0}
                className="mt-6 w-full rounded-lg bg-emerald-600 py-3 text-center text-sm font-bold text-white hover:bg-emerald-700 transition shadow-md disabled:opacity-50 cursor-pointer"
              >
                {placingOrder ? "Placing Order..." : "Confirm & Place Order"}
              </button>

              <p className="mt-3 text-center text-xs text-slate-400">
                By placing the order you agree to the terms.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

