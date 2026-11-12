import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProduct, getProducts } from "../api/products";
import { getProductImages } from "../utils/images";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import StorefrontBackdrop from "../components/StorefrontBackdrop";
import ProductImageGallery from "../components/ProductImageGallery";
import { ProductCardImage } from "../components/ProductMedia";
import storeBg from "../assets/store-bg.jpg";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Pincode check state
  const [pincode, setPincode] = useState("600001");
  const [pincodeChecked, setPincodeChecked] = useState(true);

  async function loadProductDetails() {
    setLoading(true);
    setError("");
    try {
      const data = await getProduct(id);
      setProduct(data);
      setQuantity(1);

      // Load related products
      const allProds = await getProducts().catch(() => []);
      const related = allProds
        .filter((p) => p.id !== Number(id))
        .filter(
          (p) =>
            !data.category_id ||
            p.category_id === data.category_id ||
            (p.category && p.category.id === data.category_id)
        )
        .slice(0, 4);

      setRelatedProducts(related.length > 0 ? related : allProds.filter((p) => p.id !== Number(id)).slice(0, 4));
    } catch (err) {
      setError(
        err.response?.data?.detail || "Product not found or unavailable."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProductDetails();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  }

  async function handleAddToCart() {
    if (!token) {
      navigate("/login");
      return;
    }
    if (!product || product.stock <= 0) return;

    setAddingToCart(true);
    try {
      await addItem(product.id, quantity);
      showToast(`Added ${quantity} item(s) of "${product.name}" to cart! 🛒`);
    } catch (err) {
      alert(err.message || "Failed to add to cart.");
    } finally {
      setAddingToCart(false);
    }
  }

  async function handleBuyNow() {
    if (!token) {
      navigate("/login");
      return;
    }
    if (!product || product.stock <= 0) return;

    setBuyingNow(true);
    try {
      await addItem(product.id, quantity);
      navigate("/checkout");
    } catch (err) {
      alert(err.message || "Failed to initiate checkout.");
      setBuyingNow(false);
    }
  }

  if (loading) {
    return (
      <div className="relative min-h-screen flex flex-col text-slate-900">
        <StorefrontBackdrop />
        <Navbar />
        <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 text-center flex-1">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-brand border-t-transparent mb-4"></div>
          <p className="text-slate-600 font-medium">Loading product details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="relative min-h-screen flex flex-col text-slate-900">
        <StorefrontBackdrop />
        <Navbar />
        <div className="relative z-10 mx-auto max-w-xl px-4 py-20 text-center flex-1">
          <span className="text-6xl block mb-4">😕</span>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Product Not Found
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            {error || "The product you are looking for may have been removed or does not exist."}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 font-semibold text-white shadow-md hover:bg-brand-dark transition"
          >
            ← Back to Store
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const productImages = getProductImages(product);
  const isOutOfStock = product.stock <= 0;
  const categoryName = product.category?.name || product.category_name || "General";

  // Simulated Flipkart-style MRP calculation (30% markup for discount tag)
  const originalPrice = Math.round(Number(product.price) * 1.3);
  const discountPercent = Math.round(
    ((originalPrice - Number(product.price)) / originalPrice) * 100
  );

  return (
    <div className="relative min-h-screen flex flex-col text-slate-900">
      <StorefrontBackdrop />
      <Navbar />

      {/* Flagship Store Breadcrumb Banner */}
      <div className="relative z-10 overflow-hidden bg-slate-900 border-b border-white/10">
        <img
          src={storeBg}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/60 to-indigo-950/75" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-4 sm:px-6 flex flex-wrap items-center justify-between gap-2">
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-300">
            <Link to="/" className="hover:text-white transition">
              Home
            </Link>
            <span>›</span>
            <Link to="/" className="hover:text-white transition">
              {categoryName}
            </Link>
            <span>›</span>
            <span className="text-amber-200 font-semibold truncate max-w-xs">{product.name}</span>
          </nav>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-[11px] font-bold text-emerald-300 backdrop-blur-md">
            <span>✓</span> ShopCart Flagship Assured
          </span>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:bottom-6 sm:right-6 z-50 flex items-center justify-between sm:justify-start gap-3 rounded-2xl bg-slate-900 px-4 py-3 sm:px-5 sm:py-3.5 text-xs sm:text-sm font-semibold text-white shadow-2xl">
          <span className="truncate">{toastMessage}</span>
          <Link
            to="/cart"
            className="shrink-0 sm:ml-2 rounded-lg bg-brand px-3 py-1 text-xs font-bold text-white hover:bg-brand-dark transition whitespace-nowrap"
          >
            View Cart 🛒
          </Link>
        </div>
      )}

      {/* Main Container */}
      <main className="relative z-10 mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-8 flex-1 w-full">
        {/* 🌟 Luxury 2-Column Product Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 items-start gap-6 lg:gap-8 bg-white/95 backdrop-blur-md p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50">
          {/* ================= LEFT COLUMN: IMAGE GALLERY & BUY BUTTONS ================= */}
          <div className="lg:col-span-5 flex flex-col space-y-4 sm:space-y-6">
            {/* Interactive Product Image Gallery */}
            <ProductImageGallery
              images={productImages}
              productName={product.name}
              topLeftBadge={
                isOutOfStock ? (
                  <span className="absolute top-4 left-4 z-10 rounded-xl bg-rose-600 px-3 py-1 text-xs font-bold text-white shadow-md uppercase tracking-wider">
                    Out of Stock
                  </span>
                ) : product.stock <= 5 ? (
                  <span className="absolute top-4 left-4 z-10 rounded-xl bg-amber-500 px-3 py-1 text-xs font-bold text-white shadow-md uppercase tracking-wider animate-pulse">
                    Only {product.stock} Left!
                  </span>
                ) : (
                  <span className="absolute top-4 left-4 z-10 rounded-xl bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-md uppercase tracking-wider">
                    In Stock
                  </span>
                )
              }
              topRightAction={
                <button
                  onClick={() => showToast("Added to your wishlist! ❤️")}
                  className="absolute top-4 right-4 z-10 h-10 w-10 rounded-full bg-white/95 border border-slate-200 flex items-center justify-center text-lg text-slate-400 hover:text-rose-500 hover:scale-110 shadow-sm transition cursor-pointer"
                  title="Wishlist"
                >
                  ♥
                </button>
              }
            />

            {/* Modern Gradient Action Buttons: ADD TO CART & BUY NOW */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
              <button
                onClick={handleAddToCart}
                disabled={addingToCart || isOutOfStock}
                className={`w-full py-3.5 px-3 sm:py-4 sm:px-4 rounded-xl sm:rounded-2xl font-extrabold text-xs sm:text-sm uppercase tracking-wide sm:tracking-wider flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg transition-all cursor-pointer whitespace-nowrap ${
                  isOutOfStock
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                    : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-500/30 active:scale-95"
                }`}
              >
                <span className="text-base sm:text-lg">🛒</span>
                <span>{addingToCart ? "Adding..." : "Add to Cart"}</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={buyingNow || isOutOfStock}
                className={`w-full py-3.5 px-3 sm:py-4 sm:px-4 rounded-xl sm:rounded-2xl font-extrabold text-xs sm:text-sm uppercase tracking-wide sm:tracking-wider flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg transition-all cursor-pointer whitespace-nowrap ${
                  isOutOfStock
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                    : "bg-gradient-to-r from-brand via-indigo-600 to-brand hover:from-brand-dark hover:to-indigo-700 text-white shadow-brand/30 active:scale-95"
                }`}
              >
                <span className="text-base sm:text-lg">⚡</span>
                <span>{buyingNow ? "Proceeding..." : "Buy Now"}</span>
              </button>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: DETAILS, OFFERS & SPECS ================= */}
          <div className="lg:col-span-7 flex flex-col space-y-6">
            {/* Header: Title & Category */}
            <div>
              <div className="inline-block rounded-lg bg-indigo-50 border border-indigo-100 px-3 py-1 text-xs font-bold text-brand uppercase tracking-wider mb-2">
                {categoryName}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                {product.name}
              </h1>

              {/* Ratings Pill */}
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-0.5 text-xs font-bold text-white shadow-sm">
                  <span>4.8</span>
                  <span>★</span>
                </span>
                <span className="text-xs font-medium text-slate-500">
                  1,248 Ratings & 186 Reviews
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <span>✓</span> ShopCart Assured Quality
                </span>
              </div>
            </div>

            {/* Price & Discounts Section */}
            <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/40 p-5 border border-slate-200/80">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Special Flagship Price
              </span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-3xl sm:text-4xl font-black text-slate-900">
                  ₹{Number(product.price).toLocaleString("en-IN")}
                </span>
                <span className="text-base text-slate-400 line-through">
                  ₹{originalPrice.toLocaleString("en-IN")}
                </span>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-extrabold text-emerald-700">
                  {discountPercent}% off
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Inclusive of all taxes. Free Express shipping on all orders above ₹499.
              </p>
            </div>

            {/* Available Bank & Promotional Offers */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span>🏷️</span> Available Offers
              </h3>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold shrink-0">🏷️ Bank Offer:</span>
                  <span>5% Unlimited Cashback on ShopCart VIP Credit & Debit Cards.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold shrink-0">🏷️ Special Price:</span>
                  <span>Get extra 10% off using UPIEXTRA on eligible checkout orders.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold shrink-0">🏷️ Partner Offer:</span>
                  <span>Sign-up for instant rewards and get ₹500 Flagship Gift Voucher*.</span>
                </li>
              </ul>
            </div>

            {/* Quantity Selector & Live Stock Indicator */}
            <div className="flex flex-wrap items-center gap-6 py-3 border-y border-slate-100">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Quantity:
                </span>
                <div className="inline-flex items-center rounded-xl border border-slate-300 bg-white shadow-sm overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 font-bold text-sm disabled:opacity-30 cursor-pointer"
                  >
                    −
                  </button>
                  <span className="px-4 py-1.5 font-bold text-sm text-slate-900 border-x border-slate-200 min-w-[36px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity((q) => Math.min(product.stock, q + 1))
                    }
                    disabled={quantity >= product.stock || isOutOfStock}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 font-bold text-sm disabled:opacity-30 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                {isOutOfStock ? (
                  <span className="text-xs font-bold text-rose-600">
                    Currently Unavailable
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-emerald-700">
                    ✓ {product.stock} units available in warehouse
                  </span>
                )}
              </div>
            </div>

            {/* Delivery Pincode Check Simulation */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Delivery & Services
              </h3>
              <div className="flex max-w-full sm:max-w-xs items-center gap-2">
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Enter pincode"
                  maxLength={6}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-1.5 text-xs text-slate-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 font-mono"
                />
                <button
                  onClick={() => setPincodeChecked(true)}
                  className="rounded-xl bg-slate-900 px-4 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  Check
                </button>
              </div>

              {pincodeChecked && (
                <div className="text-xs text-slate-600 space-y-1 pt-1">
                  <p className="flex items-center gap-1.5 font-medium text-emerald-700">
                    <span>⚡</span> Delivery by <strong>Tomorrow, 7:00 PM</strong> | Free Delivery
                  </p>
                  <p className="text-slate-400">Cash on Delivery available for {pincode}</p>
                </div>
              )}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-center">
                <span className="text-2xl block mb-1">🛡️</span>
                <span className="text-[11px] font-bold text-slate-800 block">100% Genuine</span>
                <span className="text-[10px] text-slate-500">Direct from brand</span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-center">
                <span className="text-2xl block mb-1">🔄</span>
                <span className="text-[11px] font-bold text-slate-800 block">7 Days Return</span>
                <span className="text-[10px] text-slate-500">Hassle-free exchange</span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-center">
                <span className="text-2xl block mb-1">💵</span>
                <span className="text-[11px] font-bold text-slate-800 block">COD Available</span>
                <span className="text-[10px] text-slate-500">Pay on doorstep</span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-center">
                <span className="text-2xl block mb-1">🚚</span>
                <span className="text-[11px] font-bold text-slate-800 block">Fast Express</span>
                <span className="text-[10px] text-slate-500">Safe packaging</span>
              </div>
            </div>

            {/* Detailed Description */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-2">
                Product Description & Specifications
              </h3>
              <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200/70">
                {product.description ||
                  "No detailed description provided for this product. Contact support for additional specifications."}
              </p>
            </div>
          </div>
        </div>

        {/* ================= RELATED PRODUCTS SECTION ================= */}
        {relatedProducts.length > 0 && (
          <div className="mt-8 sm:mt-12 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  Similar Products You Might Like
                </h2>
                <p className="text-xs text-slate-500">
                  Popular items under {categoryName}
                </p>
              </div>
              <Link to="/" className="shrink-0 text-xs font-bold text-brand hover:underline whitespace-nowrap">
                View All →
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
              {relatedProducts.map((rel) => (
                <Link
                  key={rel.id}
                  to={`/product/${rel.id}`}
                  className="group rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-md p-2.5 sm:p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition flex flex-col cursor-pointer"
                >
                  <div className="relative h-36 sm:h-44 w-full rounded-xl bg-slate-100 overflow-hidden mb-2.5 sm:mb-3 flex items-center justify-center">
                    <ProductCardImage
                      product={rel}
                      imgClassName="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      placeholderIconClassName="h-10 w-10"
                    />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-xs sm:text-sm truncate group-hover:text-brand transition">
                    {rel.name}
                  </h3>
                  <div className="mt-auto pt-2 flex items-center justify-between gap-1">
                    <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                      ₹{Number(rel.price).toLocaleString("en-IN")}
                    </span>
                    <span className="text-[11px] sm:text-xs font-semibold text-brand whitespace-nowrap">
                      View →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

