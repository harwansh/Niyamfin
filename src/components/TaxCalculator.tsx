"use client";

import { useMemo, useState } from "react";
import { calcTaxNewRegime, inr, inrCompact } from "@/lib/finance";
import { NumberField, Stat } from "./Fields";

export default function TaxCalculator() {
  const [gross, setGross] = useState(1500000);
  const [sd, setSd] = useState(true);
  const r = useMemo(() => calcTaxNewRegime({ grossIncome: gross, standardDeduction: sd }), [gross, sd]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
      <div className="space-y-5">
        <NumberField label="Gross annual income (salary)" value={gross} onChange={setGross} prefix="₹" min={0} max={10000000} step={25000} />
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-sage-100 bg-white/70 px-4 py-3">
          <input type="checkbox" checked={sd} onChange={(e) => setSd(e.target.checked)} className="h-5 w-5 accent-sage-600" />
          <span className="text-sm font-medium text-sage-700">Apply standard deduction (₹75,000)</span>
        </label>
        <p className="rounded-xl border border-sage-100 bg-white/60 px-4 py-3 text-sm leading-relaxed text-sage-700">
          Computed under the <strong>New Tax Regime, FY 2025-26 (AY 2026-27)</strong>. Section 87A rebate makes tax nil up to ₹12 L taxable income. Health &amp; education cess of 4% applies. This is an estimate, not tax advice.
        </p>
      </div>

      <div className="space-y-5 rise">
        <div className="rounded-2xl border border-sage-100 bg-sage-900 px-6 py-6 text-paper shadow-card">
          <div className="field-label !text-sage-100/70">Total tax payable</div>
          <div className="font-display text-4xl font-700 text-brass sm:text-5xl">{r.totalTax > 0 ? inrCompact(r.totalTax) : "₹0"}</div>
          <div className="mt-1 text-sm text-sage-100/80">Effective rate {r.effectiveRate.toFixed(2)}% · Take-home {inr(r.takeHome)}</div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Stat label="Taxable income" value={inrCompact(r.taxableIncome)} />
          <Stat label="Tax before rebate" value={inrCompact(r.taxBeforeRebate)} />
          <Stat label="87A rebate" value={inrCompact(r.rebate)} accent="sage" />
          <Stat label="Cess (4%)" value={inrCompact(r.cess)} accent="clay" />
        </div>
        <div className="overflow-hidden rounded-2xl border border-sage-100 bg-white/70">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-sage-50 text-left text-xs uppercase tracking-wider text-sage-700">
                <th className="px-4 py-2.5">Slab</th>
                <th className="px-4 py-2.5">Rate</th>
                <th className="px-4 py-2.5 text-right">Tax</th>
              </tr>
            </thead>
            <tbody>
              {r.slabs.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-3 text-sage-600">No taxable slab reached.</td></tr>
              )}
              {r.slabs.map((s, i) => (
                <tr key={i} className="border-t border-sage-100">
                  <td className="px-4 py-2.5 font-medium">{s.label}</td>
                  <td className="px-4 py-2.5 text-sage-600">{s.rate}%</td>
                  <td className="px-4 py-2.5 text-right font-medium">{inr(s.tax)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
