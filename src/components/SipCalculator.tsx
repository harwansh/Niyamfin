"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { calcSip, inr, inrCompact } from "@/lib/finance";
import { NumberField, Stat } from "./Fields";

export default function SipCalculator() {
  const [v, setV] = useState({ monthlyInvestment: 25000, years: 20, expectedReturn: 12, stepUp: 5 });
  const set = (k: keyof typeof v) => (n: number) => setV((s) => ({ ...s, [k]: n }));
  const r = useMemo(() => calcSip(v), [v]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
      <div className="space-y-5">
        <NumberField label="Monthly investment" value={v.monthlyInvestment} onChange={set("monthlyInvestment")} prefix="₹" min={500} max={500000} step={500} />
        <NumberField label="Investment period" value={v.years} onChange={set("years")} suffix="yrs" min={1} max={40} />
        <NumberField label="Expected return" value={v.expectedReturn} onChange={set("expectedReturn")} suffix="%" min={4} max={20} step={0.5} />
        <NumberField label="Annual step-up" value={v.stepUp} onChange={set("stepUp")} suffix="%" min={0} max={25} step={1} />
        <p className="rounded-xl border border-sage-100 bg-white/60 px-4 py-3 text-sm leading-relaxed text-sage-700">
          Step-up raises your monthly amount each year, mirroring salary growth — a small step-up dramatically lifts the final corpus.
        </p>
      </div>

      <div className="space-y-5 rise">
        <div className="rounded-2xl border border-sage-100 bg-sage-900 px-6 py-6 text-paper shadow-card">
          <div className="field-label !text-sage-100/70">Maturity value in {v.years} years</div>
          <div className="font-display text-4xl font-700 text-brass sm:text-5xl">{inrCompact(r.futureValue)}</div>
          <div className="mt-1 text-sm text-sage-100/80">{inr(r.futureValue)}</div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Stat label="Total invested" value={inrCompact(r.invested)} />
          <Stat label="Wealth gained" value={inrCompact(r.gains)} accent="clay" />
        </div>
        <div className="rounded-2xl border border-sage-100 bg-white/70 p-4">
          <div className="field-label mb-2">Invested vs. value</div>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={r.series} margin={{ left: -10, right: 8, top: 6 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d8e3d7" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#3f5d44" }} />
              <YAxis tickFormatter={(n) => inrCompact(n)} tick={{ fontSize: 10, fill: "#3f5d44" }} width={56} />
              <Tooltip formatter={(n: number) => inr(n)} labelFormatter={(l) => `Year ${l}`} />
              <Bar dataKey="invested" stackId="a" fill="#c8d8c9" radius={[0, 0, 0, 0]} />
              <Bar dataKey="value" stackId="b" fill="#3f5d44" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
