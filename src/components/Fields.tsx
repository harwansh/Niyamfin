"use client";

export function NumberField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  min = 0,
  max,
  step = 1,
  slider = true,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  slider?: boolean;
}) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-sage-400">
            {prefix}
          </span>
        )}
        <input
          type="number"
          className={`field-input ${prefix ? "pl-9" : ""} ${suffix ? "pr-12" : ""}`}
          value={Number.isFinite(value) ? value : 0}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-sage-400">
            {suffix}
          </span>
        )}
      </div>
      {slider && max !== undefined && (
        <input
          type="range"
          className="range mt-3"
          value={Number.isFinite(value) ? value : 0}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(parseFloat(e.target.value))}
        />
      )}
    </div>
  );
}

export function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "brass" | "clay" | "sage";
}) {
  const color =
    accent === "brass" ? "text-brass" : accent === "clay" ? "text-clay" : "text-sage-700";
  return (
    <div className="rounded-xl border border-sage-100 bg-white/70 px-4 py-3">
      <div className="field-label mb-0.5">{label}</div>
      <div className={`font-display text-2xl font-600 leading-tight ${color}`}>{value}</div>
    </div>
  );
}
