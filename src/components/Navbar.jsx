import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { getProducts } from "../api/products";
import { getPrimaryProductImage } from "../utils/images";
import { matchesProductSearch } from "../utils/search";
import { ProductThumbnail } from "./ProductMedia";

function NavbarSearchBox({
  variant = "desktop",
  value,
  onChange,
  onClear,
  onSubmit,
  results,
  loading,
  open,
  onOpen,
  onClose,
  onSelectProduct,
}) {
  const containerRef = useRef(null);
  const isDesktop = variant === "desktop";

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        onClose();
      }
    }
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  const showDropdown = open && value.trim().length > 0;
  const previewItems = results.slice(0, 6);

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={onSubmit} className="relative w-full">
        <input
          type="text"
          placeholder={
            isDesktop
              ? "Search products, brands, categories..."
              : "Search products..."
          }
          value={value}
          onFocus={() => {
            if (value.trim()) onOpen();
          }}
          onChange={(e) => onChange(e.target.value)}
          className={
            isDesktop
              ? "w-full rounded-full border border-slate-300 bg-slate-50/80 py-2 pl-10 pr-24 text-xs text-slate-800 placeholder-slate-400 transition-all focus:border-brand focus:bg-white focus:outline-none focus:ring-3 focus:ring-brand/15"
              : "w-full rounded-full border border-slate-300 bg-white py-2 pl-9 pr-24 text-xs text-slate-800 placeholder-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
          }
        />
        <span
          className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-slate-400 ${
            isDesktop ? "left-3.5 text-sm" : "left-3 text-xs"
          }`}
        >
          🔍
        </span>
        {value && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear search"
            className={`absolute top-1/2 -translate-y-1/2 px-1.5 text-xs text-slate-400 hover:text-slate-600 cursor-pointer ${
              isDesktop ? "right-16" : "right-16"
            }`}
          >
            ✕
          </button>
        )}
        <button
          type="submit"
          className={
            isDesktop
              ? "absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white transition hover:bg-brand-dark shadow-xs cursor-pointer"
              : "absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-brand px-3 py-1.5 text-[11px] font-semibold text-white cursor-pointer"
          }
        >
          Search
        </button>
      </form>

      {/* Live Search Results Dropdown (powered by GET /products/) */}
      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-slate-200/90 bg-white/98 backdrop-blur-xl shadow-2xl shadow-slate-900/15">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-3.5 py-2 text-[11px] font-bold text-slate-500">
            <span>
              {loading
                ? "Searching products..."
                : `${results.length} matching product${results.length === 1 ? "" : "s"}`}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              Close
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-6 text-xs text-slate-500">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand border-t-transparent" />
              <span>Fetching products...</span>
            </div>
          ) : previewItems.length === 0 ? (
            <div className="px-4 py-6 text-center text-xs text-slate-500">
              No products found for{" "}
              <span className="font-bold text-slate-800">"{value.trim()}"</span>.
            </div>
          ) : (
            <>
              <ul className="max-h-72 divide-y divide-slate-100 overflow-y-auto">
                {previewItems.map((product) => {
                  const thumb = getPrimaryProductImage(product);
                  const categoryLabel =
                    product.category?.name || product.category_name || "General";
                  const outOfStock = product.stock <= 0;

                  return (
                    <li key={product.id}>
                      <button
                        type="button"
                        onClick={() => onSelectProduct(product.id)}
                        className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition hover:bg-indigo-50/60 cursor-pointer"
                      >
                        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-slate-200/80 bg-slate-100">
                          <ProductThumbnail
                            src={thumb}
                            alt={product.name}
                            className="h-full w-full object-cover"
                            placeholderIconClassName="h-5 w-5"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-slate-900">
                            {product.name}
                          </p>
                          <div className="mt-0.5 flex items-center gap-2 text-[10px]">
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 font-semibold uppercase text-slate-600">
                              {categoryLabel}
                            </span>
                            {outOfStock ? (
                              <span className="font-semibold text-rose-600">
                                Out of stock
                              </span>
                            ) : (
                              <span className="font-semibold text-emerald-600">
                                In stock
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="shrink-0 text-xs font-black text-slate-900">
                          ₹{Number(product.price).toLocaleString("en-IN")}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              <button
                type="button"
                onClick={onSubmit}
                className="w-full border-t border-slate-100 bg-slate-50/90 px-4 py-2.5 text-center text-xs font-bold text-brand hover:bg-indigo-50 transition cursor-pointer"
              >
                View all {results.length} result{results.length === 1 ? "" : "s"} in catalog →
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { token, user, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [navSearch, setNavSearch] = useState(searchParams.get("search") || "");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    setNavSearch(searchParams.get("search") || "");
  }, [searchParams]);

  useEffect(() => {
    const trimmed = navSearch.trim();
    if (!trimmed || !dropdownOpen) {
      if (!trimmed) setSearchResults([]);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const products = await getProducts();
        if (!cancelled) {
          const matches = (products || []).filter((p) =>
            matchesProductSearch(p, trimmed)
          );
          setSearchResults(matches);
        }
      } catch {
        if (!cancelled) {
          setSearchResults([]);
        }
      } finally {
        if (!cancelled) {
          setSearchLoading(false);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [navSearch, dropdownOpen]);

  const isActive = (path) => location.pathname === path;

  function handleSearchChange(val) {
    setNavSearch(val);
    setDropdownOpen(Boolean(val.trim()));
  }

  function handleSearchClear() {
    setNavSearch("");
    setSearchResults([]);
    setDropdownOpen(false);
    navigate("/");
  }

  function handleSearchSubmit(e) {
    if (e) e.preventDefault();
    setDropdownOpen(false);
    const trimmed = navSearch.trim();
    if (trimmed) {
      navigate(`/?search=${encodeURIComponent(trimmed)}`);
      setTimeout(() => {
        document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
      }, 60);
    } else {
      navigate("/");
    }
  }

  function handleSelectProduct(productId) {
    setDropdownOpen(false);
    navigate(`/product/${productId}`);
  }

  // Get user initial for avatar
  const userDisplayName = user?.name || user?.email?.split("@")[0] || "User";
  const userInitial = userDisplayName.charAt(0).toUpperCase();

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-brand py-1.5 px-4 text-center text-xs font-medium text-white tracking-wide shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="hidden sm:flex items-center gap-2 text-indigo-200">
            <span>⚡ Flash Super Sale</span>
            <span>•</span>
            <span>Free Express Delivery over ₹499</span>
          </div>
          <div className="mx-auto sm:mx-0 flex items-center gap-2">
            <span>🎉 Use Code <strong className="rounded bg-white/20 px-1.5 py-0.5 font-bold text-white">SAVE10</strong> for Extra 10% Off!</span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-xs text-indigo-200">
            <span className="flex items-center gap-1">📞 24/7 Support</span>
            <span>|</span>
            <span className="flex items-center gap-1">🛡️ 100% Authentic</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 sm:gap-4 px-3 py-2.5 sm:px-6 sm:py-3">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand to-indigo-500 text-lg sm:text-xl text-white shadow-md shadow-brand/20 transition-transform group-hover:scale-105">
              🛍️
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-brand transition">
                Shop<span className="text-brand">Cart</span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400 tracking-wider uppercase -mt-1">
                Premium Store
              </span>
            </div>
          </Link>

          {/* Desktop Search Bar (Flipkart Style) */}
          <div className="hidden md:flex flex-1 max-w-lg items-center">
            <NavbarSearchBox
              variant="desktop"
              value={navSearch}
              onChange={handleSearchChange}
              onClear={handleSearchClear}
              onSubmit={handleSearchSubmit}
              results={searchResults}
              loading={searchLoading}
              open={dropdownOpen}
              onOpen={() => setDropdownOpen(true)}
              onClose={() => setDropdownOpen(false)}
              onSelectProduct={handleSelectProduct}
            />
          </div>

          {/* Right Navigation Actions */}
          <nav className="flex items-center gap-1.5 sm:gap-3 text-xs sm:text-sm font-medium shrink-0">
            {/* Store Link */}
            <Link
              to="/"
              className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl transition ${
                isActive("/")
                  ? "bg-brand/10 text-brand font-bold"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span>🏠</span>
              <span>Home</span>
            </Link>

            {/* My Orders Link */}
            {token && (
              <Link
                to="/orders"
                title="My Orders"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl transition whitespace-nowrap ${
                  isActive("/orders")
                    ? "bg-brand/10 text-brand font-bold"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span>📦</span>
                <span className="hidden sm:inline">Orders</span>
              </Link>
            )}

            {/* Cart Link with Badge */}
            <Link
              to="/cart"
              title="Shopping Cart"
              className={`relative flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border transition whitespace-nowrap ${
                isActive("/cart")
                  ? "border-brand bg-brand text-white shadow-md shadow-brand/20 font-bold"
                  : "border-slate-200 bg-white text-slate-700 hover:border-brand/40 hover:bg-slate-50"
              }`}
            >
              <span className="text-sm sm:text-base">🛒</span>
              <span className="font-semibold hidden sm:inline">Cart</span>
              {itemCount > 0 && (
                <span
                  className={`flex h-4.5 min-w-[18px] sm:h-5 sm:min-w-[20px] items-center justify-center rounded-full px-1 sm:px-1.5 text-[10px] sm:text-[11px] font-extrabold ${
                    isActive("/cart")
                      ? "bg-white text-brand"
                      : "bg-brand text-white shadow-xs"
                  }`}
                >
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Admin Badge (if Admin) */}
            {isAdmin && (
              <Link
                to="/admin"
                className="hidden sm:flex items-center gap-1 rounded-xl bg-indigo-50 border border-indigo-200/60 px-3 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition shadow-xs"
              >
                <span>⚙️</span>
                <span>Admin</span>
              </Link>
            )}

            {/* Auth Section */}
            {token ? (
              <div className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 border-l border-slate-200">
                <div className="hidden sm:flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-xs shadow-xs">
                    {userInitial}
                  </div>
                  <span className="hidden xl:inline text-xs font-semibold text-slate-800 max-w-[100px] truncate">
                    {userDisplayName}
                  </span>
                </div>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="rounded-lg border border-slate-200 px-2 sm:px-2.5 py-1.5 text-[11px] sm:text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-red-600 transition whitespace-nowrap cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 border-l border-slate-200">
                <Link
                  to="/login"
                  className="rounded-xl px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-[11px] sm:text-xs font-semibold text-slate-700 hover:bg-slate-100 transition whitespace-nowrap"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="rounded-xl bg-brand px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-[11px] sm:text-xs font-bold text-white hover:bg-brand-dark shadow-sm transition whitespace-nowrap"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        </div>

        {/* Mobile Search Bar (Visible on mobile/tablet) */}
        <div className="md:hidden border-t border-slate-100 px-3 py-2 bg-slate-50/90">
          <NavbarSearchBox
            variant="mobile"
            value={navSearch}
            onChange={handleSearchChange}
            onClear={handleSearchClear}
            onSubmit={handleSearchSubmit}
            results={searchResults}
            loading={searchLoading}
            open={dropdownOpen}
            onOpen={() => setDropdownOpen(true)}
            onClose={() => setDropdownOpen(false)}
            onSelectProduct={handleSelectProduct}
          />
        </div>
      </header>
    </>
  );
}
