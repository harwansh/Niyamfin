"use client";

export function MoneyField({
  label, value, onChange, hint,
}: { label: string; value: number; onChange: (n: number) => void; hint?: string }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-sage-400">₹</span>
        <input
          type="number" min={0} step={1000}
          className="field-input pl-9"
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(Math.max(0, parseFloat(e.target.value) || 0))}
        />
      </div>
      {hint && <p className="mt-1 text-xs text-sage-600">{hint}</p>}
    </div>
  );
}

export function NumField({
  label, value, onChange, min = 0, max, step = 1, suffix,
}: { label: string; value: number; onChange: (n: number) => void; min?: number; max?: number; step?: number; suffix?: string }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <div className="relative">
        <input
          type="number" min={min} max={max} step={step}
          className={`field-input ${suffix ? "pr-12" : ""}`}
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        />
        {suffix && <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-sage-400">{suffix}</span>}
      </div>
    </div>
  );
}

export function ChoiceField<T extends string>({
  label, value, onChange, options,
}: { label: string; value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <div className="flex gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
              value === o.value ? "border-sage-600 bg-sage-900 text-paper" : "border-sage-100 bg-white/70 text-ink hover:border-sage-400"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
