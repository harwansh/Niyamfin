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
import WhatIfSliders from "./WhatIfSliders";
import DebtPayoffPlanner from "./DebtPayoffPlanner";
import FinancialTimeline from "./FinancialTimeline";
import ErrorBoundary from "./ErrorBoundary";
import UpgradeSignup from "./UpgradeSignup";

const V: Record<Verdict, { dot: string; text: string; chip: string; label: string }> = {
  good: { dot: "bg-sage-600", text: "text-sage-700", chip: "bg-sage-50 text-sage-700", label: "On track" },
  watch: { dot: "bg-brass", text: "text-brass", chip: "bg-[#f6efd9] text-[#8a6d1f]", label: "Keep an eye" },
  alert: { dot: "bg-clay", text: "text-clay", chip: "bg-[#f7e4df] text-clay", label: "Needs action" },
};

const ASSET_COLORS = ["#6f8f72", "#3f5d44", "#c8a248", "#2f4634", "#b9543f"];
const LIAB_COLORS = ["#b9543f", "#c8a248", "#8a3527"];

function Gauge({ value, max, color }: { value: number; max: number; color: string }) {
  const pctVal = max === 0 ? 0 : Math.min(100, (value / max) * 100);
  return (
    <ResponsiveContainer width="100%" height={88}>
      <RadialBarChart innerRadius="72%" outerRadius="100%" data={[{ v: pctVal }]} startAngle={210} endAngle={-30}>
        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
        <RadialBar dataKey="v" cornerRadius={8} fill={color} background={{ fill: "#e4ece4" }} />
      </RadialBarChart>
    </ResponsiveContainer>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
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
      {/* Educational disclaimer + assumptions disclosure */}
      <div className="rise rounded-2xl border border-brass/40 bg-[#f6efd9]/50 px-5 py-4" role="note">
        <p className="text-sm leading-relaxed text-[#7a6019]">
          <strong>This is an educational estimate, not financial advice.</strong> Every figure below is calculated from
          the details you entered using standard personal-finance formulas. Results depend on the assumptions shown and
          will differ from real outcomes. Please verify with a SEBI-registered adviser before making any decision.
        </p>
        <details className="group mt-3">
          <summary className="cursor-pointer list-none text-xs font-semibold uppercase tracking-wide text-[#8a6d1f] [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">▸ Show the assumptions used in this report</span>
            <span className="hidden group-open:inline">▾ Assumptions used in this report</span>
          </summary>
          <div className="mt-3 grid gap-x-6 gap-y-1.5 text-xs text-sage-700 sm:grid-cols-2">
            <span>• Inflation assumed: <strong>{profile.inflation}% / year</strong></span>
            <span>• Pre-retirement return: <strong>{profile.preReturn}% / year</strong></span>
            <span>• Post-retirement return: <strong>{profile.postReturn}% / year</strong></span>
            <span>• Retirement age: <strong>{profile.retireAge}</strong>, life expectancy: <strong>{profile.lifeExpectancy}</strong></span>
            <span className="mt-1 sm:col-span-2 text-sage-600">
              Benchmarks: EMIs under 35% of income, savings 10–20%, emergency cover 3–6 months, debt-to-asset under 50%.
              See the <a href="/methodology" className="underline">Methodology</a> page for full formulas.
            </span>
          </div>
        </details>
      </div>

      {/* Headline net worth */}
      <Section>
        <div className="rise grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-sage-100 bg-sage-900 px-6 py-6 text-paper shadow-card sm:col-span-1">
            <div className="field-label !text-sage-100/70">Net worth</div>
            <div className={`font-display text-4xl font-700 ${r.netWorth >= 0 ? "text-brass" : "text-clay"}`}>
              {inrCompact(r.netWorth)}
            </div>
            <div className="mt-1 text-xs text-sage-100/70">
              Assets {inrCompact(r.totalAssets)} − Liabilities {inrCompact(r.totalLiabilities)}
            </div>
          </div>
          <div className="rounded-2xl border border-sage-100 bg-white/70 px-6 py-6">
            <div className="field-label">Monthly surplus</div>
            <div className={`font-display text-3xl font-600 ${r.monthlySurplus >= 0 ? "text-sage-700" : "text-clay"}`}>
              {inrCompact(r.monthlySurplus)}
            </div>
            <div className="mt-1 text-xs text-sage-600">
              Income {inrCompact(r.monthlyIncome)} − outflow {inrCompact(r.monthlyOutflow)}
            </div>
          </div>
          <div className="rounded-2xl border border-sage-100 bg-white/70 px-6 py-6">
            <div className="field-label">Liquid savings</div>
            <div className="font-display text-3xl font-600 text-sage-700">{inrCompact(r.liquidAssets)}</div>
            <div className="mt-1 text-xs text-sage-600">Emergency target {inrCompact(r.emergencyFundTarget)}</div>
          </div>
        </div>
      </Section>

      {/* Ratio gauges */}
      <Section>
        <div>
          <h3 className="mb-3 font-display text-xl font-600 text-ink" id="ratios-heading">
            Your financial ratios
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5" aria-labelledby="ratios-heading">
            {r.ratios.map((ratio) => {
              const max =
                ratio.unit === "months"
                  ? 9
                  : ratio.key === "debtasset" || ratio.key === "debtservice"
                  ? 100
                  : 40;
              const color = V[ratio.verdict].dot.includes("sage")
                ? "#3f5d44"
                : V[ratio.verdict].dot.includes("brass")
                ? "#c8a248"
                : "#b9543f";
              return (
                <div
                  key={ratio.key}
                  className="rounded-2xl border border-sage-100 bg-white/70 p-4"
                  role="article"
                  aria-label={`${ratio.label}: ${ratio.value.toFixed(ratio.unit === "months" ? 1 : 0)}${ratio.unit === "%" ? "%" : " months"}, ${V[ratio.verdict].label}`}
                >
                  <Gauge value={ratio.value} max={max} color={color} />
                  <div className="mt-1 text-center">
                    <div className="font-display text-2xl font-700 text-ink" aria-hidden="true">
                      {ratio.value.toFixed(ratio.unit === "months" ? 1 : 0)}
                      <span className="text-sm font-500 text-sage-600">{ratio.unit === "%" ? "%" : " mo"}</span>
                    </div>
                    <div className="text-xs font-semibold text-sage-700">{ratio.label}</div>
                    <div className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${V[ratio.verdict].chip}`}>
                      {V[ratio.verdict].label}
                    </div>
                    <div className="mt-1 text-[11px] text-sage-600">Ideal {ratio.ideal}</div>
                  </div>
                  {ratio.interpretation && (
                    <p className="mt-3 border-t border-sage-100 pt-3 text-xs leading-relaxed text-sage-700">
                      {ratio.interpretation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* Top 3 focus areas */}
      {r.focusAreas.length > 0 && (
        <Section>
          <div className="rounded-2xl border border-brass/30 bg-[#f6efd9]/40 p-5">
            <h3 className="mb-1 font-display text-xl font-600 text-ink">Top {r.focusAreas.length} focus areas</h3>
            <p className="mb-4 text-xs text-sage-600">
              Based on your numbers, these are the areas that — according to common personal-finance benchmarks — tend
              to have the most impact. These are educational observations, not recommendations.
            </p>
            <ol className="space-y-3">
              {r.focusAreas.map((f) => (
                <li key={f.rank} className="flex items-start gap-4 rounded-2xl border border-sage-100 bg-white/70 p-4">
                  <span className={`mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-full text-sm font-bold ${
                    f.verdict === "alert" ? "bg-[#f7e4df] text-clay" : f.verdict === "watch" ? "bg-[#f6efd9] text-[#8a6d1f]" : "bg-sage-50 text-sage-700"
                  }`}>
                    {f.rank}
                  </span>
                  <div>
                    <div className="font-display text-base font-600 text-ink">{f.title}</div>
                    <p className="mt-0.5 text-sm leading-relaxed text-sage-700">{f.why}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Section>
      )}

      {/* Asset / liability composition */}
      <Section>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-sage-100 bg-white/70 p-5">
            <h3 className="mb-2 font-display text-lg font-600 text-ink">What you own</h3>
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <div className="w-full sm:w-1/2">
                <ResponsiveContainer width="100%" height={170}>
                  <PieChart>
                    <Pie
                      data={r.assetBreakdown}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={42}
                      outerRadius={70}
                      paddingAngle={2}
                    >
                      {r.assetBreakdown.map((_, i) => (
                        <Cell key={i} fill={ASSET_COLORS[i % ASSET_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(n: number) => inr(n)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="flex-1 space-y-1.5 text-sm w-full sm:w-auto">
                {r.assetBreakdown.map((a, i) => (
                  <li key={a.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sage-700">
                      <span
                        className="h-2.5 w-2.5 rounded-full flex-none"
                        style={{ background: ASSET_COLORS[i % ASSET_COLORS.length] }}
                        aria-hidden="true"
                      />
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
              <div className="flex flex-col items-center gap-4 sm:flex-row">
                <div className="w-full sm:w-1/2">
                  <ResponsiveContainer width="100%" height={170}>
                    <PieChart>
                      <Pie
                        data={r.liabilityBreakdown}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={42}
                        outerRadius={70}
                        paddingAngle={2}
                      >
                        {r.liabilityBreakdown.map((_, i) => (
                          <Cell key={i} fill={LIAB_COLORS[i % LIAB_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(n: number) => inr(n)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ul className="flex-1 space-y-1.5 text-sm w-full sm:w-auto">
                  {r.liabilityBreakdown.map((a, i) => (
                    <li key={a.name} className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sage-700">
                        <span
                          className="h-2.5 w-2.5 rounded-full flex-none"
                          style={{ background: LIAB_COLORS[i % LIAB_COLORS.length] }}
                          aria-hidden="true"
                        />
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
      </Section>

      {/* Protection + retirement cards */}
      <Section>
        <div className="grid gap-4 sm:grid-cols-3">
          <GapCard
            title="Retirement corpus"
            have={r.retirementProjected}
            need={r.retirementCorpusNeeded}
            gap={r.retirementGap}
            extra={r.retirementGap > 0 ? `${inrCompact(r.retirementSIP)}/mo would close the gap (illustrative)` : "Meets the estimate"}
          />
          <GapCard
            title="Life insurance"
            have={profile.lifeCover}
            need={r.recommendedLifeCover}
            gap={r.lifeCoverGap}
            extra={r.lifeCoverGap > 0 ? "Below the estimate" : "Within the estimate"}
          />
          <GapCard
            title="Health insurance"
            have={profile.healthCover}
            need={r.recommendedHealthCover}
            gap={r.healthCoverGap}
            extra={r.healthCoverGap > 0 ? "Below the rule-of-thumb" : "Within the rule-of-thumb"}
          />
        </div>
      </Section>

      {/* Insights with actionable steps */}
      <Section>
        <div>
          <h3 className="mb-1 font-display text-xl font-600 text-ink" id="insights-heading">
            What this means
          </h3>
          <p className="mb-3 text-xs text-sage-600">
            General observations based on common benchmarks — not personalised recommendations.
          </p>
          <div className="grid gap-3 sm:grid-cols-2" aria-labelledby="insights-heading">
            {r.insights.map((ins) => (
              <div
                key={ins.title}
                className="rounded-2xl border border-sage-100 bg-white/70 p-4"
                role="article"
              >
                <div className="mb-1 flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 flex-none rounded-full ${V[ins.verdict].dot}`} aria-hidden="true" />
                  <span className="text-xs font-bold uppercase tracking-wide text-sage-600">{ins.title}</span>
                  <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${V[ins.verdict].chip}`}>
                    {V[ins.verdict].label}
                  </span>
                </div>
                <div className={`font-display text-lg font-600 ${V[ins.verdict].text}`}>{ins.headline}</div>
                <p className="mt-1 text-sm leading-relaxed text-sage-700">{ins.detail}</p>
                {ins.steps && ins.steps.length > 0 && (
                  <details className="group mt-3">
                    <summary className="cursor-pointer list-none text-xs font-semibold text-sage-600 underline underline-offset-2 [&::-webkit-details-marker]:hidden hover:text-sage-900">
                      <span className="group-open:hidden">▸ What you can do</span>
                      <span className="hidden group-open:inline">▾ What you can do</span>
                    </summary>
                    <ul className="mt-2 space-y-1.5" aria-label={`Actions for ${ins.title}`}>
                      {ins.steps.map((step, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-sage-700">
                          <span className="mt-0.5 flex h-4 w-4 flex-none items-center justify-center rounded-full bg-sage-100 text-[9px] font-bold text-sage-700">
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Financial Timeline */}
      <Section>
        <div className="rounded-2xl border border-sage-100 bg-white/40 p-5">
          <FinancialTimeline profile={profile} report={report} />
        </div>
      </Section>

      {/* What-if sliders */}
      <Section>
        <div className="rounded-2xl border border-sage-100 bg-white/40 p-5">
          <WhatIfSliders profile={profile} baseReport={report} />
        </div>
      </Section>

      {/* Monthly budget plan */}
      <Section>
        <div className="rounded-2xl border border-sage-100 bg-white/40 p-5">
          <BudgetPlan profile={profile} />
        </div>
      </Section>

      {/* Debt payoff planner */}
      {(profile.homeLoan > 0 || profile.otherLoans > 0 || profile.creditCardDues > 0) && (
        <Section>
          <div className="rounded-2xl border border-sage-100 bg-white/40 p-5">
            <DebtPayoffPlanner profile={profile} />
          </div>
        </Section>
      )}

      {/* Life goals */}
      <Section>
        <div className="rounded-2xl border border-sage-100 bg-sage-50/40 p-5">
          <GoalsPlanner profile={profile} surplus={r.monthlySurplus} />
        </div>
      </Section>

      {/* Upgrade email signup */}
      <Section>
        <UpgradeSignup />
      </Section>

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={onRestart}
          className="rounded-xl border border-sage-100 bg-white/70 px-6 py-2.5 text-sm font-medium text-sage-700 transition hover:border-sage-400"
        >
          ✎ Edit inputs
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="rounded-xl border border-sage-100 bg-white/70 px-6 py-2.5 text-sm font-medium text-sage-700 transition hover:border-sage-400"
        >
          ↻ Start over
        </button>
      </div>
    </div>
  );
}

function GapCard({
  title, have, need, gap, extra,
}: {
  title: string;
  have: number;
  need: number;
  gap: number;
  extra: string;
}) {
  const filled = need > 0 ? Math.min(100, (have / need) * 100) : 100;
  const ok = gap <= 0;
  return (
    <div className="rounded-2xl border border-sage-100 bg-white/70 p-5">
      <div className="field-label">{title}</div>
      <div className="mt-1 font-display text-2xl font-700 text-ink">{inrCompact(need)}</div>
      <div className="text-xs text-sage-600">estimate</div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-sage-100" role="progressbar" aria-valuenow={Math.round(filled)} aria-valuemin={0} aria-valuemax={100} aria-label={`${title} coverage: ${Math.round(filled)}%`}>
        <div className={`h-full rounded-full ${ok ? "bg-sage-600" : "bg-brass"}`} style={{ width: `${filled}%` }} />
      </div>
      <div className="mt-2 flex justify-between text-xs">
        <span className="text-sage-600">Have {inrCompact(have)}</span>
        {gap > 0 ? (
          <span className="font-semibold text-clay">Gap {inrCompact(gap)}</span>
        ) : (
          <span className="font-semibold text-sage-700">Covered ✓</span>
        )}
      </div>
      <p className="mt-2 text-xs text-sage-700">{extra}</p>
    </div>
  );
}
