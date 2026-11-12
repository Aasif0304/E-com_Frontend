import storeBg from "../assets/store-bg.jpg";

export default function PurchaseHeader({
  badge,
  title,
  subtitle,
  step,
  rightSlot,
}) {
  const steps = [
    { num: 1, label: "Cart" },
    { num: 2, label: "Delivery & Pay" },
    { num: 3, label: "Confirmed" },
  ];

  return (
    <div className="relative z-10 overflow-hidden bg-slate-900 border-b border-white/10">
      {/* Store Interior Background */}
      <img
        src={storeBg}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover object-center opacity-80"
      />
      {/* Balanced Editorial Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/55 to-indigo-950/75" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="flex flex-col gap-4 sm:gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {badge && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold text-amber-200 backdrop-blur-md mb-2">
                <span>✨</span>
                <span>{badge}</span>
              </span>
            )}
            <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white drop-shadow-sm">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 text-xs sm:text-sm text-slate-200/90 max-w-xl">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex flex-col items-start sm:items-end gap-2.5 sm:gap-3">
            {step && (
              <div className="inline-flex max-w-full overflow-x-auto no-scrollbar items-center gap-1.5 sm:gap-2.5 rounded-2xl border border-white/15 bg-slate-950/55 px-2.5 py-1.5 sm:px-3.5 sm:py-2 backdrop-blur-xl shadow-lg whitespace-nowrap">
                {steps.map((s, idx) => {
                  const isDone = step > s.num;
                  const isCurrent = step === s.num;
                  return (
                    <div key={s.num} className="flex items-center gap-1 sm:gap-2 shrink-0">
                      <div className="flex items-center gap-1 sm:gap-1.5">
                        <span
                          className={`flex h-4.5 w-4.5 sm:h-5 sm:w-5 items-center justify-center rounded-full text-[9px] sm:text-[10px] font-black transition ${
                            isDone
                              ? "bg-emerald-500 text-white"
                              : isCurrent
                              ? "bg-brand text-white ring-2 ring-indigo-300/60"
                              : "bg-white/15 text-slate-300"
                          }`}
                        >
                          {isDone ? "✓" : s.num}
                        </span>
                        <span
                          className={`text-[10px] sm:text-[11px] font-semibold ${
                            isCurrent
                              ? "text-white"
                              : isDone
                              ? "text-emerald-300"
                              : "text-slate-400"
                          }`}
                        >
                          {s.label}
                        </span>
                      </div>
                      {idx < steps.length - 1 && (
                        <span className="text-slate-400 text-xs">›</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {rightSlot}
          </div>
        </div>
      </div>
    </div>
  );
}

