"use client";

import { useState } from "react";
import { calcGoal, FinancialGoal, GOAL_PRESETS, groupIndian, inrCompact, ProfileInput } from "@/lib/finance";

let idCounter = 0;
const newId = () => `g${++idCounter}`;

export default function GoalsPlanner({ profile, surplus }: { profile: ProfileInput; surplus: number }) {
  const [goals, setGoals] = useState<FinancialGoal[]>([
    { id: newId(), name: "Child's higher education", presentCost: 2500000, yearsAway: 15 },
  ]);

  const addPreset = (preset: (typeof GOAL_PRESETS)[number]) =>
    setGoals((g) => [...g, { id: newId(), ...preset }]);
  const addBlank = () => setGoals((g) => [...g, { id: newId(), name: "My goal", presentCost: 1000000, yearsAway: 5 }]);
  const remove = (id: string) => setGoals((g) => g.filter((x) => x.id !== id));
  const update = (id: string, patch: Partial<FinancialGoal>) =>
    setGoals((g) => g.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const results = goals.map((g) => calcGoal(g, profile.inflation, profile.preReturn));
  const totalSIP = results.reduce((s, r) => s + r.monthlySIP, 0);
  const usedPresets = new Set(goals.map((g) => g.name));

  // Affordability against monthly surplus (income − expenses − EMIs)
  const affordable = totalSIP <= surplus;
  const leftover = surplus - totalSIP;

  return (
    <div>
      <div className="mb-3 flex items-end justify-between">
        <h3 className="font-display text-xl font-600 text-ink">Plan your life goals</h3>
        {totalSIP > 0 && (
          <div className="text-right">
            <div className="text-xs font-semibold uppercase tracking-wide text-sage-600">Combined monthly investment</div>
            <div className="font-display text-2xl font-700 text-sage-700">{inrCompact(totalSIP)}<span className="text-sm font-500 text-sage-600">/mo</span></div>
          </div>
        )}
      </div>

      <p className="mb-4 text-sm text-sage-600">
        Add goals like a child&apos;s education or marriage, a home, or early retirement. We inflate each goal to its target year and show the monthly SIP needed to reach it (at your assumed {profile.preReturn}% growth, {profile.inflation}% inflation).
      </p>

      {/* affordability banner */}
      {totalSIP > 0 && (
        <div className={`mb-5 rounded-xl border px-4 py-3 text-sm ${affordable ? "border-sage-400 bg-sage-50/60 text-sage-700" : "border-clay bg-[#f7e4df] text-clay"}`}>
          {surplus <= 0 ? (
            <span>You currently have no monthly surplus to invest. Free up cash by reducing expenses or EMIs before committing to these goals.</span>
          ) : affordable ? (
            <span>
              <strong>You can afford this.</strong> These goals need {inrCompact(totalSIP)}/mo and your monthly surplus is {inrCompact(surplus)} — leaving {inrCompact(leftover)} spare to invest or save further.
            </span>
          ) : (
            <span>
              <strong>This exceeds your surplus.</strong> These goals need {inrCompact(totalSIP)}/mo but you have {inrCompact(surplus)} available — a shortfall of {inrCompact(totalSIP - surplus)}/mo. Consider longer timelines, trimming goals, or raising income.
            </span>
          )}
        </div>
      )}

      {/* preset chips */}
      <div className="mb-5 flex flex-wrap gap-2">
        {GOAL_PRESETS.filter((p) => !usedPresets.has(p.name)).map((p) => (
          <button
            key={p.name}
            onClick={() => addPreset(p)}
            className="rounded-full border border-sage-100 bg-white/70 px-3 py-1.5 text-xs font-medium text-sage-700 transition hover:border-sage-400"
          >
            + {p.name}
          </button>
        ))}
        <button onClick={addBlank} className="rounded-full border border-dashed border-sage-400 px-3 py-1.5 text-xs font-semibold text-sage-700 transition hover:bg-sage-50">
          + Custom goal
        </button>
      </div>

      <div className="space-y-3">
        {results.map((r) => (
          <div key={r.id} className="rounded-2xl border border-sage-100 bg-white/70 p-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-[160px] flex-1">
                <label className="field-label">Goal</label>
                <input
                  className="field-input !py-2 !text-base"
                  value={r.name}
                  onChange={(e) => update(r.id, { name: e.target.value })}
                />
              </div>
              <div className="w-40">
                <label className="field-label">Cost today</label>
                <div className="flex items-stretch overflow-hidden rounded-xl border border-sage-100 bg-white/80 transition focus-within:border-sage-600 focus-within:ring-2 focus-within:ring-sage-400/30">
                  <span className="flex select-none items-center border-r border-sage-100 bg-sage-50 px-2.5 text-sage-700">₹</span>
                  <input
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
                <label className="field-label">Years away</label>
                <input
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
                onClick={() => remove(r.id)}
                aria-label="Remove goal"
                className="mb-0.5 rounded-lg px-2.5 py-2 text-sage-400 transition hover:bg-[#f7e4df] hover:text-clay"
              >
                ✕
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 border-t border-sage-100 pt-3 text-sm">
              <span className="text-sage-600">Future cost: <strong className="text-ink">{inrCompact(r.futureCost)}</strong></span>
              <span className="text-sage-600">Invest <strong className="text-sage-700">{inrCompact(r.monthlySIP)}/mo</strong> to reach it</span>
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
