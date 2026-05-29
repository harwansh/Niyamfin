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

  // --- Narrative insights ---
  const insights: Insight[] = [];
  insights.push({
    title: "Net worth",
    verdict: netWorth > 0 ? "good" : "alert",
    headline: netWorth > 0 ? "You own more than you owe" : "Liabilities exceed assets",
    detail:
      netWorth > 0
        ? `Your assets of ${inrCompact(totalAssets)} exceed liabilities of ${inrCompact(totalLiabilities)}, leaving a net worth of ${inrCompact(netWorth)}.`
        : `Your liabilities of ${inrCompact(totalLiabilities)} currently exceed assets of ${inrCompact(totalAssets)}. Focus on clearing high-cost debt first.`,
  });
  if (p.creditCardDues > 0)
    insights.push({
      title: "Credit card debt",
      verdict: "alert",
      headline: "Clear this first",
      detail: `Credit card dues of ${inrCompact(p.creditCardDues)} carry the highest interest of any borrowing. Prioritise clearing these before new investments.`,
    });
  insights.push({
    title: "Emergency fund",
    verdict: emergencyFundHave >= emergencyFundTarget ? "good" : emergencyFundHave >= emergencyFundTarget / 2 ? "watch" : "alert",
    headline:
      emergencyFundHave >= emergencyFundTarget ? "Well cushioned" : "Build your safety net",
    detail: `A 6-month buffer for you is ${inrCompact(emergencyFundTarget)}. You hold ${inrCompact(emergencyFundHave)} in cash/bank.`,
  });
  insights.push({
    title: "Life insurance",
    verdict: lifeCoverGap <= 0 ? "good" : lifeCoverGap < recommendedLifeCover * 0.4 ? "watch" : "alert",
    headline: lifeCoverGap <= 0 ? "Adequately protected" : "Cover gap detected",
    detail:
      p.dependents > 0
        ? `With ${p.dependents} dependent(s), an income-replacement estimate suggests about ${inrCompact(recommendedLifeCover)} of term cover. You have ${inrCompact(p.lifeCover)}${lifeCoverGap > 0 ? `, a shortfall of ${inrCompact(lifeCoverGap)}.` : "."}`
        : `With no dependents, cover mainly needs to clear debts. Estimated need ${inrCompact(recommendedLifeCover)}.`,
  });
  insights.push({
    title: "Health insurance",
    verdict: healthCoverGap <= 0 ? "good" : "watch",
    headline: healthCoverGap <= 0 ? "Sufficient floater" : "Consider topping up",
    detail: `For a ${p.cityTier} family of ${p.dependents + 1}, a floater near ${inrCompact(recommendedHealthCover)} is prudent. You have ${inrCompact(p.healthCover)}.`,
  });
  insights.push({
    title: "Retirement",
    verdict: retirementGap <= 0 ? "good" : retirementGap < retirementCorpusNeeded * 0.5 ? "watch" : "alert",
    headline: retirementGap <= 0 ? "On track" : "Start a dedicated SIP",
    detail:
      retirementGap > 0
        ? `You'll need about ${inrCompact(retirementCorpusNeeded)} by age ${p.retireAge}. Current retirement savings project to ${inrCompact(retirementProjected)}. Investing ${inrCompact(retirementSIP)}/month can close the gap.`
        : `Your projected retirement savings of ${inrCompact(retirementProjected)} already meet the estimated need of ${inrCompact(retirementCorpusNeeded)}.`,
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
