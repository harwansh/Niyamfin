"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { calcRetirement, inr, inrCompact } from "@/lib/finance";
import { NumberField, Stat } from "./Fields";

export default function RetirementCalculator() {
  const [v, setV] = useState({
    currentAge: 30,
    retireAge: 60,
    lifeExpectancy: 85,
    monthlyExpense: 60000,
    currentSavings: 1500000,
    preReturn: 11,
    postReturn: 7,
    inflation: 6,
  });
  const set = (k: keyof typeof v) => (n: number) => setV((s) => ({ ...s, [k]: n }));
  const r = useMemo(() => calcRetirement(v), [v]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <NumberField label="Current age" value={v.currentAge} onChange={set("currentAge")} min={18} max={70} suffix="yrs" />
          <NumberField label="Retirement age" value={v.retireAge} onChange={set("retireAge")} min={40} max={75} suffix="yrs" />
        </div>
        <NumberField label="Life expectancy" value={v.lifeExpectancy} onChange={set("lifeExpectancy")} min={60} max={100} suffix="yrs" />
        <NumberField label="Monthly expense (today)" value={v.monthlyExpense} onChange={set("monthlyExpense")} prefix="₹" min={10000} max={500000} step={1000} />
        <NumberField label="Current savings" value={v.currentSavings} onChange={set("currentSavings")} prefix="₹" min={0} max={50000000} step={50000} />
        <div className="grid grid-cols-3 gap-4">
          <NumberField label="Pre-ret. return" value={v.preReturn} onChange={set("preReturn")} suffix="%" min={4} max={18} step={0.5} slider={false} />
          <NumberField label="Post-ret. return" value={v.postReturn} onChange={set("postReturn")} suffix="%" min={3} max={12} step={0.5} slider={false} />
          <NumberField label="Inflation" value={v.inflation} onChange={set("inflation")} suffix="%" min={2} max={12} step={0.5} slider={false} />
        </div>
      </div>

      <div className="space-y-5 rise">
        <div className="rounded-2xl border border-sage-100 bg-sage-900 px-6 py-6 text-paper shadow-card">
          <div className="field-label !text-sage-100/70">Corpus you'll need at {v.retireAge}</div>
          <div className="font-display text-4xl font-700 text-brass sm:text-5xl">{inrCompact(r.corpusNeeded)}</div>
          <div className="mt-1 text-sm text-sage-100/80">{inr(r.corpusNeeded)}</div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Stat label="Monthly SIP needed" value={inrCompact(r.requiredMonthlySIP)} accent="clay" />
          <Stat label="Projected from savings" value={inrCompact(r.futureValueOfSavings)} />
          <Stat label="Monthly expense at 60" value={inrCompact(r.expenseAtRetirement)} />
          <Stat label="Years in retirement" value={`${r.yearsInRetirement} yrs`} />
        </div>
        <div className="rounded-2xl border border-sage-100 bg-white/70 p-4">
          <div className="field-label mb-2">Corpus growth (with required SIP)</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={r.series} margin={{ left: -10, right: 8, top: 6 }}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3f5d44" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#3f5d44" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#d8e3d7" />
              <XAxis dataKey="age" tick={{ fontSize: 11, fill: "#3f5d44" }} />
              <YAxis tickFormatter={(n) => inrCompact(n)} tick={{ fontSize: 10, fill: "#3f5d44" }} width={56} />
              <Tooltip formatter={(n: number) => inr(n)} labelFormatter={(l) => `Age ${l}`} />
              <Area type="monotone" dataKey="corpus" stroke="#3f5d44" strokeWidth={2} fill="url(#g1)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
