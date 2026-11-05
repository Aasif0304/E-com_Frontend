import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white text-slate-600">
      {/* Trust & Guarantee Banner */}
      <div className="border-b border-slate-100 bg-slate-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center">
              <span className="text-3xl mb-2">🚚</span>
              <h4 className="font-bold text-slate-800 text-sm">Free Express Delivery</h4>
              <p className="text-xs text-slate-500 mt-0.5">On all orders above ₹499</p>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl mb-2">🛡️</span>
              <h4 className="font-bold text-slate-800 text-sm">100% Genuine Products</h4>
              <p className="text-xs text-slate-500 mt-0.5">Direct from verified suppliers</p>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl mb-2">🔄</span>
              <h4 className="font-bold text-slate-800 text-sm">7-Day Easy Returns</h4>
              <p className="text-xs text-slate-500 mt-0.5">Instant refund or replacement</p>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl mb-2">🔒</span>
              <h4 className="font-bold text-slate-800 text-sm">Safe & Secure Payments</h4>
              <p className="text-xs text-slate-500 mt-0.5">UPI, Cards, NetBanking, COD</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white text-lg font-bold shadow-md shadow-brand/30">
                🛍️
              </span>
              <span className="text-lg font-extrabold text-slate-900 tracking-tight">
                E-Commerce Store
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your one-stop destination for quality products, seamless checkout, and fastest doorstep delivery across India.
            </p>
            <div className="pt-2 text-xs text-slate-400">
              Customer Support: <span className="font-semibold text-slate-700">support@estore.in</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">
              Shop & Explore
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-brand transition">All Products Catalog</Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-brand transition">My Shopping Cart</Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-brand transition">Track Orders</Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-brand transition">Admin Portal</Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">
              Customer Care
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="text-slate-500">Shipping Policy</span>
              </li>
              <li>
                <span className="text-slate-500">Returns & Exchanges</span>
              </li>
              <li>
                <span className="text-slate-500">Privacy & Terms</span>
              </li>
              <li>
                <span className="text-slate-500">FAQ & Help Center</span>
              </li>
            </ul>
          </div>

          {/* Payment Methods */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">
              Accepted Payment Modes
            </h4>
            <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-slate-700">
              <span className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200">Google Pay</span>
              <span className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200">PhonePe</span>
              <span className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200">Paytm UPI</span>
              <span className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200">Visa / MC</span>
              <span className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200">Cash on Delivery</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-3">
              256-bit SSL encrypted checkout for guaranteed buyer protection.
            </p>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="mt-12 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <p>© {new Date().getFullYear()} E-Commerce Store India. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-600 transition">Privacy</span>
            <span>•</span>
            <span className="hover:text-slate-600 transition">Terms</span>
            <span>•</span>
            <span className="hover:text-slate-600 transition">Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

