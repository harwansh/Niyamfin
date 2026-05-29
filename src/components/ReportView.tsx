"use client";

import {
  Cell,
  Pie,
  PieChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { inr, inrCompact, ProfileInput, Report, Verdict } from "@/lib/finance";
import GoalsPlanner from "./GoalsPlanner";
import BudgetPlan from "./BudgetPlan";

const V: Record<Verdict, { dot: string; text: string; chip: string; label: string }> = {
  good: { dot: "bg-sage-600", text: "text-sage-700", chip: "bg-sage-50 text-sage-700", label: "On track" },
  watch: { dot: "bg-brass", text: "text-brass", chip: "bg-[#f6efd9] text-[#8a6d1f]", label: "Keep an eye" },
  alert: { dot: "bg-clay", text: "text-clay", chip: "bg-[#f7e4df] text-clay", label: "Needs action" },
};

const ASSET_COLORS = ["#6f8f72", "#3f5d44", "#c8a248", "#2f4634", "#b9543f"];
const LIAB_COLORS = ["#b9543f", "#c8a248", "#8a3527"];

function Gauge({ value, max, color }: { value: number; max: number; color: string }) {
  const pctVal = Math.min(100, (value / max) * 100);
  return (
    <ResponsiveContainer width="100%" height={88}>
      <RadialBarChart innerRadius="72%" outerRadius="100%" data={[{ v: pctVal }]} startAngle={210} endAngle={-30}>
        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
        <RadialBar dataKey="v" cornerRadius={8} fill={color} background={{ fill: "#e4ece4" }} />
      </RadialBarChart>
    </ResponsiveContainer>
  );
}

export default function ReportView({
  report,
  profile,
  onRestart,
}: {
  report: Report;
  profile: ProfileInput;
  onRestart: () => void;
}) {
  const r = report;

  return (
    <div className="space-y-8">
      {/* headline net worth */}
      <div className="rise grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-sage-100 bg-sage-900 px-6 py-6 text-paper shadow-card sm:col-span-1">
          <div className="field-label !text-sage-100/70">Net worth</div>
          <div className={`font-display text-4xl font-700 ${r.netWorth >= 0 ? "text-brass" : "text-clay"}`}>{inrCompact(r.netWorth)}</div>
          <div className="mt-1 text-xs text-sage-100/70">Assets {inrCompact(r.totalAssets)} − Liabilities {inrCompact(r.totalLiabilities)}</div>
        </div>
        <div className="rounded-2xl border border-sage-100 bg-white/70 px-6 py-6">
          <div className="field-label">Monthly surplus</div>
          <div className={`font-display text-3xl font-600 ${r.monthlySurplus >= 0 ? "text-sage-700" : "text-clay"}`}>{inrCompact(r.monthlySurplus)}</div>
          <div className="mt-1 text-xs text-sage-600">Income {inrCompact(r.monthlyIncome)} − outflow {inrCompact(r.monthlyOutflow)}</div>
        </div>
        <div className="rounded-2xl border border-sage-100 bg-white/70 px-6 py-6">
          <div className="field-label">Liquid savings</div>
          <div className="font-display text-3xl font-600 text-sage-700">{inrCompact(r.liquidAssets)}</div>
          <div className="mt-1 text-xs text-sage-600">Emergency target {inrCompact(r.emergencyFundTarget)}</div>
        </div>
      </div>

      {/* ratio gauges */}
      <div>
        <h3 className="mb-3 font-display text-xl font-600 text-ink">Your financial ratios</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {r.ratios.map((ratio) => {
            const max = ratio.unit === "months" ? 9 : ratio.key === "debtasset" || ratio.key === "debtservice" ? 100 : 40;
            const color = V[ratio.verdict].dot.includes("sage") ? "#3f5d44" : V[ratio.verdict].dot.includes("brass") ? "#c8a248" : "#b9543f";
            return (
              <div key={ratio.key} className="rounded-2xl border border-sage-100 bg-white/70 p-4">
                <Gauge value={ratio.value} max={max} color={color} />
                <div className="mt-1 text-center">
                  <div className="font-display text-2xl font-700 text-ink">
                    {ratio.value.toFixed(ratio.unit === "months" ? 1 : 0)}
                    <span className="text-sm font-500 text-sage-600">{ratio.unit === "%" ? "%" : " mo"}</span>
                  </div>
                  <div className="text-xs font-semibold text-sage-700">{ratio.label}</div>
                  <div className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${V[ratio.verdict].chip}`}>
                    {V[ratio.verdict].label}
                  </div>
                  <div className="mt-1 text-[11px] text-sage-600">Ideal {ratio.ideal}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* asset / liability composition */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-sage-100 bg-white/70 p-5">
          <h3 className="mb-2 font-display text-lg font-600 text-ink">What you own</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={170}>
              <PieChart>
                <Pie data={r.assetBreakdown} dataKey="value" nameKey="name" innerRadius={42} outerRadius={70} paddingAngle={2}>
                  {r.assetBreakdown.map((_, i) => <Cell key={i} fill={ASSET_COLORS[i % ASSET_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(n: number) => inr(n)} />
              </PieChart>
            </ResponsiveContainer>
            <ul className="flex-1 space-y-1.5 text-sm">
              {r.assetBreakdown.map((a, i) => (
                <li key={a.name} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sage-700">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: ASSET_COLORS[i % ASSET_COLORS.length] }} />
                    {a.name}
                  </span>
                  <span className="font-medium text-ink">{inrCompact(a.value)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="rounded-2xl border border-sage-100 bg-white/70 p-5">
          <h3 className="mb-2 font-display text-lg font-600 text-ink">What you owe</h3>
          {r.liabilityBreakdown.length ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={170}>
                <PieChart>
                  <Pie data={r.liabilityBreakdown} dataKey="value" nameKey="name" innerRadius={42} outerRadius={70} paddingAngle={2}>
                    {r.liabilityBreakdown.map((_, i) => <Cell key={i} fill={LIAB_COLORS[i % LIAB_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(n: number) => inr(n)} />
                </PieChart>
              </ResponsiveContainer>
              <ul className="flex-1 space-y-1.5 text-sm">
                {r.liabilityBreakdown.map((a, i) => (
                  <li key={a.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sage-700">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: LIAB_COLORS[i % LIAB_COLORS.length] }} />
                      {a.name}
                    </span>
                    <span className="font-medium text-ink">{inrCompact(a.value)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="py-10 text-center text-sage-600">Debt-free — nothing owed. 🌿</p>
          )}
        </div>
      </div>

      {/* protection + retirement cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <GapCard title="Retirement corpus" have={r.retirementProjected} need={r.retirementCorpusNeeded} gap={r.retirementGap} extra={r.retirementGap > 0 ? `Invest ${inrCompact(r.retirementSIP)}/mo to close it` : "Fully funded"} />
        <GapCard title="Life insurance" have={profile.lifeCover} need={r.recommendedLifeCover} gap={r.lifeCoverGap} extra={r.lifeCoverGap > 0 ? "Term cover recommended" : "Adequately covered"} />
        <GapCard title="Health insurance" have={profile.healthCover} need={r.recommendedHealthCover} gap={r.healthCoverGap} extra={r.healthCoverGap > 0 ? "Consider a top-up" : "Sufficient floater"} />
      </div>

      {/* insights */}
      <div>
        <h3 className="mb-3 font-display text-xl font-600 text-ink">What this means</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {r.insights.map((ins) => (
            <div key={ins.title} className="rounded-2xl border border-sage-100 bg-white/70 p-4">
              <div className="mb-1 flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${V[ins.verdict].dot}`} />
                <span className="text-xs font-bold uppercase tracking-wide text-sage-600">{ins.title}</span>
              </div>
              <div className={`font-display text-lg font-600 ${V[ins.verdict].text}`}>{ins.headline}</div>
              <p className="mt-1 text-sm leading-relaxed text-sage-700">{ins.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* monthly budget plan */}
      <div className="rounded-2xl border border-sage-100 bg-white/40 p-5">
        <BudgetPlan profile={profile} />
      </div>

      {/* life goals */}
      <div className="rounded-2xl border border-sage-100 bg-sage-50/40 p-5">
        <GoalsPlanner profile={profile} surplus={r.monthlySurplus} />
      </div>

      <div className="flex justify-center pt-2">
        <button onClick={onRestart} className="rounded-xl border border-sage-100 bg-white/70 px-6 py-2.5 text-sm font-medium text-sage-700 transition hover:border-sage-400">
          ↻ Start over
        </button>
      </div>
    </div>
  );
}

function GapCard({ title, have, need, gap, extra }: { title: string; have: number; need: number; gap: number; extra: string }) {
  const filled = need > 0 ? Math.min(100, (have / need) * 100) : 100;
  const ok = gap <= 0;
  return (
    <div className="rounded-2xl border border-sage-100 bg-white/70 p-5">
      <div className="field-label">{title}</div>
      <div className="mt-1 font-display text-2xl font-700 text-ink">{inrCompact(need)}</div>
      <div className="text-xs text-sage-600">recommended</div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-sage-100">
        <div className={`h-full rounded-full ${ok ? "bg-sage-600" : "bg-brass"}`} style={{ width: `${filled}%` }} />
      </div>
      <div className="mt-2 flex justify-between text-xs">
        <span className="text-sage-600">Have {inrCompact(have)}</span>
        {gap > 0 ? <span className="font-semibold text-clay">Gap {inrCompact(gap)}</span> : <span className="font-semibold text-sage-700">Covered ✓</span>}
      </div>
      <p className="mt-2 text-xs text-sage-700">{extra}</p>
    </div>
  );
}
