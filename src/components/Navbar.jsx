import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { token, user, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [navSearch, setNavSearch] = useState(searchParams.get("search") || "");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const q = searchParams.get("search");
    if (q !== null) {
      setNavSearch(q);
    }
  }, [searchParams]);

  const isActive = (path) => location.pathname === path;

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/?search=${encodeURIComponent(navSearch.trim())}`);
    } else {
      navigate("/");
    }
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
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand to-indigo-500 text-xl text-white shadow-md shadow-brand/20 transition-transform group-hover:scale-105">
              🛍️
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-brand transition">
                Shop<span className="text-brand">Cart</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase -mt-1">
                Premium Store
              </span>
            </div>
          </Link>

          {/* Desktop Search Bar (Flipkart Style) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-lg items-center relative"
          >
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products, brands, categories..."
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                className="w-full rounded-full border border-slate-300 bg-slate-50/80 py-2 pl-10 pr-20 text-xs text-slate-800 placeholder-slate-400 transition-all focus:border-brand focus:bg-white focus:outline-none focus:ring-3 focus:ring-brand/15"
              />
              <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm">
                🔍
              </span>
              {navSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setNavSearch("");
                    navigate("/");
                  }}
                  className="absolute right-14 top-2 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
              <button
                type="submit"
                className="absolute right-1.5 top-1 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white transition hover:bg-brand-dark shadow-xs"
              >
                Search
              </button>
            </div>
          </form>

          {/* Right Navigation Actions */}
          <nav className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium">
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
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition ${
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
              className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl border transition ${
                isActive("/cart")
                  ? "border-brand bg-brand text-white shadow-md shadow-brand/20 font-bold"
                  : "border-slate-200 bg-white text-slate-700 hover:border-brand/40 hover:bg-slate-50"
              }`}
            >
              <span className="text-base">🛒</span>
              <span className="font-semibold hidden sm:inline">Cart</span>
              {itemCount > 0 && (
                <span
                  className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-extrabold ${
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
              <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-200">
                <div className="flex items-center gap-2">
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
                  className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-red-600 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <Link
                  to="/login"
                  className="rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="rounded-xl bg-brand px-3.5 py-2 text-xs font-bold text-white hover:bg-brand-dark shadow-sm transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        </div>

        {/* Mobile Search Bar (Visible on mobile/tablet) */}
        <div className="md:hidden border-t border-slate-100 px-4 py-2 bg-slate-50">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="Search products..."
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              className="w-full rounded-full border border-slate-300 bg-white py-1.5 pl-9 pr-16 text-xs text-slate-800 placeholder-slate-400 focus:border-brand focus:outline-none"
            />
            <span className="absolute left-3 top-2 text-slate-400 text-xs">
              🔍
            </span>
            <button
              type="submit"
              className="absolute right-1 top-1 rounded-full bg-brand px-2.5 py-1 text-[11px] font-semibold text-white"
            >
              Search
            </button>
          </form>
        </div>
      </header>
    </>
  );
}
