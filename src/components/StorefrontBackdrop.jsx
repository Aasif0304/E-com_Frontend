/**
 * Subtle animated ambient gradient & dot-grid backdrop for storefront pages.
 * Replaces flat white/slate backgrounds without reducing card/text contrast.
 */
export default function StorefrontBackdrop() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-gradient-to-br from-slate-50 via-[#f2f6ff] to-indigo-50/75"
      aria-hidden="true"
    >
      {/* Subtle architectural dot pattern */}
      <div
        className="absolute inset-0 opacity-55"
        style={{
          backgroundImage:
            "radial-gradient(rgba(36, 71, 214, 0.09) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />

      {/* Animated drifting gradient orbs */}
      <div className="animate-ambient-a absolute -top-28 -left-24 h-[420px] w-[420px] rounded-full bg-indigo-300/30 blur-3xl will-change-transform" />
      <div className="animate-ambient-b absolute top-1/4 -right-28 h-[460px] w-[460px] rounded-full bg-sky-300/25 blur-3xl will-change-transform" />
      <div className="animate-ambient-c absolute -bottom-32 left-1/4 h-[440px] w-[440px] rounded-full bg-violet-300/25 blur-3xl will-change-transform" />
      <div className="animate-ambient-a absolute bottom-12 right-1/5 h-[300px] w-[300px] rounded-full bg-amber-200/25 blur-3xl will-change-transform" />
    </div>
  );
}

