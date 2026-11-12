import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { getProducts, getCategories } from "../api/products";
import { matchesProductSearch } from "../utils/search";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import StorefrontBackdrop from "../components/StorefrontBackdrop";
import { ProductCardImage } from "../components/ProductMedia";
import storeBg from "../assets/store-bg.jpg";

// Helper to assign vibrant category emojis
function getCategoryIcon(name = "") {
  const n = name.toLowerCase();
  if (n.includes("elec") || n.includes("phone") || n.includes("tech")) return "📱";
  if (n.includes("shoe") || n.includes("footwear")) return "👟";
  if (n.includes("cloth") || n.includes("fashion") || n.includes("wear")) return "👕";
  if (n.includes("watch")) return "⌚";
  if (n.includes("head") || n.includes("audio") || n.includes("sound")) return "🎧";
  if (n.includes("home") || n.includes("kitchen") || n.includes("living")) return "🏠";
  if (n.includes("book")) return "📚";
  if (n.includes("game") || n.includes("gaming")) return "🎮";
  if (n.includes("bag") || n.includes("luggage")) return "🎒";
  if (n.includes("beauty") || n.includes("care")) return "✨";
  return "🏷️";
}

// Generate consistent synthetic discount & rating for display realism
function getProductMetrics(product) {
  const id = product.id || 1;
  const rating = (4.1 + ((id * 3) % 9) * 0.1).toFixed(1);
  const reviewsCount = 42 + ((id * 37) % 350);
  const discountPercent = 15 + ((id * 7) % 26); // 15% to 40%
  const numPrice = Number(product.price) || 0;
  const originalPrice = Math.round(numPrice / (1 - discountPercent / 100));
  const savings = originalPrice - numPrice;

  return { rating, reviewsCount, discountPercent, originalPrice, savings };
}

export default function Home() {
  const { token } = useAuth();
  const { addItem, itemCount } = useCart();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [sortBy, setSortBy] = useState("featured");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Per-product adding loading state
  const [addingIds, setAddingIds] = useState({});
  // Wishlist heart toggles (local UI state)
  const [wishlist, setWishlist] = useState({});
  // Toast state
  const [toastItem, setToastItem] = useState(null);

  // Sync search query from URL params
  useEffect(() => {
    const q = searchParams.get("search") || "";
    setSearchQuery(q);
    if (q.trim()) {
      setTimeout(() => {
        document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
      }, 80);
    }
  }, [searchParams]);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [prodsData, catsData] = await Promise.all([
        getProducts(),
        getCategories().catch(() => []),
      ]);
      setProducts(prodsData || []);
      setCategories(catsData || []);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to load products. Please check if the backend server is running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleAddToCart(product, e) {
    if (e) e.stopPropagation();

    if (!token) {
      navigate("/login");
      return;
    }

    if (product.stock <= 0) return;

    setAddingIds((prev) => ({ ...prev, [product.id]: true }));
    try {
      await addItem(product.id, 1);
      setToastItem(product);
      setTimeout(() => setToastItem(null), 4000);
    } catch (err) {
      alert(err.response?.data?.detail || err.message || "Failed to add to cart.");
    } finally {
      setAddingIds((prev) => ({ ...prev, [product.id]: false }));
    }
  }

  function toggleWishlist(productId, e) {
    if (e) e.stopPropagation();
    setWishlist((prev) => ({ ...prev, [productId]: !prev[productId] }));
  }

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter
        const matchesCat =
          selectedCategory === "ALL" ||
          (p.category && p.category.id === Number(selectedCategory)) ||
          p.category_id === Number(selectedCategory);

        // Search text filter
        const matchesSearch = matchesProductSearch(p, searchQuery);

        // Stock filter
        const matchesStock = !inStockOnly || p.stock > 0;

        return matchesCat && matchesSearch && matchesStock;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return Number(a.price) - Number(b.price);
        if (sortBy === "price-high") return Number(b.price) - Number(a.price);
        if (sortBy === "name") return a.name.localeCompare(b.name);
        return 0; // default featured
      });
  }, [products, selectedCategory, searchQuery, inStockOnly, sortBy]);

  // Featured Deal of the Day (highest stock or first product)
  const dealOfTheDay = products.length > 0 ? products[0] : null;

  return (
    <div className="relative min-h-screen text-slate-900 font-sans antialiased flex flex-col">
      <StorefrontBackdrop />
      <Navbar />

      {/* Floating Add-to-Cart Toast Notification */}
      {toastItem && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:bottom-6 sm:right-6 z-50 flex items-center justify-between sm:justify-start gap-3 rounded-2xl bg-slate-900/95 p-3 sm:p-3.5 sm:pr-5 text-white shadow-2xl backdrop-blur-md border border-slate-700/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 text-lg sm:text-xl font-bold">
              ✓
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] sm:text-xs font-semibold text-emerald-400">Added to your cart</span>
              <span className="text-xs font-bold text-slate-100 max-w-[160px] sm:max-w-[180px] truncate">
                {toastItem.name}
              </span>
            </div>
          </div>
          <Link
            to="/cart"
            className="shrink-0 sm:ml-3 rounded-xl bg-brand px-3 py-1.5 sm:px-3.5 text-xs font-bold text-white hover:bg-brand-dark transition shadow-sm whitespace-nowrap"
          >
            View Cart ({itemCount})
          </Link>
        </div>
      )}

      {/* 1. Category Bar Ribbon (Flipkart Style Icons Row) */}
      <div className="relative z-10 border-b border-slate-200/80 bg-white/85 backdrop-blur-md py-3 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => setSelectedCategory("ALL")}
              className={`flex h-9 items-center gap-2 rounded-2xl px-4 text-xs font-bold transition whitespace-nowrap cursor-pointer shadow-xs ${
                selectedCategory === "ALL"
                  ? "bg-slate-900 text-white shadow-md ring-2 ring-slate-900/15"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <span className="text-base">🌟</span>
              <span>All Products</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                  selectedCategory === "ALL"
                    ? "bg-white/20 text-white"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {products.length}
              </span>
            </button>

            {categories.map((c) => {
              const isSelected = selectedCategory === c.id;
              const count = products.filter(
                (p) =>
                  (p.category && p.category.id === c.id) ||
                  p.category_id === c.id
              ).length;

              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`flex h-9 items-center gap-2 rounded-2xl px-4 text-xs font-bold transition whitespace-nowrap cursor-pointer shadow-xs ${
                    isSelected
                      ? "bg-brand text-white shadow-md ring-2 ring-brand/20"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <span className="text-base">{getCategoryIcon(c.name)}</span>
                  <span>{c.name}</span>
                  {count > 0 && (
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 mx-auto max-w-7xl flex-1 px-3 py-4 sm:px-6 sm:py-6 w-full">
        {/* 2. Hero Banner Section (Flagship Boutique Visual Hero) */}
        <section className="mb-6 sm:mb-10 relative overflow-hidden rounded-2xl sm:rounded-3xl bg-slate-900 p-5 sm:p-10 lg:p-12 text-white shadow-2xl border border-slate-200/20">
          {/* Store Interior Background Photo */}
          <img
            src={storeBg}
            alt="ShopCart Flagship Store"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          {/* Rich Editorial Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/55 to-slate-950/35" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-3 sm:space-y-4">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-amber-500/20 border border-amber-400/40 px-3 py-1 text-[10px] sm:text-xs font-extrabold text-amber-200 backdrop-blur-md shadow-sm">
                <span>🔥</span>
                <span>BIG FESTIVE SUPER SALE • UP TO 50% OFF</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight drop-shadow-md">
                Discover Trending Gear, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-indigo-200 to-sky-300">
                  Delivered In A Blink.
                </span>
              </h1>

              <p className="text-xs sm:text-base text-slate-100/90 max-w-xl font-normal leading-relaxed drop-shadow-xs">
                Shop from thousands of certified products with lightning-fast delivery,
                exclusive bank discounts, easy 7-day returns, and guaranteed authenticity.
              </p>

              <div className="pt-1 sm:pt-2 flex flex-wrap items-center gap-2.5 sm:gap-4">
                <a
                  href="#catalog"
                  className="rounded-xl sm:rounded-2xl bg-gradient-to-r from-brand to-indigo-600 px-4 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-brand/35 hover:scale-105 transition-transform"
                >
                  Explore Deals & Catalog ↓
                </a>
                <div className="flex items-center gap-2 rounded-full bg-slate-950/45 border border-white/15 px-3 py-1.5 backdrop-blur-md text-[11px] sm:text-xs font-semibold text-white">
                  <span className="flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-emerald-500/30 text-emerald-300 font-bold">
                    ✓
                  </span>
                  <span>Free Express Delivery Above ₹499</span>
                </div>
              </div>
            </div>

            {/* Right Hero Highlights / Frosted Glass Offer Card */}
            <div className="lg:col-span-5 flex flex-col gap-3">
              <div className="rounded-2xl bg-slate-950/60 p-5 backdrop-blur-xl border border-white/20 shadow-2xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    ⚡ Deal Highlight
                  </span>
                  <span className="rounded-full bg-rose-500/90 px-2.5 py-0.5 text-[10px] font-extrabold text-white shadow-sm">
                    LIMITED STOCK
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  Flat 10% Extra Off On All UPI Orders
                </h3>
                <p className="text-xs text-slate-200/85 mt-1">
                  Use UPI on checkout to claim instant discounts without coupon limits.
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-white/15 pt-3">
                  <span className="text-xs text-slate-300">Coupon Code:</span>
                  <span className="rounded-lg bg-white/20 border border-white/20 px-2.5 py-1 text-xs font-mono font-bold text-amber-200 tracking-widest">
                    UPIEXTRA
                  </span>
                </div>
              </div>

              {/* 3 Quick Badges Grid */}
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="rounded-xl bg-slate-950/55 backdrop-blur-md p-2.5 border border-white/15 shadow-lg">
                  <span className="text-xl block mb-1">🚀</span>
                  <span className="text-[11px] font-bold text-white block">24h Dispatch</span>
                  <span className="text-[10px] text-slate-300">Speed delivery</span>
                </div>
                <div className="rounded-xl bg-slate-950/55 backdrop-blur-md p-2.5 border border-white/15 shadow-lg">
                  <span className="text-xl block mb-1">⭐</span>
                  <span className="text-[11px] font-bold text-white block">4.8 / 5 Rating</span>
                  <span className="text-[10px] text-slate-300">Trusted reviews</span>
                </div>
                <div className="rounded-xl bg-slate-950/55 backdrop-blur-md p-2.5 border border-white/15 shadow-lg">
                  <span className="text-xl block mb-1">🛡️</span>
                  <span className="text-[11px] font-bold text-white block">100% Genuine</span>
                  <span className="text-[10px] text-slate-300">Verified seller</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Value Props Strip (4-Pillar Features) */}
        <section className="mb-6 sm:mb-10 grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="flex h-full items-center gap-2.5 sm:gap-3 rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-md p-3 sm:p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-blue-50 text-xl sm:text-2xl">
              🚚
            </div>
            <div className="min-w-0">
              <h4 className="text-[11px] sm:text-xs font-bold text-slate-900 leading-snug">Free Express Delivery</h4>
              <p className="text-[10px] sm:text-[11px] text-slate-500">Orders above ₹499</p>
            </div>
          </div>

          <div className="flex h-full items-center gap-2.5 sm:gap-3 rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-md p-3 sm:p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-emerald-50 text-xl sm:text-2xl">
              🛡️
            </div>
            <div className="min-w-0">
              <h4 className="text-[11px] sm:text-xs font-bold text-slate-900 leading-snug">100% Genuine Brands</h4>
              <p className="text-[10px] sm:text-[11px] text-slate-500">Certified quality checks</p>
            </div>
          </div>

          <div className="flex h-full items-center gap-2.5 sm:gap-3 rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-md p-3 sm:p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-amber-50 text-xl sm:text-2xl">
              🔄
            </div>
            <div className="min-w-0">
              <h4 className="text-[11px] sm:text-xs font-bold text-slate-900 leading-snug">7-Day Easy Returns</h4>
              <p className="text-[10px] sm:text-[11px] text-slate-500">Instant exchange or refund</p>
            </div>
          </div>

          <div className="flex h-full items-center gap-2.5 sm:gap-3 rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-md p-3 sm:p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-purple-50 text-xl sm:text-2xl">
              💳
            </div>
            <div className="min-w-0">
              <h4 className="text-[11px] sm:text-xs font-bold text-slate-900 leading-snug">Secure Payments</h4>
              <p className="text-[10px] sm:text-[11px] text-slate-500">UPI, Cards, NetBanking, COD</p>
            </div>
          </div>
        </section>

        {/* 4. Catalog Header & Filters Bar */}
        <section id="catalog" className="mb-5 sm:mb-6 pt-1 sm:pt-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4 pb-4 border-b border-slate-200/80">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {selectedCategory === "ALL"
                  ? "Explore All Products"
                  : categories.find((c) => c.id === selectedCategory)?.name || "Products"}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Showing <strong className="text-slate-800">{filteredProducts.length}</strong> items available in store
              </p>
            </div>

            {/* Controls: Search, Sort & In-Stock filter */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-2.5">
              {/* Search input in catalog */}
              <div className="relative col-span-2 sm:min-w-[200px] sm:flex-initial">
                <input
                  type="text"
                  placeholder="Filter within results..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9.5 w-full rounded-xl border border-slate-200/90 bg-white/90 backdrop-blur-sm pl-9 pr-8 text-xs text-slate-800 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 shadow-xs"
                />
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                  🔍
                </span>
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSearchParams({});
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* In-Stock Only Toggle */}
              <label className="flex h-9.5 items-center justify-center sm:justify-start gap-2 rounded-xl border border-slate-200/90 bg-white/90 backdrop-blur-sm px-2.5 sm:px-3 text-xs font-semibold text-slate-700 cursor-pointer shadow-xs hover:bg-white select-none">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded text-brand focus:ring-brand cursor-pointer"
                />
                <span className="truncate">In Stock Only</span>
              </label>

              {/* Sort Dropdown */}
              <div className="flex h-9.5 items-center gap-1 rounded-xl border border-slate-200/90 bg-white/90 backdrop-blur-sm px-2.5 sm:px-3 text-xs font-semibold text-slate-700 shadow-xs min-w-0">
                <span className="text-slate-400 shrink-0">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full min-w-0 bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer truncate"
                >
                  <option value="featured">Featured Deals</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Product Name (A-Z)</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Loading State */}
        {loading && (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 shadow-xs"
              >
                <div className="h-40 sm:h-52 w-full rounded-xl bg-slate-200 mb-3 sm:mb-4" />
                <div className="h-3.5 w-1/3 rounded bg-slate-200 mb-2" />
                <div className="h-4 w-3/4 rounded bg-slate-200 mb-3" />
                <div className="h-5 w-1/2 rounded bg-slate-200 mt-4" />
              </div>
            ))}
          </div>
        )}

        {/* 6. Error State */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center max-w-lg mx-auto my-10">
            <span className="text-4xl block mb-2">⚠️</span>
            <h3 className="text-base font-bold text-red-900">Unable to load catalog</h3>
            <p className="mt-1 text-xs text-red-700">{error}</p>
            <button
              onClick={loadData}
              className="mt-4 rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-700 shadow-sm"
            >
              Retry
            </button>
          </div>
        )}

        {/* 7. Empty State */}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center max-w-md mx-auto my-12 shadow-sm">
            <span className="text-6xl block mb-4">🔍</span>
            <h3 className="text-lg font-bold text-slate-800">No matching products found</h3>
            <p className="mt-1 text-xs text-slate-500">
              We couldn't find any items matching your filters. Try clearing your search query or selecting "All Products".
            </p>
            <button
              onClick={() => {
                setSelectedCategory("ALL");
                setSearchQuery("");
                setInStockOnly(false);
                setSearchParams({});
              }}
              className="mt-5 rounded-xl bg-brand px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-dark transition shadow-md shadow-brand/20"
            >
              Reset Filters & Show All
            </button>
          </div>
        )}

        {/* 8. Products Grid (Flipkart / Myntra Modern Card Grid) */}
        {!loading && !error && filteredProducts.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {filteredProducts.map((product) => {
              const isAdding = addingIds[product.id];
              const isOutOfStock = product.stock <= 0;
              const isLowStock = product.stock > 0 && product.stock <= 5;
              const isHearted = wishlist[product.id];

              const { rating, reviewsCount, discountPercent, originalPrice, savings } =
                getProductMetrics(product);

              return (
                <div
                  key={product.id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-200/80"
                >
                  {/* Top Wishlist Heart Icon */}
                  <button
                    onClick={(e) => toggleWishlist(product.id, e)}
                    title={isHearted ? "Remove from wishlist" : "Add to wishlist"}
                    className={`absolute top-2 right-2 sm:top-3 sm:right-3 z-20 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm transition-transform hover:scale-110 cursor-pointer ${
                      isHearted ? "text-red-500" : "text-slate-400 hover:text-red-500"
                    }`}
                  >
                    <span className="text-sm sm:text-base leading-none">
                      {isHearted ? "❤️" : "🤍"}
                    </span>
                  </button>

                  {/* Discount Badge */}
                  <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-20 flex flex-col gap-1 items-start pointer-events-none">
                    <span className="rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-2 py-0.5 sm:px-2.5 text-[9px] sm:text-[10px] font-extrabold text-white shadow-md">
                      {discountPercent}% OFF
                    </span>
                    {isLowStock && (
                      <span className="rounded-full bg-amber-500 px-1.5 py-0.5 sm:px-2 text-[8px] sm:text-[9px] font-bold text-white shadow-xs">
                        Only {product.stock} left!
                      </span>
                    )}
                  </div>

                  {/* Product Image Area (Clickable to Details) */}
                  <Link
                    to={`/product/${product.id}`}
                    className="relative h-40 sm:h-56 w-full overflow-hidden bg-slate-100 flex items-center justify-center cursor-pointer block"
                  >
                    <ProductCardImage product={product} />

                    {/* Out of Stock Overlay */}
                    {isOutOfStock && (
                      <div className="absolute inset-0 z-10 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="rounded-xl bg-red-600 px-3 py-1 sm:px-3.5 sm:py-1.5 text-[10px] sm:text-xs font-black uppercase tracking-wider text-white shadow-lg">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </Link>

                  {/* Product Info & Details */}
                  <div className="flex flex-1 flex-col p-2.5 sm:p-4">
                    {/* Category & Rating Pill (Flipkart style) */}
                    <div className="mb-1.5 sm:mb-2 flex items-center justify-between gap-1.5 sm:gap-2 min-h-[20px] sm:min-h-[22px]">
                      <span className="max-w-[76px] sm:max-w-[130px] truncate rounded-md bg-slate-100 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-600">
                        {product.category?.name || "General"}
                      </span>

                      {/* Rating pill */}
                      <div className="flex shrink-0 items-center gap-0.5 sm:gap-1 rounded-md bg-emerald-600 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-extrabold text-white shadow-2xs">
                        <span>★</span>
                        <span>{rating}</span>
                        <span className="hidden sm:inline text-emerald-100 text-[9px] font-medium">
                          ({reviewsCount})
                        </span>
                      </div>
                    </div>

                    {/* Product Name */}
                    <Link
                      to={`/product/${product.id}`}
                      className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1 hover:text-brand transition cursor-pointer"
                      title={product.name}
                    >
                      {product.name}
                    </Link>

                    {/* Description snippet (reserved height for crisp desktop row alignment) */}
                    <p className="hidden sm:line-clamp-2 mt-1 min-h-[2.25rem] text-xs text-slate-500 leading-relaxed">
                      {product.description || "Certified quality product ready for fast dispatch."}
                    </p>

                    {/* Price & Savings Area */}
                    <div className="mt-auto pt-2 sm:pt-3 border-t border-slate-100">
                      <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
                        <span className="text-base sm:text-xl font-black text-slate-900">
                          ₹{Number(product.price).toLocaleString("en-IN")}
                        </span>
                        <span className="text-[10px] sm:text-xs text-slate-400 line-through">
                          ₹{originalPrice.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-600 block truncate">
                        Save ₹{savings.toLocaleString("en-IN")} ({discountPercent}% off)
                      </span>
                    </div>

                    {/* Action Buttons: Add to Cart & Buy/View */}
                    <div className="mt-2.5 sm:mt-3 grid grid-cols-2 gap-1.5 sm:gap-2">
                      <button
                        onClick={(e) => handleAddToCart(product, e)}
                        disabled={isAdding || isOutOfStock}
                        className={`flex h-8.5 sm:h-9.5 items-center justify-center gap-1 rounded-xl px-2 sm:px-3 text-[11px] sm:text-xs font-bold transition shadow-xs cursor-pointer ${
                          isOutOfStock
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                            : isAdding
                            ? "bg-slate-300 text-slate-600"
                            : "bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200"
                        }`}
                      >
                        {isAdding ? (
                          <span>Adding...</span>
                        ) : (
                          <>
                            <span>🛒</span>
                            <span>Add</span>
                          </>
                        )}
                      </button>

                      <Link
                        to={`/product/${product.id}`}
                        className="flex h-8.5 sm:h-9.5 items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-brand to-indigo-600 px-2 sm:px-3 text-[11px] sm:text-xs font-bold text-white hover:from-brand-dark hover:to-indigo-700 transition shadow-md shadow-brand/20 cursor-pointer text-center"
                      >
                        <span>Details</span>
                        <span className="hidden sm:inline">→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 9. Full Footer */}
      <Footer />
    </div>
  );
}
