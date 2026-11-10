import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerRequest, errorMessage } from "../api/auth";
import AuthShell, { inputCls, btnCls } from "../components/AuthShell";

function getPasswordStrength(pass) {
  if (!pass) return { score: 0, label: "", color: "bg-slate-700", text: "text-slate-400" };
  let score = 0;
  if (pass.length >= 6) score++;
  if (pass.length >= 8) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[A-Z]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score++;

  if (score <= 1) return { score: 1, label: "Weak", color: "bg-red-500", text: "text-red-400" };
  if (score === 2) return { score: 2, label: "Fair", color: "bg-amber-500", text: "text-amber-400" };
  if (score === 3) return { score: 3, label: "Good", color: "bg-indigo-500", text: "text-indigo-400" };
  return { score: 4, label: "Strong", color: "bg-emerald-500", text: "text-emerald-400" };
}

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [agreed, setAgreed] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const pwdStrength = useMemo(() => getPasswordStrength(form.password), [form.password]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (!agreed) {
      setError("Please agree to the Terms of Service to continue.");
      return;
    }

    setLoading(true);
    try {
      await registerRequest(form);
      setSuccess("Account created successfully! Redirecting you to login...");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Create account"
      subtitle="Join ShopCart to enjoy personalized recommendations & instant discounts."
      badge="Fast VIP Sign Up"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-300">
            Full Name
          </label>
          <div className="relative group">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 group-focus-within:text-indigo-400 transition-colors">
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
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                />
              </svg>
            </span>
            <input
              className={`${inputCls} pl-10 pr-4`}
              placeholder="e.g. Aasif Khan"
              required
              minLength={2}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
        </div>

        {/* Email Address */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-300">
            Email Address
          </label>
          <div className="relative group">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 group-focus-within:text-indigo-400 transition-colors">
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
              className={`${inputCls} pl-10 pr-4`}
              type="email"
              placeholder="name@example.com"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Password
            </label>
            <span className="text-[10px] text-slate-400">Min. 8 characters</span>
          </div>

          <div className="relative group">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 group-focus-within:text-indigo-400 transition-colors">
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
              className={`${inputCls} pl-10 pr-11`}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-white transition-colors focus:outline-none"
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

          {/* Password strength meter */}
          {form.password && (
            <div className="mt-2 space-y-1 animate-fadeIn">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400">Password strength:</span>
                <span className={`font-bold ${pwdStrength.text}`}>{pwdStrength.label}</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 h-1">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-full rounded-full transition-all duration-300 ${
                      step <= pwdStrength.score ? pwdStrength.color : "bg-slate-800"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Terms agreement */}
        <div className="pt-1">
          <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500/30 accent-indigo-600 shrink-0"
            />
            <span className="text-slate-400 text-[11px] leading-tight">
              I agree to the{" "}
              <span className="text-indigo-400 hover:underline">Terms of Service</span> and{" "}
              <span className="text-indigo-400 hover:underline">Privacy Policy</span>.
            </span>
          </label>
        </div>

        {/* Error message */}
        {error && (
          <div className="rounded-xl bg-red-950/70 border border-red-500/40 p-3 text-xs text-red-200 flex items-center gap-2.5">
            <span className="text-base text-red-400">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Success message */}
        {success && (
          <div className="rounded-xl bg-emerald-950/70 border border-emerald-500/40 p-3 text-xs text-emerald-200 flex items-center gap-2.5">
            <span className="text-base text-emerald-400">✅</span>
            <span>{success}</span>
          </div>
        )}

        {/* Submit button */}
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
              <span>Creating your account...</span>
            </>
          ) : (
            <>
              <span>Create Free Account</span>
              <span className="text-sm">→</span>
            </>
          )}
        </button>
      </form>

      {/* Switch to Login link */}
      <p className="mt-5 text-center text-xs text-slate-400">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-bold text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition"
        >
          Sign in here
        </Link>
      </p>

      {/* Trust & Security Badge */}
      <div className="mt-5 flex items-center justify-center gap-2 text-[10px] text-slate-500 pt-3 border-t border-slate-800/60">
        <span>🛡️ 100% Free Signup</span>
        <span>•</span>
        <span>No Credit Card Required</span>
      </div>
    </AuthShell>
  );
}
