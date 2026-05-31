"use client";

import { useState } from "react";
import { calcGoal, calcSipStepUp, FinancialGoal, GOAL_PRESETS, groupIndian, inrCompact, ProfileInput } from "@/lib/finance";

let idCounter = 0;
const newId = () => `g${++idCounter}`;

export default function GoalsPlanner({ profile, surplus }: { profile: ProfileInput; surplus: number }) {
  const [goals, setGoals] = useState<FinancialGoal[]>([
    { id: newId(), name: "Child's higher education", presentCost: 2500000, yearsAway: 15 },
  ]);
  const [useStepUp, setUseStepUp] = useState(false);
  const [stepUpPct, setStepUpPct] = useState(10);

  const addPreset = (preset: (typeof GOAL_PRESETS)[number]) =>
    setGoals((g) => [...g, { id: newId(), ...preset }]);
  const addBlank = () =>
    setGoals((g) => [...g, { id: newId(), name: "My goal", presentCost: 1000000, yearsAway: 5 }]);
  const remove = (id: string) => setGoals((g) => g.filter((x) => x.id !== id));
  const update = (id: string, patch: Partial<FinancialGoal>) =>
    setGoals((g) => g.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const results = goals.map((g) => {
    const base = calcGoal(g, profile.inflation, profile.preReturn);
    if (useStepUp) {
      const stepUpSIP = calcSipStepUp(
        base.futureCost,
        Math.max(1, g.yearsAway) * 12,
        profile.preReturn,
        stepUpPct,
      );
      return { ...base, stepUpSIP };
    }
    return base;
  });

  const totalSIP = results.reduce((s, r) => s + (useStepUp ? (r.stepUpSIP ?? r.monthlySIP) : r.monthlySIP), 0);
  const usedPresets = new Set(goals.map((g) => g.name));
  const affordable = totalSIP <= surplus;
  const leftover = surplus - totalSIP;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <h3 className="font-display text-xl font-600 text-ink">Plan your life goals</h3>
        {totalSIP > 0 && (
          <div className="text-right">
            <div className="text-xs font-semibold uppercase tracking-wide text-sage-600">Combined monthly investment</div>
            <div className="font-display text-2xl font-700 text-sage-700">
              {inrCompact(totalSIP)}<span className="text-sm font-500 text-sage-600">/mo</span>
              {useStepUp && <span className="ml-1 text-xs text-sage-500">(year 1)</span>}
            </div>
          </div>
        )}
      </div>

      <p className="mb-4 text-sm text-sage-600">
        Add goals like a child&apos;s education or marriage, a home, or early retirement. We inflate each goal to its
        target year and show the monthly SIP needed to reach it (at your assumed {profile.preReturn}% growth, {profile.inflation}% inflation).
      </p>

      {/* Step-up SIP toggle */}
      <div className="mb-5 rounded-xl border border-sage-100 bg-white/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-semibold text-sm text-ink">Step-up SIP</div>
            <p className="text-xs text-sage-600 mt-0.5">
              Increase your SIP annually as income grows — the first-year SIP is lower, and you invest more each year.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={useStepUp}
            onClick={() => setUseStepUp((v) => !v)}
            className={`relative h-6 w-11 rounded-full transition ${useStepUp ? "bg-sage-600" : "bg-sage-200"}`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${useStepUp ? "left-5" : "left-0.5"}`}
            />
            <span className="sr-only">{useStepUp ? "Disable step-up SIP" : "Enable step-up SIP"}</span>
          </button>
        </div>

        {useStepUp && (
          <div className="mt-3 border-t border-sage-100 pt-3">
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor="stepup-slider" className="text-xs font-semibold uppercase tracking-wide text-sage-700">
                Annual step-up rate
              </label>
              <span className="rounded-full bg-sage-100 px-2 py-0.5 text-xs font-bold text-sage-700">
                {stepUpPct}% / year
              </span>
            </div>
            <input
              id="stepup-slider"
              type="range"
              className="range"
              min={1}
              max={25}
              step={1}
              value={stepUpPct}
              aria-label="Annual step-up rate"
              aria-valuemin={1}
              aria-valuemax={25}
              aria-valuenow={stepUpPct}
              onChange={(e) => setStepUpPct(Number(e.target.value))}
            />
            <div className="flex justify-between text-[10px] text-sage-400">
              <span>1%</span><span>25%</span>
            </div>
          </div>
        )}
      </div>

      {/* affordability banner */}
      {totalSIP > 0 && (
        <div
          className={`mb-5 rounded-xl border px-4 py-3 text-sm ${affordable ? "border-sage-400 bg-sage-50/60 text-sage-700" : "border-clay bg-[#f7e4df] text-clay"}`}
          role="status"
        >
          {surplus <= 0 ? (
            <span>You currently have no monthly surplus to invest. Free up cash by reducing expenses or EMIs before committing to these goals.</span>
          ) : affordable ? (
            <span>
              <strong>You can afford this.</strong> These goals need {inrCompact(totalSIP)}/mo and your monthly surplus is{" "}
              {inrCompact(surplus)} — leaving {inrCompact(leftover)} spare to invest or save further.
            </span>
          ) : (
            <span>
              <strong>This exceeds your surplus.</strong> These goals need {inrCompact(totalSIP)}/mo but you have{" "}
              {inrCompact(surplus)} available — a shortfall of {inrCompact(totalSIP - surplus)}/mo. Consider longer
              timelines, trimming goals, or raising income.
            </span>
          )}
        </div>
      )}

      {/* preset chips */}
      <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Add goal presets">
        {GOAL_PRESETS.filter((p) => !usedPresets.has(p.name)).map((p) => (
          <button
            key={p.name}
            type="button"
            onClick={() => addPreset(p)}
            className="rounded-full border border-sage-100 bg-white/70 px-3 py-1.5 text-xs font-medium text-sage-700 transition hover:border-sage-400"
          >
            + {p.name}
          </button>
        ))}
        <button
          type="button"
          onClick={addBlank}
          className="rounded-full border border-dashed border-sage-400 px-3 py-1.5 text-xs font-semibold text-sage-700 transition hover:bg-sage-50"
        >
          + Custom goal
        </button>
      </div>

      <div className="space-y-3">
        {results.map((r) => (
          <div key={r.id} className="rounded-2xl border border-sage-100 bg-white/70 p-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-[140px] flex-1">
                <label className="field-label" htmlFor={`goal-name-${r.id}`}>Goal</label>
                <input
                  id={`goal-name-${r.id}`}
                  className="field-input !py-2 !text-base"
                  value={r.name}
                  onChange={(e) => update(r.id, { name: e.target.value })}
                />
              </div>
              <div className="w-36 sm:w-40">
                <label className="field-label" htmlFor={`goal-cost-${r.id}`}>Cost today</label>
                <div className="flex items-stretch overflow-hidden rounded-xl border border-sage-100 bg-white/80 transition focus-within:border-sage-600 focus-within:ring-2 focus-within:ring-sage-400/30">
                  <span className="flex select-none items-center border-r border-sage-100 bg-sage-50 px-2.5 text-sage-700">₹</span>
                  <input
                    id={`goal-cost-${r.id}`}
                    type="text"
                    inputMode="numeric"
                    className="min-w-0 flex-1 bg-transparent px-3 py-2 text-base font-medium text-ink outline-none"
                    value={groupIndian(r.presentCost)}
                    placeholder="0"
                    onChange={(e) => {
                      const digits = e.target.value.replace(/[^0-9]/g, "");
                      update(r.id, { presentCost: digits === "" ? 0 : Math.max(0, parseInt(digits, 10)) });
                    }}
                  />
                </div>
              </div>
              <div className="w-24">
                <label className="field-label" htmlFor={`goal-years-${r.id}`}>Years away</label>
                <input
                  id={`goal-years-${r.id}`}
                  type="text"
                  inputMode="numeric"
                  className="field-input !py-2 !text-base"
                  value={r.yearsAway === 0 ? "" : r.yearsAway}
                  onChange={(e) => {
                    const t = e.target.value;
                    if (!/^\d*$/.test(t)) return;
                    update(r.id, { yearsAway: t === "" ? 0 : parseInt(t, 10) });
                  }}
                  onBlur={() => update(r.id, { yearsAway: Math.min(50, Math.max(1, r.yearsAway || 1)) })}
                />
              </div>
              <button
                type="button"
                onClick={() => remove(r.id)}
                aria-label={`Remove goal: ${r.name}`}
                className="mb-0.5 rounded-lg px-2.5 py-2 text-sage-400 transition hover:bg-[#f7e4df] hover:text-clay"
              >
                ✕
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 border-t border-sage-100 pt-3 text-sm">
              <span className="text-sage-600">
                Future cost: <strong className="text-ink">{inrCompact(r.futureCost)}</strong>
              </span>
              {useStepUp && r.stepUpSIP !== undefined ? (
                <>
                  <span className="text-sage-600">
                    Flat SIP: <strong className="text-sage-500 line-through">{inrCompact(r.monthlySIP)}/mo</strong>
                  </span>
                  <span className="text-sage-600">
                    Step-up SIP (yr 1): <strong className="text-sage-700">{inrCompact(r.stepUpSIP)}/mo</strong>
                  </span>
                </>
              ) : (
                <span className="text-sage-600">
                  Invest <strong className="text-sage-700">{inrCompact(r.monthlySIP)}/mo</strong> to reach it
                </span>
              )}
            </div>
          </div>
        ))}
        {goals.length === 0 && (
          <p className="rounded-xl border border-dashed border-sage-100 py-8 text-center text-sm text-sage-600">
            No goals yet — add one above to see the monthly investment needed.
          </p>
        )}
      </div>
    </div>
  );
}
