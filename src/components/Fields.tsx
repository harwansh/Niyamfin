"use client";

import { groupIndian, inWords } from "@/lib/finance";

export function MoneyField({
  label, value, onChange, hint, max = 1_000_000_000,
}: { label: string; value: number; onChange: (n: number) => void; hint?: string; max?: number }) {
  const words = inWords(value);
  const tooBig = value > max;
  return (
    <div>
      <label className="field-label">{label}</label>
      <div
        className={`flex items-stretch overflow-hidden rounded-xl border bg-white/80 transition focus-within:ring-2 focus-within:ring-sage-400/30 ${
          tooBig ? "border-clay focus-within:border-clay focus-within:ring-clay/30" : "border-sage-100 focus-within:border-sage-600"
        }`}
      >
        <span className="flex select-none items-center border-r border-sage-100 bg-sage-50 px-4 text-lg font-semibold text-sage-700">
          ₹
        </span>
        <input
          type="text"
          inputMode="numeric"
          placeholder="0"
          className="min-w-0 flex-1 bg-transparent px-4 py-3 text-lg font-medium text-ink outline-none"
          value={groupIndian(value)}
          onChange={(e) => {
            const digits = e.target.value.replace(/[^0-9]/g, "");
            const raw = digits === "" ? 0 : parseInt(digits, 10);
            onChange(Math.min(max, Math.max(0, Number.isFinite(raw) ? raw : 0)));
          }}
        />
        {words && !tooBig && (
          <span className="flex select-none items-center whitespace-nowrap px-3 text-xs font-semibold text-sage-600">
            {words}
          </span>
        )}
      </div>
      {tooBig ? (
        <p className="mt-1 text-xs font-medium text-clay">That looks too large — please check the amount.</p>
      ) : (
        hint && <p className="mt-1 text-xs text-sage-600">{hint}</p>
      )}
    </div>
  );
}

export function NumField({
  label, value, onChange, min = 0, max, step = 1, suffix, error,
}: { label: string; value: number; onChange: (n: number) => void; min?: number; max?: number; step?: number; suffix?: string; error?: string }) {
  const invalid = !!error || (max !== undefined && value > max) || value < min;
  return (
    <div>
      <label className="field-label">{label}</label>
      <div className="relative">
        <input
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step={step}
          className={`field-input ${suffix ? "pr-12" : ""} ${invalid ? "border-clay focus:border-clay focus:ring-clay/30" : ""}`}
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        />
        {suffix && <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-sage-400">{suffix}</span>}
      </div>
      {error && <p className="mt-1 text-xs font-medium text-clay">{error}</p>}
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
