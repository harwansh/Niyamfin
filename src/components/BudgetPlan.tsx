"use client";

import { calcBudget, inr, inrCompact, ProfileInput } from "@/lib/finance";

// One comparison row: recommended vs actual, with a +/- delta.
// goodWhen: "under" => being below the recommendation is good (EMI, expenses)
//           "over"  => being above the recommendation is good (savings)
function CompareRow({
  label, recommended, actual, income, goodWhen, note,
}: {
  label: string;
  recommended: number;
  actual: number;
  income: number;
  goodWhen: "under" | "over";
  note: string;
}) {
  const delta = actual - recommended; // + means actual is higher than recommended
  const isGood = goodWhen === "under" ? actual <= recommended : actual >= recommended;
  const recW = income > 0 ? Math.min(100, (recommended / income) * 100) : 0;
  const actW = income > 0 ? Math.min(100, (Math.max(0, actual) / income) * 100) : 0;
  const barColor = isGood ? "#3f5d44" : "#b9543f";

  const deltaLabel =
    delta === 0
      ? "On target"
      : delta > 0
      ? `${inrCompact(delta)} above general benchmark range`
      : `${inrCompact(Math.abs(delta))} below general benchmark range`;

  return (
    <div className="rounded-2xl border border-sage-100 bg-white/70 p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-display text-base font-600 text-ink">{label}</span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
            isGood ? "bg-sage-50 text-sage-700" : "bg-[#f7e4df] text-clay"
          }`}
        >
          {isGood ? "✓ " : "▲ "}
          {deltaLabel}
        </span>
      </div>

      {/* recommended bar */}
      <div className="mb-1.5">
        <div className="mb-0.5 flex justify-between text-xs text-sage-600">
          <span>Benchmark</span>
          <span className="font-semibold">{inrCompact(recommended)}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-sage-100">
          <div className="h-full rounded-full bg-sage-400" style={{ width: `${recW}%` }} />
        </div>
      </div>

      {/* actual bar */}
      <div>
        <div className="mb-0.5 flex justify-between text-xs text-sage-600">
          <span>You now</span>
          <span className="font-semibold text-ink">{inrCompact(actual)}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-sage-100">
          <div className="h-full rounded-full" style={{ width: `${actW}%`, background: barColor }} />
        </div>
      </div>

      <p className="mt-2 text-xs text-sage-600">{note}</p>
    </div>
  );
}

export default function BudgetPlan({ profile }: { profile: ProfileInput }) {
  const b = calcBudget(profile);
  if (b.income <= 0) return null;

  return (
    <div>
      <h3 className="mb-1 font-display text-xl font-600 text-ink">Benchmark-based monthly budget snapshot</h3>
      <p className="mb-5 text-sm text-sage-600">
        Here&apos;s how a benchmark split of your {inrCompact(b.income)} monthly income compares with what you actually
        do — and whether you&apos;re above or below in each area. (Benchmarks: EMIs under 35%, savings 10–20%, the rest for living.)
      </p>

      <div className="grid gap-4 lg:grid-cols-3">
        <CompareRow
          label="EMIs / loans"
          recommended={b.comfortEmi}
          actual={b.actualEmi}
          income={b.income}
          goodWhen="under"
          note={
            b.actualEmi > b.maxEmi
              ? `Over the 35% hard ceiling of ${inrCompact(b.maxEmi)} — reduce debt where you can.`
              : `Within the 35% ceiling (${inrCompact(b.maxEmi)}). Headroom: ${inrCompact(b.emiHeadroom)}.`
          }
        />
        <CompareRow
          label="Living expenses"
          recommended={b.suggestedExpenses}
          actual={b.actualExpenses}
          income={b.income}
          goodWhen="under"
          note={
            b.actualExpenses > b.suggestedExpenses
              ? "Spending above general benchmark range — the biggest lever to free up savings."
              : "Within general benchmark range for living expenses."
          }
        />
        <CompareRow
          label="Savings & investments"
          recommended={b.targetSavings}
          actual={Math.max(0, b.actualSavings)}
          income={b.income}
          goodWhen="over"
          note={
            b.actualSavings < 0
              ? "You're spending more than you earn — no money left to save."
              : b.actualSavings < b.minSavings
              ? `Below the 10% floor (${inrCompact(b.minSavings)}). Try to lift this first.`
              : `At or above the 20% target (${inrCompact(b.targetSavings)}). Great.`
          }
        />
      </div>

      <div className="mt-4 rounded-xl border border-sage-100 bg-sage-50/50 px-4 py-3 text-sm text-sage-700">
        <strong className="text-ink">In short:</strong>{" "}
        {b.actualSavings < 0
          ? `Your EMIs and expenses exceed your income by ${inr(Math.abs(b.actualSavings))} a month. Trimming expenses or reducing debt is the first priority.`
          : `You have about ${inr(b.actualSavings)} a month after EMIs and expenses, versus a benchmark savings target of ${inr(b.targetSavings)} — a ${b.actualSavings >= b.targetSavings ? "surplus" : "shortfall"} of ${inr(Math.abs(b.actualSavings - b.targetSavings))}.`}
      </div>
    </div>
  );
}
