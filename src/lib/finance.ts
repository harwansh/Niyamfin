// Niyamfin financial-health engine.
// All rules sourced from the CFP knowledge base PDFs in the repo:
//  - 5 key personal-finance ratios (CFP IPS/PFM lecture)
//  - Net worth = assets - liabilities (CFP IPS/PFM)
//  - Life insurance need: Human Life Value + L.I.F.E. needs method (CFP Risk Lecture 2)
//  - Retirement corpus: inflation-adjusted growing-annuity PV (CFP Retirement Planning)
// Pure functions only. No storage, no network.

export const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    Math.round(Number.isFinite(n) ? n : 0),
  );

export const inrCompact = (n: number) => {
  const s = n < 0 ? "-" : "";
  const v = Math.abs(n);
  if (v >= 1e7) return `${s}₹${(v / 1e7).toFixed(2)} Cr`;
  if (v >= 1e5) return `${s}₹${(v / 1e5).toFixed(2)} L`;
  return inr(n);
};

export const pct = (n: number) => `${n.toFixed(1)}%`;

// Indian digit grouping without currency symbol: 2500000 -> "25,00,000"
export const groupIndian = (n: number): string => {
  if (!Number.isFinite(n) || n === 0) return "";
  return Math.round(n).toLocaleString("en-IN");
};

// Plain-language Indian amount, e.g. 6000000 -> "60 Lakh", 12500000 -> "1.25 Crore"
export const inWords = (n: number): string => {
  if (!Number.isFinite(n) || n <= 0) return "";
  if (n >= 1e7) {
    const c = n / 1e7;
    return `${c % 1 === 0 ? c : c.toFixed(2)} Crore`;
  }
  if (n >= 1e5) {
    const l = n / 1e5;
    return `${l % 1 === 0 ? l : l.toFixed(2)} Lakh`;
  }
  if (n >= 1e3) {
    const k = n / 1e3;
    return `${k % 1 === 0 ? k : k.toFixed(1)} Thousand`;
  }
  return "";
};

export interface FinancialGoal {
  id: string;
  name: string;
  presentCost: number;
  yearsAway: number;
}

export interface GoalResult extends FinancialGoal {
  futureCost: number;
  monthlySIP: number;
  stepUpSIP?: number; // first-month SIP with annual step-up
}

export const GOAL_PRESETS: { name: string; presentCost: number; yearsAway: number }[] = [
  { name: "Child's higher education", presentCost: 2500000, yearsAway: 15 },
  { name: "Child's marriage", presentCost: 2000000, yearsAway: 20 },
  { name: "Early retirement boost", presentCost: 5000000, yearsAway: 12 },
  { name: "Buy a home", presentCost: 8000000, yearsAway: 7 },
  { name: "Dream car", presentCost: 1500000, yearsAway: 4 },
  { name: "World vacation", presentCost: 800000, yearsAway: 3 },
];

export function calcGoal(g: FinancialGoal, inflation: number, expectedReturn: number): GoalResult {
  const futureCost = g.presentCost * Math.pow(1 + inflation / 100, g.yearsAway);
  const rm = expectedReturn / 100 / 12;
  const n = Math.max(1, g.yearsAway * 12);
  const monthlySIP = Math.abs(rm) < 1e-9 ? futureCost / n : (futureCost * rm) / (Math.pow(1 + rm, n) - 1);
  return { ...g, futureCost, monthlySIP };
}

// SIP with annual step-up: returns the first-month SIP needed to reach targetAmount.
// Uses binary search since there is no closed-form for stepped SIP.
export function calcSipStepUp(
  targetAmount: number,
  months: number,
  annualReturn: number,   // e.g. 11 for 11%
  annualStepUp: number,   // e.g. 10 for 10% step-up per year
): number {
  if (months <= 0 || targetAmount <= 0) return 0;
  const monthlyRate = annualReturn / 100 / 12;
  const stepRate = annualStepUp / 100;

  const simulate = (initialSip: number): number => {
    let bal = 0;
    let sip = initialSip;
    for (let m = 0; m < months; m++) {
      if (m > 0 && m % 12 === 0) sip *= (1 + stepRate);
      bal = (bal + sip) * (1 + monthlyRate);
    }
    return bal;
  };

  let lo = 0;
  let hi = targetAmount;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (simulate(mid) < targetAmount) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

// Suggested monthly budget from income, anchored to CFP ratio thresholds:
// EMI <=35% of income, savings >=20% (healthy), the rest for living expenses.
export interface BudgetPlan {
  income: number;
  maxEmi: number;        // 35% ceiling (CFP debt-service rule)
  comfortEmi: number;    // 30% comfortable
  targetSavings: number; // 20% healthy target
  minSavings: number;    // 10% floor (CFP savings-ratio rule)
  suggestedExpenses: number; // what's left after comfortEmi + targetSavings
  actualEmi: number;
  actualExpenses: number;
  actualSavings: number;
  emiHeadroom: number;   // how much more EMI you could take before 35%
}

export function calcBudget(p: ProfileInput): BudgetPlan {
  const income = p.salary + p.rentalIncome + p.otherIncome;
  const maxEmi = income * 0.35;
  const comfortEmi = income * 0.30;
  const targetSavings = income * 0.20;
  const minSavings = income * 0.10;
  const suggestedExpenses = Math.max(0, income - comfortEmi - targetSavings);
  const actualEmi = p.totalEmi;
  const actualExpenses = p.livingExpenses;
  const actualSavings = income - p.totalEmi - p.livingExpenses;
  return {
    income, maxEmi, comfortEmi, targetSavings, minSavings, suggestedExpenses,
    actualEmi, actualExpenses, actualSavings,
    emiHeadroom: Math.max(0, maxEmi - actualEmi),
  };
}

// Debt payoff planner
export interface DebtItem {
  id: string;
  name: string;
  balance: number;
  annualRate: number;  // e.g. 8.5 for 8.5%
  minPayment: number;
}

export interface DebtPayoffResult {
  monthsToFree: number;
  totalInterest: number;
  totalPaid: number;
  schedule: { month: number; totalBalance: number }[];
}

export function calcDebtPayoff(
  debts: DebtItem[],
  extraPayment: number,
  strategy: "avalanche" | "snowball" = "avalanche",
): DebtPayoffResult {
  const active = debts.filter(d => d.balance > 0 && d.annualRate >= 0);
  if (active.length === 0) return { monthsToFree: 0, totalInterest: 0, totalPaid: 0, schedule: [] };

  const items = active.map(d => ({ ...d }));
  const totalMinPayment = items.reduce((s, d) => s + d.minPayment, 0);
  const totalPayment = totalMinPayment + extraPayment;

  let month = 0;
  let totalInterest = 0;
  let totalPaid = 0;
  const schedule: { month: number; totalBalance: number }[] = [];

  while (items.some(d => d.balance > 1) && month < 600) {
    month++;
    // Apply interest
    for (const d of items) {
      if (d.balance <= 0) continue;
      const interest = d.balance * (d.annualRate / 100 / 12);
      d.balance += interest;
      totalInterest += interest;
    }

    // Sort by strategy for extra payment priority
    const sorted = [...items].filter(d => d.balance > 0).sort((a, b) =>
      strategy === "avalanche" ? b.annualRate - a.annualRate : a.balance - b.balance
    );

    let remaining = totalPayment;
    // Pay minimums on all
    for (const d of items) {
      if (d.balance <= 0) continue;
      const pay = Math.min(d.balance, d.minPayment);
      d.balance = Math.max(0, d.balance - pay);
      remaining -= pay;
      totalPaid += pay;
    }
    // Extra to priority debt
    for (const d of sorted) {
      if (remaining <= 0) break;
      const item = items.find(x => x.id === d.id)!;
      if (item.balance <= 0) continue;
      const pay = Math.min(item.balance, remaining);
      item.balance = Math.max(0, item.balance - pay);
      remaining -= pay;
      totalPaid += pay;
    }

    const totalBalance = items.reduce((s, d) => s + Math.max(0, d.balance), 0);
    schedule.push({ month, totalBalance });
    if (totalBalance < 1) break;
  }

  return { monthsToFree: month, totalInterest, totalPaid, schedule };
}

// Financial milestones timeline
export interface Milestone {
  label: string;
  yearsFromNow: number;
  calendarYear: number;
  type: "emergency" | "debtFree" | "retirement" | "target";
  verdict: Verdict;
  detail: string;
}

export function calcMilestones(
  p: ProfileInput,
  r: Report,
  currentYear = new Date().getFullYear(),
): Milestone[] {
  const milestones: Milestone[] = [];
  const surplus = r.monthlySurplus;

  // Emergency fund
  const efShortfall = Math.max(0, r.emergencyFundTarget - r.emergencyFundHave);
  if (efShortfall <= 0) {
    milestones.push({
      label: "Emergency fund",
      yearsFromNow: 0,
      calendarYear: currentYear,
      type: "emergency",
      verdict: "good",
      detail: "Already fully funded",
    });
  } else if (surplus > 0) {
    const months = Math.ceil(efShortfall / surplus);
    const yrs = months / 12;
    milestones.push({
      label: "Emergency fund complete",
      yearsFromNow: yrs,
      calendarYear: currentYear + Math.ceil(yrs),
      type: "emergency",
      verdict: yrs <= 1 ? "good" : yrs <= 3 ? "watch" : "alert",
      detail: `${inrCompact(efShortfall)} gap at ${inrCompact(surplus)}/mo`,
    });
  }

  // Debt-free estimate (assumes average 8.5% on all debt)
  if (r.totalLiabilities > 0 && p.totalEmi > 0) {
    const avgRate = 0.085 / 12;
    const payment = p.totalEmi;
    let months: number;
    if (payment <= r.totalLiabilities * avgRate) {
      months = 360;
    } else {
      months = Math.ceil(
        -Math.log(1 - (r.totalLiabilities * avgRate) / payment) / Math.log(1 + avgRate),
      );
    }
    const yrs = Math.min(months / 12, 30);
    milestones.push({
      label: "Debt-free (est.)",
      yearsFromNow: yrs,
      calendarYear: currentYear + Math.round(yrs),
      type: "debtFree",
      verdict: yrs <= 10 ? "good" : yrs <= 20 ? "watch" : "alert",
      detail: `${inrCompact(r.totalLiabilities)} at current EMI`,
    });
  }

  // Retirement
  const yearsToRetire = Math.max(0, p.retireAge - p.age);
  milestones.push({
    label: `Retirement at ${p.retireAge}`,
    yearsFromNow: yearsToRetire,
    calendarYear: currentYear + yearsToRetire,
    type: "retirement",
    verdict: r.retirementGap <= 0 ? "good" : r.retirementGap < r.retirementCorpusNeeded * 0.5 ? "watch" : "alert",
    detail: r.retirementGap > 0 ? `${inrCompact(r.retirementGap)} gap remaining` : "On track",
  });

  return milestones.sort((a, b) => a.yearsFromNow - b.yearsFromNow);
}

export type Verdict = "good" | "watch" | "alert";

export interface ProfileInput {
  // about
  age: number;
  retireAge: number;
  lifeExpectancy: number;
  dependents: number;
  cityTier: "metro" | "tier2" | "tier3";
  // income (monthly)
  salary: number;
  rentalIncome: number;
  otherIncome: number;
  // expenses (monthly)
  livingExpenses: number;
  totalEmi: number;
  // assets
  cashAndBank: number;
  investments: number; // stocks, MF, bonds
  retirementSavings: number; // EPF, PPF, NPS
  property: number; // own home + real estate
  otherAssets: number; // gold, vehicle, etc
  // liabilities (outstanding)
  homeLoan: number;
  otherLoans: number; // car, personal, education
  creditCardDues: number;
  // protection
  lifeCover: number; // existing sum assured
  healthCover: number; // existing family floater
  // assumptions
  inflation: number;
  preReturn: number;
  postReturn: number;
}

export const defaultProfile: ProfileInput = {
  age: 30,
  retireAge: 60,
  lifeExpectancy: 85,
  dependents: 1,
  cityTier: "metro",
  salary: 0,
  rentalIncome: 0,
  otherIncome: 0,
  livingExpenses: 0,
  totalEmi: 0,
  cashAndBank: 0,
  investments: 0,
  retirementSavings: 0,
  property: 0,
  otherAssets: 0,
  homeLoan: 0,
  otherLoans: 0,
  creditCardDues: 0,
  lifeCover: 0,
  healthCover: 0,
  inflation: 6,
  preReturn: 11,
  postReturn: 7,
};

// Illustrative figures for the "See a sample report" demo. Not real data.
export const sampleProfile: ProfileInput = {
  age: 34,
  retireAge: 60,
  lifeExpectancy: 85,
  dependents: 2,
  cityTier: "metro",
  salary: 145000,
  rentalIncome: 0,
  otherIncome: 8000,
  livingExpenses: 62000,
  totalEmi: 38000,
  cashAndBank: 450000,
  investments: 950000,
  retirementSavings: 1400000,
  property: 7500000,
  otherAssets: 550000,
  homeLoan: 4800000,
  otherLoans: 350000,
  creditCardDues: 40000,
  lifeCover: 7500000,
  healthCover: 800000,
  inflation: 6,
  preReturn: 11,
  postReturn: 7,
};

export interface Ratio {
  key: string;
  label: string;
  value: number; // the computed % or months
  unit: "%" | "months";
  ideal: string;
  verdict: Verdict;
  note: string;
}

export interface Insight {
  title: string;
  verdict: Verdict;
  headline: string;
  detail: string;
  steps: string[]; // 2-3 actionable next steps
}

export interface Report {
  monthlyIncome: number;
  monthlyOutflow: number;
  monthlySurplus: number;
  totalAssets: number;
  liquidAssets: number;
  totalLiabilities: number;
  netWorth: number;
  ratios: Ratio[];
  retirementCorpusNeeded: number;
  retirementProjected: number;
  retirementGap: number;
  retirementSIP: number;
  recommendedLifeCover: number;
  lifeCoverGap: number;
  recommendedHealthCover: number;
  healthCoverGap: number;
  emergencyFundTarget: number;
  emergencyFundHave: number;
  insights: Insight[];
  assetBreakdown: { name: string; value: number }[];
  liabilityBreakdown: { name: string; value: number }[];
}

export function buildReport(p: ProfileInput): Report {
  const monthlyIncome = p.salary + p.rentalIncome + p.otherIncome;
  const monthlyOutflow = p.livingExpenses + p.totalEmi;
  const monthlySurplus = monthlyIncome - monthlyOutflow;
  const annualIncome = monthlyIncome * 12;

  const liquidAssets = p.cashAndBank + p.investments;
  const totalAssets =
    p.cashAndBank + p.investments + p.retirementSavings + p.property + p.otherAssets;
  const totalLiabilities = p.homeLoan + p.otherLoans + p.creditCardDues;
  const netWorth = totalAssets - totalLiabilities;

  // --- 5 key ratios (CFP IPS/PFM) ---
  const liquidityRatio = totalAssets > 0 ? (liquidAssets / totalAssets) * 100 : 0;
  const monthlyExpenseForCover = p.livingExpenses + p.totalEmi;
  const jobCoverMonths = monthlyExpenseForCover > 0 ? liquidAssets / monthlyExpenseForCover : 0;
  const debtAssetRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;
  const debtServiceRatio = monthlyIncome > 0 ? (p.totalEmi / monthlyIncome) * 100 : 0;
  const savingsRatio = monthlyIncome > 0 ? (monthlySurplus / monthlyIncome) * 100 : 0;

  const ratios: Ratio[] = [
    {
      key: "liquidity",
      label: "Liquidity ratio",
      value: liquidityRatio,
      unit: "%",
      ideal: "≈ 15% of assets",
      verdict: liquidityRatio >= 12 && liquidityRatio <= 25 ? "good" : liquidityRatio < 8 ? "alert" : "watch",
      note: "Share of your wealth that's easy to access. Too low is risky; too high means idle money.",
    },
    {
      key: "jobcover",
      label: "Emergency cover",
      value: jobCoverMonths,
      unit: "months",
      ideal: "3 – 6 months",
      verdict: jobCoverMonths >= 6 ? "good" : jobCoverMonths >= 3 ? "watch" : "alert",
      note: "How many months your liquid savings can cover expenses if income stops.",
    },
    {
      key: "debtasset",
      label: "Debt-to-asset",
      value: debtAssetRatio,
      unit: "%",
      ideal: "below 50%",
      verdict: debtAssetRatio < 50 ? "good" : debtAssetRatio < 65 ? "watch" : "alert",
      note: "What portion of everything you own is funded by debt.",
    },
    {
      key: "debtservice",
      label: "EMI-to-income",
      value: debtServiceRatio,
      unit: "%",
      ideal: "below 35%",
      verdict: debtServiceRatio < 35 ? "good" : debtServiceRatio <= 45 ? "watch" : "alert",
      note: "Share of income going to loan EMIs. Above 45% is a serious concern.",
    },
    {
      key: "savings",
      label: "Savings ratio",
      value: savingsRatio,
      unit: "%",
      ideal: "at least 10%",
      verdict: savingsRatio >= 20 ? "good" : savingsRatio >= 10 ? "watch" : "alert",
      note: "Share of income left after expenses and EMIs — fuel for every goal.",
    },
  ];

  // --- Retirement corpus (inflation-adjusted growing annuity) ---
  const yearsToRetire = Math.max(0, p.retireAge - p.age);
  const yearsInRetirement = Math.max(1, p.lifeExpectancy - p.retireAge);
  const inf = p.inflation / 100;
  const annualExpenseToday = p.livingExpenses * 12;
  const annualExpenseAtRetire = annualExpenseToday * Math.pow(1 + inf, yearsToRetire);
  const realRate = (1 + p.postReturn / 100) / (1 + inf) - 1;
  const retirementCorpusNeeded =
    Math.abs(realRate) < 1e-9
      ? annualExpenseAtRetire * yearsInRetirement
      : annualExpenseAtRetire * ((1 - Math.pow(1 + realRate, -yearsInRetirement)) / realRate) * (1 + realRate);
  const retirementProjected =
    p.retirementSavings * Math.pow(1 + p.preReturn / 100, yearsToRetire);
  const retirementGap = Math.max(0, retirementCorpusNeeded - retirementProjected);
  const rm = p.preReturn / 100 / 12;
  const n = yearsToRetire * 12;
  const retirementSIP =
    n <= 0 ? retirementGap : Math.abs(rm) < 1e-9 ? retirementGap / n : (retirementGap * rm) / (Math.pow(1 + rm, n) - 1);

  // --- Life insurance need (HLV-style income replacement + liabilities, net of existing assets) ---
  const incomeReplacementYears = Math.min(yearsToRetire, Math.max(5, yearsToRetire));
  const annualIncomeNetOfSelf = Math.max(0, annualIncome * 0.7); // income supporting dependents
  const incomeReplacementPV =
    realRate > 0
      ? annualIncomeNetOfSelf * ((1 - Math.pow(1 + realRate, -incomeReplacementYears)) / realRate)
      : annualIncomeNetOfSelf * incomeReplacementYears;
  const recommendedLifeCover =
    p.dependents > 0
      ? Math.max(0, incomeReplacementPV + totalLiabilities - liquidAssets - p.retirementSavings)
      : Math.max(0, totalLiabilities - liquidAssets);
  const lifeCoverGap = Math.max(0, recommendedLifeCover - p.lifeCover);

  // --- Health cover (tiered family-floater rule of thumb) ---
  const baseHealth = p.cityTier === "metro" ? 1000000 : p.cityTier === "tier2" ? 700000 : 500000;
  const recommendedHealthCover = baseHealth + Math.max(0, p.dependents - 1) * 200000;
  const healthCoverGap = Math.max(0, recommendedHealthCover - p.healthCover);

  // --- Emergency fund ---
  const emergencyFundTarget = monthlyExpenseForCover * 6;
  const emergencyFundHave = p.cashAndBank;

  // --- Narrative insights with actionable steps ---
  const insights: Insight[] = [];

  insights.push({
    title: "Net worth",
    verdict: netWorth > 0 ? "good" : "alert",
    headline: netWorth > 0 ? "You own more than you owe" : "Liabilities exceed assets",
    detail:
      netWorth > 0
        ? `Your assets of ${inrCompact(totalAssets)} exceed liabilities of ${inrCompact(totalLiabilities)}, leaving a net worth of ${inrCompact(netWorth)}.`
        : `Your liabilities of ${inrCompact(totalLiabilities)} currently exceed assets of ${inrCompact(totalAssets)}. High-cost debt is commonly the first thing people look to reduce — a registered adviser can help you plan this.`,
    steps:
      netWorth > 0
        ? [
            "Track net worth quarterly in a simple spreadsheet to catch negative trends early.",
            "Diversify beyond property — high property concentration adds liquidity risk.",
            "Review and rebalance your investment portfolio at least once a year.",
          ]
        : [
            "List every liability by interest rate — the most expensive debt costs you the most.",
            "Audit your monthly budget for fixed expenses that can be trimmed to pay down debt faster.",
            "Consider consulting a SEBI-registered financial planner to structure a debt-reduction plan.",
          ],
  });

  if (p.creditCardDues > 0)
    insights.push({
      title: "Credit card debt",
      verdict: "alert",
      headline: "Typically the costliest debt",
      detail: `Credit card dues of ${inrCompact(p.creditCardDues)} usually carry the highest interest of any borrowing, which is why many planning frameworks treat them as a priority to clear. This is general information, not a recommendation.`,
      steps: [
        "Pay more than the minimum every month — the minimum payment barely covers interest.",
        "Stop adding new charges until the balance is cleared to avoid compounding the debt.",
        "If juggling multiple cards, target the highest-rate card first (avalanche method) to minimise total interest.",
      ],
    });

  insights.push({
    title: "Emergency fund",
    verdict: emergencyFundHave >= emergencyFundTarget ? "good" : emergencyFundHave >= emergencyFundTarget / 2 ? "watch" : "alert",
    headline:
      emergencyFundHave >= emergencyFundTarget ? "Well cushioned" : "Below the common buffer range",
    detail: `A commonly-cited 6-month buffer for your outflow would be ${inrCompact(emergencyFundTarget)}. You hold ${inrCompact(emergencyFundHave)} in cash/bank. The 3–6 month range is a general guideline, not a target that fits everyone.`,
    steps:
      emergencyFundHave >= emergencyFundTarget
        ? [
            "Keep your emergency fund in a high-yield savings account or liquid mutual fund.",
            "Replenish it promptly if you ever draw on it.",
            "Review the target annually as expenses change.",
          ]
        : [
            `Save ${inrCompact(Math.max(0, emergencyFundTarget / 2 - emergencyFundHave))} more to reach the 3-month minimum as a first milestone.`,
            "Automate a fixed amount to a separate savings account each month — out of sight, out of reach.",
            "Consider a liquid mutual fund for slightly higher returns than a savings account while remaining accessible.",
          ],
  });

  insights.push({
    title: "Life insurance",
    verdict: lifeCoverGap <= 0 ? "good" : lifeCoverGap < recommendedLifeCover * 0.4 ? "watch" : "alert",
    headline: lifeCoverGap <= 0 ? "Within the estimated range" : "Below the estimate",
    detail:
      p.dependents > 0
        ? `With ${p.dependents} dependent(s), an income-replacement (Human Life Value) estimate works out to roughly ${inrCompact(recommendedLifeCover)}. You have ${inrCompact(p.lifeCover)}${lifeCoverGap > 0 ? `, about ${inrCompact(lifeCoverGap)} below that estimate.` : "."} The right cover for you depends on factors only a licensed professional can assess.`
        : `With no dependents, the estimate focuses on covering liabilities — roughly ${inrCompact(recommendedLifeCover)}. Your needs may differ.`,
    steps:
      lifeCoverGap > 0
        ? [
            "Term life insurance is typically the most cost-effective way to close a cover gap — premiums are lowest when you're young and healthy.",
            `Aim for a sum assured of at least ${inrCompact(recommendedLifeCover)} as a starting point, then verify with a licensed adviser.`,
            "Review your cover each time a major life event occurs (new child, home loan, salary increase).",
          ]
        : [
            "Verify that your policy's sum assured is paid up and nominations are updated.",
            "Review annually — life events like a new loan or dependent can change your needs.",
            "Check whether your employer group cover lapses if you change jobs.",
          ],
  });

  insights.push({
    title: "Health insurance",
    verdict: healthCoverGap <= 0 ? "good" : "watch",
    headline: healthCoverGap <= 0 ? "Within the rule-of-thumb range" : "Below the rule-of-thumb range",
    detail: `For a ${p.cityTier} family of ${p.dependents + 1}, a common rule-of-thumb floater is around ${inrCompact(recommendedHealthCover)}. You have ${inrCompact(p.healthCover)}. Actual adequate cover depends on medical costs and the specific policy.`,
    steps:
      healthCoverGap > 0
        ? [
            `Consider topping up your floater to at least ${inrCompact(recommendedHealthCover)} — a super top-up plan can do this cost-effectively.`,
            "Check whether your employer's group health cover lapses on resignation — if so, an individual policy is essential.",
            "Read the policy's waiting period clauses for pre-existing conditions before buying.",
          ]
        : [
            "Review the policy's room-rent cap and sub-limits — a high sum insured with a low room cap can leave significant out-of-pocket costs.",
            "Port your policy to a better insurer during renewal if needed; you retain continuity benefits.",
            "Add a super top-up if medical inflation is a concern — it's inexpensive for the additional cover.",
          ],
  });

  insights.push({
    title: "Retirement",
    verdict: retirementGap <= 0 ? "good" : retirementGap < retirementCorpusNeeded * 0.5 ? "watch" : "alert",
    headline: retirementGap <= 0 ? "On track in this estimate" : "Gap to the estimate",
    detail:
      retirementGap > 0
        ? `Under these assumptions, the estimate suggests a corpus of about ${inrCompact(retirementCorpusNeeded)} by age ${p.retireAge}, while your current retirement savings project to ${inrCompact(retirementProjected)}. In this model, investing about ${inrCompact(retirementSIP)}/month would close the gap — illustrative only.`
        : `Under these assumptions, your projected retirement savings of ${inrCompact(retirementProjected)} already meet the estimated need of ${inrCompact(retirementCorpusNeeded)}.`,
    steps:
      retirementGap > 0
        ? [
            `Start (or increase) an SIP of around ${inrCompact(retirementSIP)}/mo in diversified equity funds for long-term growth.`,
            "Maximise EPF voluntary contributions and NPS (Section 80CCD) for tax-efficient retirement saving.",
            "Delay retirement by even 2–3 years or increase your savings rate — both have an outsized effect on the corpus.",
          ]
        : [
            "Stay the course — avoid withdrawing retirement savings early, as compounding is most powerful in the final years.",
            "As you approach retirement, gradually shift from equity to debt to reduce sequence-of-returns risk.",
            "Plan a withdrawal strategy (SWP from MF / annuity combination) well before your retirement date.",
          ],
  });

  return {
    monthlyIncome,
    monthlyOutflow,
    monthlySurplus,
    totalAssets,
    liquidAssets,
    totalLiabilities,
    netWorth,
    ratios,
    retirementCorpusNeeded,
    retirementProjected,
    retirementGap,
    retirementSIP,
    recommendedLifeCover,
    lifeCoverGap,
    recommendedHealthCover,
    healthCoverGap,
    emergencyFundTarget,
    emergencyFundHave,
    insights,
    assetBreakdown: [
      { name: "Cash & bank", value: p.cashAndBank },
      { name: "Investments", value: p.investments },
      { name: "Retirement", value: p.retirementSavings },
      { name: "Property", value: p.property },
      { name: "Other", value: p.otherAssets },
    ].filter((a) => a.value > 0),
    liabilityBreakdown: [
      { name: "Home loan", value: p.homeLoan },
      { name: "Other loans", value: p.otherLoans },
      { name: "Credit cards", value: p.creditCardDues },
    ].filter((a) => a.value > 0),
  };
}
