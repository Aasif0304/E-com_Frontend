import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { getProducts, getCategories } from "../api/products";
import { getAssetUrl } from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

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
    const q = searchParams.get("search");
    if (q !== null) {
      setSearchQuery(q);
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
        const matchesSearch =
          !searchQuery.trim() ||
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (p.category && p.category.name.toLowerCase().includes(searchQuery.toLowerCase()));

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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col">
      <Navbar />

      {/* Floating Add-to-Cart Toast Notification */}
      {toastItem && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-slate-900/95 p-3.5 pr-5 text-white shadow-2xl backdrop-blur-md border border-slate-700/50 animate-bounce">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 text-xl font-bold">
            ✓
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-emerald-400">Added to your cart</span>
            <span className="text-xs font-bold text-slate-100 max-w-[180px] truncate">
              {toastItem.name}
            </span>
          </div>
          <Link
            to="/cart"
            className="ml-3 rounded-xl bg-brand px-3.5 py-1.5 text-xs font-bold text-white hover:bg-brand-dark transition shadow-sm"
          >
            View Cart ({itemCount})
          </Link>
        </div>
      )}

      {/* 1. Category Bar Ribbon (Flipkart Style Icons Row) */}
      <div className="border-b border-slate-200/80 bg-white py-3 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => setSelectedCategory("ALL")}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition whitespace-nowrap cursor-pointer shadow-xs ${
                selectedCategory === "ALL"
                  ? "bg-slate-900 text-white shadow-md scale-105"
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
                  className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition whitespace-nowrap cursor-pointer shadow-xs ${
                    isSelected
                      ? "bg-brand text-white shadow-md scale-105"
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
      <main className="mx-auto max-w-7xl flex-1 px-4 py-6 sm:px-6 w-full">
        {/* 2. Hero Banner Section (Eye-Catching, Modern E-Commerce Hero) */}
        <section className="mb-10 relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-8 sm:p-12 text-white shadow-xl border border-indigo-900/40">
          {/* Subtle Ambient Glow Blobs */}
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand/30 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 px-3.5 py-1 text-xs font-extrabold text-amber-300">
                <span>🔥</span>
                <span>BIG FESTIVE SUPER SALE • UP TO 50% OFF</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                Discover Trending Gear, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-200 to-indigo-400">
                  Delivered In A Blink.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-xl font-normal leading-relaxed">
                Shop from thousands of certified products with lightning-fast delivery,
                exclusive bank discounts, easy 7-day returns, and guaranteed authenticity.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <a
                  href="#catalog"
                  className="rounded-xl bg-gradient-to-r from-brand to-indigo-600 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-brand/30 hover:scale-105 transition-transform"
                >
                  Explore Deals & Catalog ↓
                </a>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                    ✓
                  </span>
                  <span>Free Express Delivery Above ₹499</span>
                </div>
              </div>
            </div>

            {/* Right Hero Highlights / Offer Card */}
            <div className="lg:col-span-5 flex flex-col gap-3">
              <div className="rounded-2xl bg-white/10 p-5 backdrop-blur-md border border-white/15 shadow-inner">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    ⚡ Deal Highlight
                  </span>
                  <span className="rounded-full bg-red-500/80 px-2 py-0.5 text-[10px] font-extrabold text-white">
                    LIMITED STOCK
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  Flat 10% Extra Off On All UPI Orders
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Use UPI on checkout to claim instant discounts without coupon limits.
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                  <span className="text-xs text-slate-400">Coupon Code:</span>
                  <span className="rounded-lg bg-white/20 px-2.5 py-1 text-xs font-mono font-bold text-white tracking-widest">
                    UPIEXTRA
                  </span>
                </div>
              </div>

              {/* 3 Quick Badges Grid */}
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="rounded-xl bg-white/5 p-2.5 border border-white/10">
                  <span className="text-xl block mb-1">🚀</span>
                  <span className="text-[11px] font-bold text-white block">24h Dispatch</span>
                  <span className="text-[10px] text-slate-400">Speed delivery</span>
                </div>
                <div className="rounded-xl bg-white/5 p-2.5 border border-white/10">
                  <span className="text-xl block mb-1">⭐</span>
                  <span className="text-[11px] font-bold text-white block">4.8 / 5 Rating</span>
                  <span className="text-[10px] text-slate-400">Trusted reviews</span>
                </div>
                <div className="rounded-xl bg-white/5 p-2.5 border border-white/10">
                  <span className="text-xl block mb-1">🛡️</span>
                  <span className="text-[11px] font-bold text-white block">100% Genuine</span>
                  <span className="text-[10px] text-slate-400">Verified seller</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Value Props Strip (Flipkart / Amazon 4-Pillar Features) */}
        <section className="mb-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
              🚚
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Free Express Delivery</h4>
              <p className="text-[11px] text-slate-500">Orders above ₹499</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-2xl">
              🛡️
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">100% Genuine Brands</h4>
              <p className="text-[11px] text-slate-500">Certified quality checks</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-2xl">
              🔄
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">7-Day Easy Returns</h4>
              <p className="text-[11px] text-slate-500">Instant exchange or refund</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-2xl">
              💳
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Secure Payments</h4>
              <p className="text-[11px] text-slate-500">UPI, Cards, NetBanking, COD</p>
            </div>
          </div>
        </section>

        {/* 4. Catalog Header & Filters Bar */}
        <section id="catalog" className="mb-6 pt-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {selectedCategory === "ALL"
                  ? "Explore All Products"
                  : categories.find((c) => c.id === selectedCategory)?.name || "Products"}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Showing <strong className="text-slate-800">{filteredProducts.length}</strong> items available in store
              </p>
            </div>

            {/* Controls: Search, Sort & In-Stock filter */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search input in catalog */}
              <div className="relative min-w-[200px] flex-1 sm:flex-initial">
                <input
                  type="text"
                  placeholder="Filter within results..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-8 text-xs text-slate-800 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 shadow-xs"
                />
                <span className="absolute left-3 top-2.5 text-slate-400 text-xs">
                  🔍
                </span>
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSearchParams({});
                    }}
                    className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* In-Stock Only Toggle */}
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 cursor-pointer shadow-xs hover:bg-slate-50 select-none">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded text-brand focus:ring-brand cursor-pointer"
                />
                <span>In Stock Only</span>
              </label>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs">
                <span className="text-slate-400">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4 shadow-xs"
              >
                <div className="h-52 w-full rounded-xl bg-slate-200 mb-4" />
                <div className="h-4 w-1/3 rounded bg-slate-200 mb-2" />
                <div className="h-5 w-3/4 rounded bg-slate-200 mb-3" />
                <div className="h-6 w-1/2 rounded bg-slate-200 mt-4" />
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => {
              const imageUrl = product.image_url
                ? getAssetUrl(product.image_url)
                : null;
              const isAdding = addingIds[product.id];
              const isOutOfStock = product.stock <= 0;
              const isLowStock = product.stock > 0 && product.stock <= 5;
              const isHearted = wishlist[product.id];

              const { rating, reviewsCount, discountPercent, originalPrice, savings } =
                getProductMetrics(product);

              return (
                <div
                  key={product.id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-slate-300"
                >
                  {/* Top Wishlist Heart Icon */}
                  <button
                    onClick={(e) => toggleWishlist(product.id, e)}
                    title={isHearted ? "Remove from wishlist" : "Add to wishlist"}
                    className={`absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm transition-transform hover:scale-110 cursor-pointer ${
                      isHearted ? "text-red-500" : "text-slate-400 hover:text-red-500"
                    }`}
                  >
                    <span className="text-base leading-none">
                      {isHearted ? "❤️" : "🤍"}
                    </span>
                  </button>

                  {/* Discount Badge */}
                  <div className="absolute top-3 left-3 z-20 flex flex-col gap-1 items-start pointer-events-none">
                    <span className="rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-2.5 py-0.5 text-[10px] font-extrabold text-white shadow-md">
                      {discountPercent}% OFF
                    </span>
                    {isLowStock && (
                      <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[9px] font-bold text-white shadow-xs">
                        Only {product.stock} left!
                      </span>
                    )}
                  </div>

                  {/* Product Image Area (Clickable to Details) */}
                  <Link
                    to={`/product/${product.id}`}
                    className="relative h-56 w-full overflow-hidden bg-slate-100 flex items-center justify-center cursor-pointer block"
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-108"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className={`h-full w-full items-center justify-center text-5xl text-slate-300 ${
                        imageUrl ? "hidden" : "flex"
                      }`}
                    >
                      📦
                    </div>

                    {/* Out of Stock Overlay */}
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="rounded-xl bg-red-600 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-lg">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </Link>

                  {/* Product Info & Details */}
                  <div className="flex flex-1 flex-col p-4">
                    {/* Category & Rating Pill (Flipkart style) */}
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                        {product.category?.name || "General"}
                      </span>

                      {/* Rating pill */}
                      <div className="flex items-center gap-1 rounded-md bg-emerald-600 px-1.5 py-0.5 text-[10px] font-extrabold text-white shadow-2xs">
                        <span>★</span>
                        <span>{rating}</span>
                        <span className="text-emerald-100 text-[9px] font-medium">
                          ({reviewsCount})
                        </span>
                      </div>
                    </div>

                    {/* Product Name */}
                    <Link
                      to={`/product/${product.id}`}
                      className="font-bold text-slate-900 text-sm line-clamp-1 hover:text-brand transition cursor-pointer"
                      title={product.name}
                    >
                      {product.name}
                    </Link>

                    {/* Description snippet */}
                    {product.description && (
                      <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    )}

                    {/* Price & Savings Area */}
                    <div className="mt-auto pt-3 border-t border-slate-100">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black text-slate-900">
                          ₹{Number(product.price).toLocaleString("en-IN")}
                        </span>
                        <span className="text-xs text-slate-400 line-through">
                          ₹{originalPrice.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-600 block">
                        Save ₹{savings.toLocaleString("en-IN")} ({discountPercent}% off)
                      </span>
                    </div>

                    {/* Action Buttons: Add to Cart & Buy/View */}
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        onClick={(e) => handleAddToCart(product, e)}
                        disabled={isAdding || isOutOfStock}
                        className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-bold transition shadow-xs cursor-pointer ${
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
                        className="flex items-center justify-center gap-1 rounded-xl bg-brand py-2 px-3 text-xs font-bold text-white hover:bg-brand-dark transition shadow-md shadow-brand/20 cursor-pointer text-center"
                      >
                        <span>Details →</span>
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
