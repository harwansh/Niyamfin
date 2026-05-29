import { NextRequest, NextResponse } from "next/server";

// Optional AI narrative. Works only if ANTHROPIC_API_KEY is set on the server.
// The deterministic report is the source of truth; the model only explains it.
export async function POST(req: NextRequest) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "AI summary is not configured. Set ANTHROPIC_API_KEY on the server to enable it. Your full report above is complete without it." },
      { status: 400 },
    );
  }

  try {
    const { profile, report } = await req.json();

    const facts = [
      `Net worth: ${report.netWorth}`,
      `Monthly income: ${report.monthlyIncome}, outflow: ${report.monthlyOutflow}, surplus: ${report.monthlySurplus}`,
      `Ratios: ${report.ratios.map((r: any) => `${r.label} ${r.value.toFixed(1)}${r.unit} (${r.verdict}, ideal ${r.ideal})`).join("; ")}`,
      `Retirement: need ${report.retirementCorpusNeeded}, projected ${report.retirementProjected}, gap ${report.retirementGap}, suggested SIP ${report.retirementSIP}`,
      `Life cover: have ${profile.lifeCover}, recommended ${report.recommendedLifeCover}, gap ${report.lifeCoverGap}`,
      `Health cover: have ${profile.healthCover}, recommended ${report.recommendedHealthCover}, gap ${report.healthCoverGap}`,
      `Dependents: ${profile.dependents}, age ${profile.age}, retires at ${profile.retireAge}, city ${profile.cityTier}`,
    ].join("\n");

    const system =
      "You are a friendly Indian personal-finance guide. You are given the OUTPUT of a deterministic financial-health engine whose rules come from CFP (Certified Financial Planner) study material: the five key personal-finance ratios (liquidity ~15%, emergency cover 3-6 months, debt-to-asset <50%, EMI-to-income <35%, savings >=10%), net worth, Human Life Value for insurance, and retirement corpus planning. Do NOT recompute or invent numbers — use only the figures given. Write a warm, plain-language summary for a general audience: 1) one-line overall health verdict, 2) top 3 priorities in order, 3) one encouraging closing line. Keep it under 220 words. Never give product names or guaranteed-return promises. End by reminding them this is educational, not a substitute for a SEBI-registered advisor.";

    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 700,
        system,
        messages: [{ role: "user", content: `Here is my financial-health report:\n${facts}\n\nPlease summarise.` }],
      }),
    });

    const data = await resp.json();
    if (!resp.ok) {
      return NextResponse.json({ error: data?.error?.message || "AI request failed" }, { status: 502 });
    }
    const summary = (data.content || []).filter((b: any) => b.type === "text").map((b: any) => b.text).join("\n").trim();
    return NextResponse.json({ summary });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unexpected error" }, { status: 500 });
  }
}
