"use client";

import { useEffect, useId, useState } from "react";
import { groupIndian, inWords } from "@/lib/finance";

export function MoneyField({
  label, value, onChange, hint, max = 1_000_000_000, warning,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  hint?: string;
  max?: number;
  warning?: string;
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  const words = inWords(value);
  const tooBig = value > max;
  const showWarn = !!warning && !tooBig;
  const hasDescription = tooBig || showWarn || !!hint;

  return (
    <div>
      <label className="field-label" htmlFor={id}>{label}</label>
      <div
        className={`flex items-stretch overflow-hidden rounded-xl border bg-white/80 transition focus-within:ring-2 focus-within:ring-sage-400/30 ${
          tooBig
            ? "border-clay focus-within:border-clay focus-within:ring-clay/30"
            : showWarn
            ? "border-brass focus-within:border-brass"
            : "border-sage-100 focus-within:border-sage-600"
        }`}
      >
        <span
          aria-hidden="true"
          className="flex select-none items-center border-r border-sage-100 bg-sage-50 px-4 text-lg font-semibold text-sage-700"
        >
          ₹
        </span>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          placeholder="0"
          aria-describedby={hasDescription ? hintId : undefined}
          aria-invalid={tooBig || showWarn ? "true" : undefined}
          className="min-w-0 flex-1 bg-transparent px-4 py-3 text-lg font-medium text-ink outline-none"
          value={groupIndian(value)}
          onChange={(e) => {
            const digits = e.target.value.replace(/[^0-9]/g, "");
            const raw = digits === "" ? 0 : parseInt(digits, 10);
            onChange(Math.min(max, Math.max(0, Number.isFinite(raw) ? raw : 0)));
          }}
        />
        {words && !tooBig && (
          <span aria-hidden="true" className="flex select-none items-center whitespace-nowrap px-3 text-xs font-semibold text-sage-600">
            {words}
          </span>
        )}
      </div>
      {tooBig ? (
        <p id={hintId} role="alert" className="mt-1 text-xs font-medium text-clay">
          That looks too large — please check the amount.
        </p>
      ) : showWarn ? (
        <p id={hintId} role="alert" className="mt-1 text-xs font-medium text-[#8a6d1f]">
          ⚠ {warning}
        </p>
      ) : (
        hint && <p id={hintId} className="mt-1 text-xs text-sage-600">{hint}</p>
      )}
    </div>
  );
}

export function NumField({
  label, value, onChange, min = 0, max, step = 1, suffix, error, warning,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  error?: string;
  warning?: string;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  // Local text buffer so the user can clear/retype freely without the value
  // snapping to min/max mid-typing. We emit numbers on change and clamp on blur.
  const [text, setText] = useState<string>(String(value ?? ""));

  // Keep buffer in sync when the value changes from outside (e.g. sample/reset),
  // but not while the user is actively editing the same number.
  useEffect(() => {
    if (parseFloat(text) !== value) setText(value === 0 && text === "" ? "" : String(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const invalid = !!error || (max !== undefined && value > max) || value < min;

  return (
    <div>
      <label className="field-label" htmlFor={id}>{label}</label>
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          aria-describedby={error ? errorId : undefined}
          aria-invalid={invalid ? "true" : undefined}
          className={`field-input ${suffix ? "pr-12" : ""} ${invalid ? "border-clay focus:border-clay focus:ring-clay/30" : ""}`}
          value={text}
          onChange={(e) => {
            const t = e.target.value;
            if (!/^\d*$/.test(t)) return;
            setText(t);
            if (t !== "") onChange(parseInt(t, 10));
          }}
          onBlur={() => {
            let n = text === "" ? min : parseInt(text, 10);
            if (!Number.isFinite(n)) n = min;
            if (n < min) n = min;
            if (max !== undefined && n > max) n = max;
            setText(String(n));
            onChange(n);
          }}
        />
        {suffix && (
          <span aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-sage-400">
            {suffix}
          </span>
        )}
      </div>
      {error ? (
        <p id={errorId} role="alert" className="mt-1 text-xs font-medium text-clay">{error}</p>
      ) : warning ? (
        <p id={errorId} role="alert" className="mt-1 text-xs font-medium text-[#8a6d1f]">⚠ {warning}</p>
      ) : null}
    </div>
  );
}

export function ChoiceField<T extends string>({
  label, value, onChange, options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <fieldset>
      <legend className="field-label">{label}</legend>
      <div className="flex gap-2" role="radiogroup">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            onClick={() => onChange(o.value)}
            className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
              value === o.value
                ? "border-sage-600 bg-sage-900 text-paper"
                : "border-sage-100 bg-white/70 text-ink hover:border-sage-400"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
