import { Link } from "react-router-dom";

export default function AuthShell({
  title,
  subtitle,
  badge = "ShopCart Security",
  children,
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden selection:bg-brand selection:text-white">
      {/* Background ambient glowing gradient orbs */}
      <div className="absolute -top-32 -left-32 h-[450px] w-[450px] rounded-full bg-gradient-to-tr from-indigo-600/25 via-blue-600/20 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-32 h-[500px] w-[500px] rounded-full bg-gradient-to-bl from-brand/25 via-violet-600/20 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/4 h-[400px] w-[400px] rounded-full bg-gradient-to-t from-sky-600/15 via-indigo-600/15 to-transparent blur-3xl pointer-events-none" />

      {/* Decorative Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Main Wrapper */}
      <div className="relative z-10 mx-auto w-full max-w-7xl flex-1 flex flex-col p-4 sm:p-6 lg:p-8">
        {/* Top Navigation */}
        <header className="flex items-center justify-between pb-6 sm:pb-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand to-indigo-500 text-2xl text-white shadow-lg shadow-brand/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              🛍️
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-white group-hover:text-indigo-300 transition">
                Shop<span className="text-indigo-400">Cart</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase -mt-0.5">
                Premium Store
              </span>
            </div>
          </Link>

          <Link
            to="/"
            className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-4 py-2 text-xs font-semibold text-slate-300 backdrop-blur-md transition-all duration-200 hover:border-slate-600 hover:bg-slate-800 hover:text-white shadow-sm"
          >
            <span>←</span>
            <span>Back to Store</span>
          </Link>
        </header>

        {/* Center Content: Split Grid */}
        <div className="my-auto grid items-center gap-8 lg:grid-cols-12 lg:gap-14 py-4">
          {/* Left Hero Showcase (visible on lg+) */}
          <div className="hidden lg:col-span-6 lg:flex flex-col justify-center pr-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1.5 text-xs font-semibold text-indigo-300 backdrop-blur-md mb-6 w-fit shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-ping"></span>
              India's Preferred Shopping Destination
            </div>

            <h1 className="text-4xl xl:text-5xl font-black tracking-tight text-white leading-[1.15]">
              Shop Smarter. <br />
              <span className="bg-gradient-to-r from-indigo-300 via-sky-300 to-indigo-500 text-transparent bg-clip-text">
                Live Better.
              </span>
            </h1>

            <p className="mt-4 text-sm text-slate-400 max-w-md leading-relaxed">
              Log in to access your synchronized cart, order history, lightning-fast checkout, and exclusive VIP member flash sales.
            </p>

            {/* Feature Cards Grid */}
            <div className="mt-8 grid grid-cols-2 gap-3.5 max-w-lg">
              <div className="group rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4 backdrop-blur-md transition-all duration-200 hover:border-indigo-500/40 hover:bg-slate-900/80 hover:translate-y-[-2px]">
                <div className="text-2xl mb-2 transition-transform group-hover:scale-110">⚡</div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Fast Delivery</h4>
                <p className="mt-1 text-xs text-slate-400">Express doorstep dispatch in under 24-48 hrs.</p>
              </div>

              <div className="group rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4 backdrop-blur-md transition-all duration-200 hover:border-indigo-500/40 hover:bg-slate-900/80 hover:translate-y-[-2px]">
                <div className="text-2xl mb-2 transition-transform group-hover:scale-110">🛡️</div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">100% Genuine</h4>
                <p className="mt-1 text-xs text-slate-400">Directly sourced authentic quality products.</p>
              </div>

              <div className="group rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4 backdrop-blur-md transition-all duration-200 hover:border-indigo-500/40 hover:bg-slate-900/80 hover:translate-y-[-2px]">
                <div className="text-2xl mb-2 transition-transform group-hover:scale-110">🏷️</div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Members VIP Deals</h4>
                <p className="mt-1 text-xs text-slate-400">Save up to 40% with members-only discounts.</p>
              </div>

              <div className="group rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4 backdrop-blur-md transition-all duration-200 hover:border-indigo-500/40 hover:bg-slate-900/80 hover:translate-y-[-2px]">
                <div className="text-2xl mb-2 transition-transform group-hover:scale-110">💳</div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Safe Checkout</h4>
                <p className="mt-1 text-xs text-slate-400">256-bit SSL encrypted zero-risk payments.</p>
              </div>
            </div>

            {/* Social Proof Pill */}
            <div className="mt-8 flex items-center gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-3.5 backdrop-blur-md max-w-md">
              <div className="flex -space-x-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 text-xs font-bold text-white ring-2 ring-slate-950">
                  AR
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-sky-500 text-xs font-bold text-white ring-2 ring-slate-950">
                  SK
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-xs font-bold text-white ring-2 ring-slate-950">
                  VP
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-xs font-bold text-white ring-2 ring-slate-950">
                  +50k
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1 text-amber-400 text-xs">
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                  <span className="ml-1 text-xs font-bold text-white">4.9/5</span>
                </div>
                <span className="text-[11px] text-slate-400">
                  Trusted by 50,000+ verified shoppers nationwide
                </span>
              </div>
            </div>
          </div>

          {/* Right Form Card */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-md rounded-3xl border border-slate-800/90 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10 relative overflow-hidden">
              {/* Top ambient glowing accent line */}
              <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-80" />

              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-[11px] font-semibold text-indigo-300 border border-indigo-500/20 mb-3 shadow-xs">
                <span>✨</span>
                <span>{badge}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {title}
              </h2>
              <p className="mt-1.5 text-xs text-slate-400">{subtitle}</p>

              <div className="mt-6">{children}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="pt-6 sm:pt-8 text-center text-xs text-slate-500 flex flex-wrap items-center justify-between gap-3 border-t border-slate-900 mt-auto">
          <span>© {new Date().getFullYear()} ShopCart E-Commerce. All rights reserved.</span>
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span className="hover:text-white transition cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-white transition cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-white transition cursor-pointer">Help & Support</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export const inputCls =
  "w-full rounded-xl border border-slate-700/80 bg-slate-950/70 text-sm text-white placeholder-slate-500 outline-none transition-all duration-200 focus:border-indigo-500 focus:bg-slate-950 focus:ring-4 focus:ring-indigo-500/20 hover:border-slate-600";

export const btnCls =
  "w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand via-indigo-600 to-brand bg-[length:200%_auto] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition-all duration-300 hover:bg-right hover:shadow-indigo-500/50 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer";
