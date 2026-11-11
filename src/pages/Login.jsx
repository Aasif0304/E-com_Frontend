import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { errorMessage } from "../api/auth";
import AuthShell, { inputCls, btnCls } from "../components/AuthShell";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotMsg, setForgotMsg] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const role = await login(form.email, form.password);
      navigate(role === "ADMIN" ? "/admin" : "/", { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(email, password) {
    setForm({ email, password });
    setError("");
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to explore curated offers & track your orders."
      badge="Member Sign In"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
            Email Address
          </label>
          <div className="relative group">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 group-focus-within:text-brand transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.7}
                stroke="currentColor"
                className="h-4.5 w-4.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                />
              </svg>
            </span>
            <input
              className={`${inputCls} pl-10 pr-4 py-2.5`}
              type="email"
              placeholder="you@example.com"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
        </div>

        {/* Password Field with Left Lock & Right Eye Toggle */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
            Password
          </label>
          <div className="relative group">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 group-focus-within:text-brand transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.7}
                stroke="currentColor"
                className="h-4.5 w-4.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                />
              </svg>
            </span>

            <input
              className={`${inputCls} pl-10 pr-11 py-2.5`}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-700 transition-colors focus:outline-none cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.7}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.7}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Remember Me & Forgot Password Row */}
        <div className="flex items-center justify-between text-xs pt-0.5">
          <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand/30 accent-brand"
            />
            <span>Remember me</span>
          </label>

          <button
            type="button"
            onClick={() => setForgotMsg(!forgotMsg)}
            className="text-xs font-semibold text-brand hover:text-brand-dark transition cursor-pointer"
          >
            Forgot password?
          </button>
        </div>

        {/* Forgot password info banner */}
        {forgotMsg && (
          <div className="rounded-xl bg-indigo-50 border border-indigo-200 p-3 text-xs text-indigo-900 flex items-start gap-2.5">
            <span className="text-base leading-none">ℹ️</span>
            <div>
              <p className="font-semibold">Need help resetting password?</p>
              <p className="mt-0.5 text-indigo-700 text-[11px]">
                Please contact our 24/7 store support or ask your store admin to reset your credentials.
              </p>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 flex items-center gap-2.5">
            <span className="text-base">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <button className={btnCls} disabled={loading} type="submit">
          {loading ? (
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
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>Sign In to Account</span>
              <span className="text-sm">→</span>
            </>
          )}
        </button>

        {/* Quick Demo Fill Buttons */}
        <div className="pt-3 border-t border-slate-200/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
              <span>⚡</span> Quick Demo Fill:
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemo("aasif@example.com", "password123")}
              className="rounded-xl border border-slate-200 bg-slate-50/80 px-2.5 py-2 text-[11px] font-semibold text-slate-700 hover:border-brand/40 hover:bg-indigo-50/70 hover:text-brand transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>👤</span> User Demo
            </button>
            <button
              type="button"
              onClick={() => fillDemo("admin@example.com", "admin123")}
              className="rounded-xl border border-slate-200 bg-slate-50/80 px-2.5 py-2 text-[11px] font-semibold text-slate-700 hover:border-amber-400/60 hover:bg-amber-50/70 hover:text-amber-800 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>⚙️</span> Admin Demo
            </button>
          </div>
        </div>
      </form>

      {/* Switch to Register link */}
      <p className="mt-5 text-center text-xs text-slate-600">
        New to ShopCart?{" "}
        <Link
          to="/register"
          className="font-bold text-brand hover:text-brand-dark underline underline-offset-2 transition"
        >
          Create free account
        </Link>
      </p>

      {/* Trust & Security Badge */}
      <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-slate-400 pt-3 border-t border-slate-200/70">
        <span>🔒 256-bit SSL Encrypted</span>
        <span>•</span>
        <span>Fast & Secure Login</span>
      </div>
    </AuthShell>
  );
}
