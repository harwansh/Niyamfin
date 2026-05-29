"use client";

import { calcBudget, inr, inrCompact, ProfileInput } from "@/lib/finance";

function Bar({ label, value, of, color, caption }: { label: string; value: number; of: number; color: string; caption: string }) {
  const w = of > 0 ? Math.min(100, (value / of) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-sm font-medium text-ink">{label}</span>
        <span className="font-display text-base font-600 text-ink">{inrCompact(value)}</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-sage-100">
        <div className="h-full rounded-full" style={{ width: `${w}%`, background: color }} />
      </div>
      <div className="mt-1 text-xs text-sage-600">{caption}</div>
    </div>
  );
}

export default function BudgetPlan({ profile }: { profile: ProfileInput }) {
  const b = calcBudget(profile);
  if (b.income <= 0) return null;

  const emiOver = b.actualEmi > b.maxEmi;
  const savingsLow = b.actualSavings < b.minSavings;

  return (
    <div>
      <h3 className="mb-1 font-display text-xl font-600 text-ink">Your suggested monthly plan</h3>
      <p className="mb-5 text-sm text-sage-600">
        A healthy split of your {inrCompact(b.income)} monthly income, based on standard planning limits — EMIs under 35%, savings at least 10–20%, the rest for living.
      </p>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* recommended split */}
        <div className="space-y-4 rounded-2xl border border-sage-100 bg-white/70 p-5">
          <div className="field-label">Recommended split</div>
          <Bar label="Max EMI (loans)" value={b.comfortEmi} of={b.income} color="#b9543f" caption={`Hard ceiling ${inrCompact(b.maxEmi)} (35%). Stay at or below.`} />
          <Bar label="Living expenses" value={b.suggestedExpenses} of={b.income} color="#6f8f72" caption="Household, food, lifestyle, utilities." />
          <Bar label="Savings & investments" value={b.targetSavings} of={b.income} color="#3f5d44" caption={`Target 20%. Never below ${inrCompact(b.minSavings)} (10%).`} />
        </div>

        {/* your current split */}
        <div className="space-y-4 rounded-2xl border border-sage-100 bg-white/70 p-5">
          <div className="field-label">Where you are now</div>
          <Bar label="Your EMIs" value={b.actualEmi} of={b.income} color={emiOver ? "#b9543f" : "#6f8f72"} caption={emiOver ? `Over the 35% ceiling by ${inrCompact(b.actualEmi - b.maxEmi)}.` : `Within limit — headroom of ${inrCompact(b.emiHeadroom)}.`} />
          <Bar label="Your expenses" value={b.actualExpenses} of={b.income} color="#6f8f72" caption="As entered." />
          <Bar label="Your savings" value={Math.max(0, b.actualSavings)} of={b.income} color={savingsLow ? "#c8a248" : "#3f5d44"} caption={b.actualSavings < 0 ? "You're spending more than you earn." : savingsLow ? "Below the 10% floor — try to lift this." : "Healthy savings rate."} />
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-sage-100 bg-sage-50/50 px-4 py-3 text-sm text-sage-700">
        <strong className="text-ink">In short:</strong>{" "}
        {b.actualSavings < 0
          ? `Your EMIs and expenses exceed your income by ${inr(Math.abs(b.actualSavings))} a month. Trimming expenses or reducing debt is the first priority.`
          : `You have about ${inr(b.actualSavings)} a month after EMIs and expenses. ${b.emiHeadroom > 0 ? `You could take on up to ${inr(b.emiHeadroom)} more in EMIs if needed, ` : "You're at your EMI ceiling, "}and your healthy savings target is ${inr(b.targetSavings)}.`}
      </div>
    </div>
  );
}
