import { Link } from "react-router-dom";
import storeBg from "../assets/store-bg.jpg";

export default function AuthShell({
  title,
  subtitle,
  badge = "ShopCart Member Access",
  children,
}) {
  return (
    <div className="min-h-screen relative flex flex-col justify-between overflow-hidden bg-slate-900 selection:bg-brand selection:text-white">
      {/* Full-Screen Bright Luxury Store Interior Photo */}
      <img
        src={storeBg}
        alt="ShopCart Flagship Store Interior"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />

      {/* Light Editorial Gradient Scrim (keeps store interior clearly visible while ensuring crisp text contrast) */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/65 via-slate-950/20 to-slate-950/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/35" />

      {/* Main Container */}
      <div className="relative z-10 mx-auto w-full max-w-7xl flex-1 flex flex-col p-4 sm:p-6 lg:p-8">
        {/* Top Floating Glass Navigation */}
        <header className="flex items-center justify-between pb-4 sm:pb-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand to-indigo-500 text-2xl text-white shadow-lg shadow-black/25 ring-1 ring-white/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              🛍️
            </div>
            <div className="flex flex-col drop-shadow-md">
              <span className="text-xl font-black tracking-tight text-white">
                Shop<span className="text-indigo-300">Cart</span>
              </span>
              <span className="text-[10px] font-bold text-white/80 tracking-wider uppercase -mt-0.5">
                Flagship Store
              </span>
            </div>
          </Link>

          <Link
            to="/"
            className="flex items-center gap-2 rounded-full border border-white/30 bg-slate-950/35 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md transition-all duration-200 hover:bg-white hover:text-slate-900 shadow-lg"
          >
            <span>←</span>
            <span>Back to Store</span>
          </Link>
        </header>

        {/* Center Content: Airy Split Layout letting the store photo shine */}
        <div className="my-auto grid items-center gap-8 lg:grid-cols-12 lg:gap-12 py-4">
          {/* Left Editorial Showcase (minimal & open so store shelves & displays remain visible) */}
          <div className="hidden lg:col-span-6 lg:flex flex-col justify-end pt-16 pr-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-slate-950/40 px-3.5 py-1.5 text-xs font-semibold text-amber-200 backdrop-blur-md mb-5 w-fit shadow-md">
              <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
              Welcome to our Flagship Store
            </div>

            <h1 className="text-4xl xl:text-5xl font-black tracking-tight text-white leading-[1.12] drop-shadow-[0_4px_20px_rgba(0,0,0,0.45)]">
              Where Style Meets <br />
              <span className="text-amber-200">Everyday Luxury.</span>
            </h1>

            <p className="mt-4 text-sm text-white/90 max-w-md leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
              Curated sneakers, watches, headphones, and apparel—handpicked and delivered straight from our boutique to your doorstep.
            </p>

            {/* Compact Highlight Chips */}
            <div className="mt-6 flex flex-wrap gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-slate-950/40 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md shadow-sm">
                <span>⚡</span> 24h Express Delivery
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-slate-950/40 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md shadow-sm">
                <span>🛡️</span> 100% Authentic
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-slate-950/40 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md shadow-sm">
                <span>🏷️</span> Member Drops
              </span>
            </div>

            {/* Compact Social Proof Pill */}
            <div className="mt-6 inline-flex items-center gap-3.5 rounded-2xl border border-white/25 bg-slate-950/45 px-4 py-3 backdrop-blur-md w-fit shadow-xl">
              <div className="flex -space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 text-[11px] font-bold text-white ring-2 ring-white/30">
                  AR
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-sky-500 text-[11px] font-bold text-white ring-2 ring-white/30">
                  SK
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-[11px] font-bold text-white ring-2 ring-white/30">
                  VP
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1 text-amber-300 text-xs leading-none">
                  <span>★★★★★</span>
                  <span className="ml-1 font-bold text-white">4.9/5</span>
                </div>
                <span className="mt-1 text-[11px] text-white/85">
                  Trusted by 50,000+ shoppers
                </span>
              </div>
            </div>
          </div>

          {/* Right Luminous Frosted White Glass Form Card */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="w-full max-w-md rounded-3xl border border-white/80 bg-white/90 p-6 sm:p-8 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.45)] backdrop-blur-2xl ring-1 ring-black/5 relative overflow-hidden text-slate-900">
              {/* Top Gradient Accent Bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand via-indigo-500 to-amber-500" />

              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-bold text-brand border border-indigo-100 mb-3">
                <span>✨</span>
                <span>{badge}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                {title}
              </h2>
              <p className="mt-1 text-xs text-slate-500">{subtitle}</p>

              <div className="mt-6">{children}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="pt-4 sm:pt-6 text-center text-xs text-white/80 flex flex-wrap items-center justify-between gap-3 mt-auto drop-shadow-sm">
          <span>© {new Date().getFullYear()} ShopCart Flagship Store. All rights reserved.</span>
          <div className="flex items-center gap-4 text-[11px] text-white/85">
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
  "w-full rounded-xl border border-slate-200/90 bg-white/85 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/15 hover:border-slate-300 shadow-2xs";

export const btnCls =
  "w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand via-indigo-600 to-brand bg-[length:200%_auto] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-brand/30 transition-all duration-300 hover:bg-right hover:shadow-brand/45 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer";
