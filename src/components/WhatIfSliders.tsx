"use client";

import { useState } from "react";
import { buildReport, inrCompact, ProfileInput, Report } from "@/lib/finance";
import { sanitizeProfile } from "@/lib/validation";

interface Override {
  inflation: number;
  preReturn: number;
  postReturn: number;
  retireAge: number;
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wide text-sage-700">{label}</label>
        <span className="rounded-full bg-sage-100 px-2 py-0.5 text-xs font-bold text-sage-700">
          {value}{suffix}
        </span>
      </div>
      <input
        type="range"
        className="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="flex justify-between text-[10px] text-sage-400">
        <span>{min}{suffix}</span>
        <span>{max}{suffix}</span>
      </div>
    </div>
  );
}

function Delta({ base, alt, label, good }: { base: number; alt: number; label: string; good: "higher" | "lower" }) {
  const diff = alt - base;
  if (Math.abs(diff) < 1) return null;
  const positive = diff > 0;
  const isGood = good === "higher" ? positive : !positive;
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-sage-600">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sage-500 line-through text-xs">{inrCompact(base)}</span>
        <span className={`font-semibold ${isGood ? "text-sage-700" : "text-clay"}`}>
          {positive ? "▲" : "▼"} {inrCompact(Math.abs(diff))} → {inrCompact(alt)}
        </span>
      </div>
    </div>
  );
}

export default function WhatIfSliders({
  profile,
  baseReport,
}: {
  profile: ProfileInput;
  baseReport: Report;
}) {
  const [ov, setOv] = useState<Override>({
    inflation: profile.inflation,
    preReturn: profile.preReturn,
    postReturn: profile.postReturn,
    retireAge: profile.retireAge,
  });

  const set = <K extends keyof Override>(k: K, v: Override[K]) =>
    setOv((o) => ({ ...o, [k]: v }));

  const altProfile = sanitizeProfile({ ...profile, ...ov });
  const altReport = buildReport(altProfile);

  const changed =
    ov.inflation !== profile.inflation ||
    ov.preReturn !== profile.preReturn ||
    ov.postReturn !== profile.postReturn ||
    ov.retireAge !== profile.retireAge;

  const reset = () =>
    setOv({
      inflation: profile.inflation,
      preReturn: profile.preReturn,
      postReturn: profile.postReturn,
      retireAge: profile.retireAge,
    });

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <h3 className="font-display text-xl font-600 text-ink">What-if scenario</h3>
        {changed && (
          <button
            onClick={reset}
            className="rounded-lg px-3 py-1 text-xs font-semibold text-sage-600 transition hover:bg-sage-50"
          >
            Reset to defaults
          </button>
        )}
      </div>
      <p className="mb-5 text-sm text-sage-600">
        Drag the sliders to see how changes in key assumptions affect your retirement picture in real time.
        Your original report is unchanged.
      </p>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-sage-100 bg-white/70 p-5">
          <SliderRow label="Inflation" value={ov.inflation} min={2} max={12} step={0.5} suffix="%" onChange={(v) => set("inflation", v)} />
          <SliderRow label="Pre-retirement return" value={ov.preReturn} min={4} max={18} step={0.5} suffix="%" onChange={(v) => set("preReturn", v)} />
          <SliderRow label="Post-retirement return" value={ov.postReturn} min={3} max={12} step={0.5} suffix="%" onChange={(v) => set("postReturn", v)} />
          <SliderRow label="Retirement age" value={ov.retireAge} min={40} max={75} step={1} suffix=" yrs" onChange={(v) => set("retireAge", v)} />
        </div>

        <div className="space-y-3 rounded-2xl border border-sage-100 bg-sage-50/40 p-5">
          <div className="mb-2 text-xs font-bold uppercase tracking-wide text-sage-600">
            {changed ? "Impact vs your original report" : "Adjust sliders to see impact"}
          </div>

          {changed ? (
            <>
              <Delta
                base={baseReport.retirementCorpusNeeded}
                alt={altReport.retirementCorpusNeeded}
                label="Corpus needed"
                good="lower"
              />
              <Delta
                base={baseReport.retirementProjected}
                alt={altReport.retirementProjected}
                label="Projected savings"
                good="higher"
              />
              <Delta
                base={baseReport.retirementGap}
                alt={altReport.retirementGap}
                label="Retirement gap"
                good="lower"
              />
              <Delta
                base={baseReport.retirementSIP}
                alt={altReport.retirementSIP}
                label="Monthly SIP to close gap"
                good="lower"
              />
              <div className="mt-3 border-t border-sage-100 pt-3">
                <div className="mb-1 text-xs font-semibold text-sage-600">Retirement gap</div>
                <div className="flex items-end gap-3">
                  <div>
                    <div className="text-[10px] text-sage-400">Original</div>
                    <div className="font-display text-lg font-700 text-brass">
                      {inrCompact(baseReport.retirementGap || 0)}
                    </div>
                  </div>
                  <div className="text-sage-300">→</div>
                  <div>
                    <div className="text-[10px] text-sage-400">What-if</div>
                    <div className={`font-display text-lg font-700 ${altReport.retirementGap <= baseReport.retirementGap ? "text-sage-700" : "text-clay"}`}>
                      {inrCompact(altReport.retirementGap || 0)}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-32 items-center justify-center text-center text-sm text-sage-400">
              Move a slider above to<br />see how it affects your numbers.
            </div>
          )}
        </div>
      </div>

      <p className="mt-3 text-xs text-sage-500">
        All figures are illustrative estimates based on the formulas described in the Methodology page. Past returns do not guarantee future results.
      </p>
    </div>
  );
}
