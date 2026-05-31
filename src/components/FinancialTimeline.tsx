"use client";

import { calcMilestones, Milestone, ProfileInput, Report } from "@/lib/finance";

const VERDICT_COLORS: Record<Milestone["verdict"], { dot: string; label: string; text: string }> = {
  good: { dot: "bg-sage-600", label: "bg-sage-50 text-sage-700", text: "text-sage-700" },
  watch: { dot: "bg-brass", label: "bg-[#f6efd9] text-[#8a6d1f]", text: "text-[#8a6d1f]" },
  alert: { dot: "bg-clay", label: "bg-[#f7e4df] text-clay", text: "text-clay" },
};

const TYPE_ICONS: Record<Milestone["type"], string> = {
  emergency: "🛡",
  debtFree: "🔓",
  retirement: "🌿",
  target: "🎯",
};

export default function FinancialTimeline({
  profile,
  report,
}: {
  profile: ProfileInput;
  report: Report;
}) {
  const milestones = calcMilestones(profile, report);
  if (milestones.length === 0) return null;

  const maxYears = Math.max(...milestones.map((m) => m.yearsFromNow), 1);

  return (
    <div>
      <h3 className="mb-1 font-display text-xl font-600 text-ink">Your financial timeline</h3>
      <p className="mb-5 text-sm text-sage-600">
        Key milestones estimated from your current trajectory. Dates are illustrative — actual progress depends on
        savings behaviour, market returns, and life changes.
      </p>

      {/* Horizontal bar timeline */}
      <div className="mb-6 overflow-x-auto">
        <div className="relative min-w-[320px] pb-8 pt-4">
          {/* Base line */}
          <div className="absolute left-0 right-0 top-7 h-0.5 bg-sage-100" />

          {/* Milestone dots */}
          <div className="relative flex items-start">
            {milestones.map((m, i) => {
              const pct = maxYears > 0 ? (m.yearsFromNow / maxYears) * 100 : 0;
              const colors = VERDICT_COLORS[m.verdict];
              return (
                <div
                  key={i}
                  className="absolute"
                  style={{ left: `${Math.min(95, pct)}%` }}
                >
                  {/* Dot */}
                  <div className={`h-4 w-4 rounded-full border-2 border-white shadow ${colors.dot}`} />
                  {/* Label below */}
                  <div className={`mt-5 w-28 -translate-x-1/2 text-center text-[11px] font-semibold leading-tight ${colors.text}`}>
                    {TYPE_ICONS[m.type]} {m.label}
                    <div className="mt-0.5 text-[10px] font-normal text-sage-500">
                      {m.yearsFromNow === 0 ? "Now" : `~${m.yearsFromNow < 1 ? "<1 yr" : `${m.calendarYear}`}`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {milestones.map((m, i) => {
          const colors = VERDICT_COLORS[m.verdict];
          return (
            <div key={i} className="rounded-2xl border border-sage-100 bg-white/70 p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className={`h-2.5 w-2.5 flex-none rounded-full ${colors.dot}`} />
                <span className="text-xs font-bold uppercase tracking-wide text-sage-600">
                  {TYPE_ICONS[m.type]} {m.label}
                </span>
              </div>
              <div className="font-display text-2xl font-700 text-ink">
                {m.yearsFromNow === 0 ? "Today" : m.calendarYear}
              </div>
              {m.yearsFromNow > 0 && (
                <div className="text-xs text-sage-500">
                  {m.yearsFromNow < 1
                    ? "Less than a year away"
                    : `${Math.round(m.yearsFromNow * 10) / 10} years from now`}
                </div>
              )}
              <div className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${colors.label}`}>
                {m.verdict === "good" ? "On track" : m.verdict === "watch" ? "Watch" : "Needs attention"}
              </div>
              <p className="mt-2 text-xs text-sage-600">{m.detail}</p>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-sage-500">
        Debt-free estimate assumes ~8.5% average interest on all outstanding debt. Emergency fund progress assumes
        your current monthly surplus goes entirely toward it. Both are rough estimates.
      </p>
    </div>
  );
}
