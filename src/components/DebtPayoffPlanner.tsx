"use client";

import { useMemo, useState } from "react";
import { calcDebtPayoff, DebtItem, inrCompact, ProfileInput } from "@/lib/finance";

const DEFAULT_RATES: Record<string, number> = {
  homeLoan: 8.5,
  otherLoans: 12,
  creditCardDues: 36,
};

function buildDebts(p: ProfileInput): DebtItem[] {
  const items: DebtItem[] = [];
  if (p.homeLoan > 0)
    items.push({
      id: "homeLoan",
      name: "Home loan",
      balance: p.homeLoan,
      annualRate: DEFAULT_RATES.homeLoan,
      minPayment: Math.round(p.totalEmi * (p.homeLoan / (p.homeLoan + p.otherLoans + p.creditCardDues + 1))),
    });
  if (p.otherLoans > 0)
    items.push({
      id: "otherLoans",
      name: "Other loans",
      balance: p.otherLoans,
      annualRate: DEFAULT_RATES.otherLoans,
      minPayment: Math.round(p.totalEmi * (p.otherLoans / (p.homeLoan + p.otherLoans + p.creditCardDues + 1))),
    });
  if (p.creditCardDues > 0)
    items.push({
      id: "creditCardDues",
      name: "Credit card",
      balance: p.creditCardDues,
      annualRate: DEFAULT_RATES.creditCardDues,
      minPayment: Math.round(p.creditCardDues * 0.05), // 5% min payment
    });
  return items;
}

export default function DebtPayoffPlanner({ profile }: { profile: ProfileInput }) {
  const totalDebt = profile.homeLoan + profile.otherLoans + profile.creditCardDues;
  const [debts, setDebts] = useState<DebtItem[]>(() => buildDebts(profile));
  const [extra, setExtra] = useState(0);
  const [strategy, setStrategy] = useState<"avalanche" | "snowball">("avalanche");

  const avalanche = useMemo(() => calcDebtPayoff(debts, extra, "avalanche"), [debts, extra]);
  const snowball = useMemo(() => calcDebtPayoff(debts, extra, "snowball"), [debts, extra]);
  const chosen = strategy === "avalanche" ? avalanche : snowball;
  const baseline = useMemo(() => calcDebtPayoff(debts, 0, strategy), [debts, strategy]);

  const interestSaved = Math.max(0, baseline.totalInterest - chosen.totalInterest);
  const monthsSaved = Math.max(0, baseline.monthsToFree - chosen.monthsToFree);

  if (totalDebt <= 0) return null;

  const updateRate = (id: string, rate: number) =>
    setDebts((ds) => ds.map((d) => (d.id === id ? { ...d, annualRate: rate } : d)));

  const updateMin = (id: string, min: number) =>
    setDebts((ds) => ds.map((d) => (d.id === id ? { ...d, minPayment: min } : d)));

  return (
    <div>
      <h3 className="mb-1 font-display text-xl font-600 text-ink">Debt payoff planner</h3>
      <p className="mb-5 text-sm text-sage-600">
        See how long it takes to clear your debt and how much extra payments save. Interest rates are estimated —
        adjust them to match your actual loan terms.
      </p>

      {/* Debt items */}
      <div className="mb-5 space-y-3">
        {debts.map((d) => (
          <div key={d.id} className="rounded-2xl border border-sage-100 bg-white/70 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-display text-base font-600 text-ink">{d.name}</span>
              <span className="text-sm font-semibold text-sage-700">{inrCompact(d.balance)}</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor={`rate-${d.id}`}>
                  Interest rate (annual %)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id={`rate-${d.id}`}
                    type="range"
                    className="range flex-1"
                    min={1}
                    max={48}
                    step={0.5}
                    value={d.annualRate}
                    aria-label={`${d.name} interest rate`}
                    onChange={(e) => updateRate(d.id, Number(e.target.value))}
                  />
                  <span className="w-12 text-right text-sm font-bold text-sage-700">{d.annualRate}%</span>
                </div>
              </div>
              <div>
                <label className="field-label" htmlFor={`min-${d.id}`}>
                  Min. monthly payment
                </label>
                <div className="flex items-stretch overflow-hidden rounded-xl border border-sage-100 bg-white/80">
                  <span className="flex select-none items-center border-r border-sage-100 bg-sage-50 px-3 text-sage-700">₹</span>
                  <input
                    id={`min-${d.id}`}
                    type="text"
                    inputMode="numeric"
                    className="min-w-0 flex-1 bg-transparent px-3 py-2 text-base font-medium text-ink outline-none"
                    value={d.minPayment || ""}
                    onChange={(e) => {
                      const v = parseInt(e.target.value.replace(/\D/g, ""), 10);
                      updateMin(d.id, isNaN(v) ? 0 : v);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Extra payment + strategy */}
      <div className="mb-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-sage-100 bg-white/70 p-4">
          <label className="field-label" htmlFor="extra-payment">Extra monthly payment</label>
          <div className="flex items-center gap-3">
            <input
              id="extra-payment"
              type="range"
              className="range flex-1"
              min={0}
              max={100000}
              step={1000}
              value={extra}
              aria-label="Extra monthly payment"
              onChange={(e) => setExtra(Number(e.target.value))}
            />
            <span className="w-20 text-right text-sm font-bold text-sage-700">{inrCompact(extra)}</span>
          </div>
          <p className="mt-1 text-xs text-sage-600">Extra payment over and above minimum EMIs each month.</p>
        </div>

        <div className="rounded-2xl border border-sage-100 bg-white/70 p-4">
          <fieldset>
            <legend className="field-label">Payoff strategy</legend>
            <div className="mt-2 flex gap-2">
              {(["avalanche", "snowball"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStrategy(s)}
                  aria-pressed={strategy === s}
                  className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition ${
                    strategy === s
                      ? "border-sage-600 bg-sage-900 text-paper"
                      : "border-sage-100 bg-white/70 text-ink hover:border-sage-400"
                  }`}
                >
                  {s === "avalanche" ? "Avalanche" : "Snowball"}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-sage-600">
              {strategy === "avalanche"
                ? "Avalanche: pay off highest-interest debt first — saves the most money."
                : "Snowball: pay off smallest balance first — fastest psychological wins."}
            </p>
          </fieldset>
        </div>
      </div>

      {/* Results */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-sage-100 bg-white/70 p-5 text-center">
          <div className="field-label">Debt-free in</div>
          <div className="font-display text-3xl font-700 text-sage-700">
            {chosen.monthsToFree >= 360 ? "30+ yrs" : chosen.monthsToFree >= 12
              ? `${Math.floor(chosen.monthsToFree / 12)}y ${chosen.monthsToFree % 12}m`
              : `${chosen.monthsToFree} mo`}
          </div>
          {monthsSaved > 0 && (
            <div className="mt-1 text-xs font-semibold text-sage-600">
              {monthsSaved} months sooner than no extra payment
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-sage-100 bg-white/70 p-5 text-center">
          <div className="field-label">Total interest paid</div>
          <div className="font-display text-3xl font-700 text-brass">{inrCompact(chosen.totalInterest)}</div>
          {interestSaved > 0 && (
            <div className="mt-1 text-xs font-semibold text-sage-600">
              Save {inrCompact(interestSaved)} vs. minimum only
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-sage-100 bg-white/70 p-5 text-center">
          <div className="field-label">Total amount paid</div>
          <div className="font-display text-3xl font-700 text-ink">{inrCompact(chosen.totalPaid)}</div>
          <div className="mt-1 text-xs text-sage-600">
            Principal {inrCompact(totalDebt)} + interest
          </div>
        </div>
      </div>

      {/* Strategy comparison */}
      {avalanche.monthsToFree !== snowball.monthsToFree && (
        <div className="mt-4 rounded-xl border border-sage-100 bg-sage-50/50 px-4 py-3 text-sm text-sage-700">
          <strong className="text-ink">Avalanche vs Snowball:</strong>{" "}
          {avalanche.totalInterest < snowball.totalInterest
            ? `Avalanche saves ${inrCompact(snowball.totalInterest - avalanche.totalInterest)} in interest.`
            : `Both strategies cost about the same in interest.`}{" "}
          {snowball.monthsToFree < avalanche.monthsToFree
            ? `Snowball finishes ${avalanche.monthsToFree - snowball.monthsToFree} months earlier.`
            : `Avalanche finishes ${snowball.monthsToFree - avalanche.monthsToFree} months earlier.`}
        </div>
      )}

      <p className="mt-3 text-xs text-sage-500">
        Interest rates are estimates (Home loan ~8.5%, Other loans ~12%, Credit card ~36%). Adjust sliders to match your actual rates. This is illustrative only.
      </p>
    </div>
  );
}
