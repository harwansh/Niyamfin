// All figures in INR. All functions pure & side-effect free. No storage, no network.

export const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    Math.round(Number.isFinite(n) ? n : 0),
  );

export const inrCompact = (n: number) => {
  const v = Math.abs(n);
  if (v >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (v >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
  return inr(n);
};

/* ---------------- Retirement ---------------- */
export interface RetirementInput {
  currentAge: number;
  retireAge: number;
  lifeExpectancy: number;
  monthlyExpense: number; // today's money
  currentSavings: number;
  preReturn: number; // % annual, accumulation
  postReturn: number; // % annual, post-retirement
  inflation: number; // % annual
}
export interface RetirementResult {
  yearsToRetire: number;
  yearsInRetirement: number;
  expenseAtRetirement: number; // monthly, future value
  corpusNeeded: number;
  futureValueOfSavings: number;
  gap: number;
  requiredMonthlySIP: number;
  series: { age: number; corpus: number }[];
}

export function calcRetirement(i: RetirementInput): RetirementResult {
  const yearsToRetire = Math.max(0, i.retireAge - i.currentAge);
  const yearsInRetirement = Math.max(1, i.lifeExpectancy - i.retireAge);
  const inf = i.inflation / 100;

  const annualExpenseToday = i.monthlyExpense * 12;
  const annualExpenseAtRetire = annualExpenseToday * Math.pow(1 + inf, yearsToRetire);
  const expenseAtRetirement = annualExpenseAtRetire / 12;

  // Real rate of return during retirement (inflation-adjusted), present value of a growing annuity.
  const realRate = (1 + i.postReturn / 100) / (1 + inf) - 1;
  const corpusNeeded =
    Math.abs(realRate) < 1e-9
      ? annualExpenseAtRetire * yearsInRetirement
      : annualExpenseAtRetire * ((1 - Math.pow(1 + realRate, -yearsInRetirement)) / realRate) * (1 + realRate);

  const fvSavings = i.currentSavings * Math.pow(1 + i.preReturn / 100, yearsToRetire);
  const gap = Math.max(0, corpusNeeded - fvSavings);

  const rm = i.preReturn / 100 / 12;
  const n = yearsToRetire * 12;
  const requiredMonthlySIP =
    n <= 0 ? gap : Math.abs(rm) < 1e-9 ? gap / n : (gap * rm) / (Math.pow(1 + rm, n) - 1);

  const series: { age: number; corpus: number }[] = [];
  let corpus = i.currentSavings;
  for (let y = 0; y <= yearsToRetire; y++) {
    series.push({ age: i.currentAge + y, corpus });
    corpus = corpus * (1 + i.preReturn / 100) + requiredMonthlySIP * 12 * (1 + i.preReturn / 100);
  }

  return {
    yearsToRetire,
    yearsInRetirement,
    expenseAtRetirement,
    corpusNeeded,
    futureValueOfSavings: fvSavings,
    gap,
    requiredMonthlySIP,
    series,
  };
}

/* ---------------- SIP / Goal ---------------- */
export interface SipInput {
  monthlyInvestment: number;
  years: number;
  expectedReturn: number; // % annual
  stepUp: number; // % annual increase
}
export interface SipResult {
  invested: number;
  futureValue: number;
  gains: number;
  series: { year: number; invested: number; value: number }[];
}

export function calcSip(i: SipInput): SipResult {
  const r = i.expectedReturn / 100 / 12;
  let value = 0;
  let invested = 0;
  let monthly = i.monthlyInvestment;
  const series: { year: number; invested: number; value: number }[] = [];
  for (let y = 1; y <= i.years; y++) {
    for (let m = 0; m < 12; m++) {
      value = (value + monthly) * (1 + r);
      invested += monthly;
    }
    series.push({ year: y, invested: Math.round(invested), value: Math.round(value) });
    monthly *= 1 + i.stepUp / 100;
  }
  return { invested, futureValue: value, gains: value - invested, series };
}

/* ---------------- Income Tax (India, FY 2025-26 New Regime) ---------------- */
// New regime slabs FY 2025-26 (AY 2026-27): 0-4L nil, 4-8L 5%, 8-12L 10%,
// 12-16L 15%, 16-20L 20%, 20-24L 25%, >24L 30%. Standard deduction 75,000.
// 87A rebate makes tax zero up to 12L taxable income.
export interface TaxInput {
  grossIncome: number;
  standardDeduction: boolean;
}
export interface TaxSlab {
  label: string;
  rate: number;
  taxable: number;
  tax: number;
}
export interface TaxResult {
  taxableIncome: number;
  slabs: TaxSlab[];
  taxBeforeRebate: number;
  rebate: number;
  taxAfterRebate: number;
  cess: number;
  totalTax: number;
  effectiveRate: number;
  takeHome: number;
}

export function calcTaxNewRegime(i: TaxInput): TaxResult {
  const sd = i.standardDeduction ? 75000 : 0;
  const taxable = Math.max(0, i.grossIncome - sd);
  const bands = [
    { upTo: 400000, rate: 0 },
    { upTo: 800000, rate: 0.05 },
    { upTo: 1200000, rate: 0.1 },
    { upTo: 1600000, rate: 0.15 },
    { upTo: 2000000, rate: 0.2 },
    { upTo: 2400000, rate: 0.25 },
    { upTo: Infinity, rate: 0.3 },
  ];
  const slabs: TaxSlab[] = [];
  let prev = 0;
  let tax = 0;
  for (const b of bands) {
    const amt = Math.max(0, Math.min(taxable, b.upTo) - prev);
    if (amt > 0) {
      const t = amt * b.rate;
      tax += t;
      slabs.push({
        label: b.upTo === Infinity ? `Above ${prev / 100000}L` : `${prev / 100000}L – ${b.upTo / 100000}L`,
        rate: b.rate * 100,
        taxable: amt,
        tax: t,
      });
    }
    prev = b.upTo;
    if (b.upTo >= taxable) break;
  }
  // Section 87A rebate: full rebate if taxable income <= 12,00,000 (new regime).
  const rebate = taxable <= 1200000 ? tax : 0;
  const taxAfterRebate = Math.max(0, tax - rebate);
  const cess = taxAfterRebate * 0.04;
  const totalTax = taxAfterRebate + cess;
  return {
    taxableIncome: taxable,
    slabs,
    taxBeforeRebate: tax,
    rebate,
    taxAfterRebate,
    cess,
    totalTax,
    effectiveRate: i.grossIncome > 0 ? (totalTax / i.grossIncome) * 100 : 0,
    takeHome: i.grossIncome - totalTax,
  };
}
