import test from "node:test";
import assert from "node:assert/strict";
import {
  buildReport,
  calcBudget,
  calcDebtPayoff,
  calcGoal,
  calcMilestones,
  calcSipStepUp,
  defaultProfile,
  type DebtItem,
  type FinancialGoal,
  type ProfileInput,
} from "../src/lib/finance";

const approx = (actual: number, expected: number, tolerance = 1e-6) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} near ${expected}`);
};

const sampleProfile = (overrides: Partial<ProfileInput> = {}): ProfileInput => ({
  ...defaultProfile,
  age: 30,
  retireAge: 60,
  lifeExpectancy: 85,
  dependents: 2,
  cityTier: "metro",
  salary: 150000,
  rentalIncome: 0,
  otherIncome: 0,
  livingExpenses: 65000,
  totalEmi: 25000,
  cashAndBank: 500000,
  investments: 900000,
  retirementSavings: 1200000,
  property: 8000000,
  otherAssets: 400000,
  homeLoan: 3500000,
  otherLoans: 200000,
  creditCardDues: 0,
  lifeCover: 10000000,
  healthCover: 500000,
  inflation: 6,
  preReturn: 11,
  postReturn: 7,
  ...overrides,
});

// ─── calcGoal ────────────────────────────────────────────────────────────────

test("calcGoal inflates target and solves required SIP", () => {
  const goal: FinancialGoal = { id: "education", name: "Education", presentCost: 1000000, yearsAway: 10 };
  const result = calcGoal(goal, 6, 12);
  const futureCost = 1000000 * Math.pow(1.06, 10);
  const monthlyRate = 0.12 / 12;
  const months = 120;
  const expectedSip = (futureCost * monthlyRate) / (Math.pow(1 + monthlyRate, months) - 1);

  approx(result.futureCost, futureCost, 0.01);
  approx(result.monthlySIP, expectedSip, 0.01);
});

test("calcGoal handles zero expected return", () => {
  const result = calcGoal({ id: "g", name: "Goal", presentCost: 120000, yearsAway: 1 }, 0, 0);
  assert.equal(result.futureCost, 120000);
  assert.equal(result.monthlySIP, 10000);
});

test("calcGoal handles 1-year horizon correctly", () => {
  const result = calcGoal({ id: "g", name: "Vacation", presentCost: 600000, yearsAway: 1 }, 6, 12);
  const futureCost = 600000 * Math.pow(1.06, 1);
  approx(result.futureCost, futureCost, 1);
  assert.ok(result.monthlySIP > 0, "SIP should be positive");
});

test("calcGoal with zero years defaults to minimum 1 month", () => {
  const result = calcGoal({ id: "g", name: "Now", presentCost: 100000, yearsAway: 0 }, 6, 12);
  assert.ok(Number.isFinite(result.monthlySIP), "SIP should be finite");
  assert.ok(result.monthlySIP > 0, "SIP should be positive");
});

// ─── calcSipStepUp ───────────────────────────────────────────────────────────

test("calcSipStepUp returns lower initial SIP than flat SIP for same goal", () => {
  const targetAmount = 5000000;
  const months = 120;
  const flatGoal: FinancialGoal = { id: "x", name: "X", presentCost: targetAmount, yearsAway: 10 };
  const flatResult = calcGoal(flatGoal, 0, 12); // 0 inflation so futureCost = presentCost
  const stepUpSIP = calcSipStepUp(targetAmount, months, 12, 10);

  // With 10% annual step-up, the first-year SIP should be lower than the flat SIP
  assert.ok(stepUpSIP < flatResult.monthlySIP, `Step-up SIP ${stepUpSIP} should be less than flat SIP ${flatResult.monthlySIP}`);
  assert.ok(stepUpSIP > 0, "Step-up SIP should be positive");
});

test("calcSipStepUp returns 0 for zero target", () => {
  const result = calcSipStepUp(0, 120, 12, 10);
  assert.equal(result, 0);
});

test("calcSipStepUp handles zero step-up (close to flat SIP)", () => {
  const targetAmount = 1000000;
  const months = 60;
  const stepUpSIP = calcSipStepUp(targetAmount, months, 12, 0);
  const flatGoal: FinancialGoal = { id: "x", name: "X", presentCost: targetAmount, yearsAway: 5 };
  const flatResult = calcGoal(flatGoal, 0, 12);
  // Both should be in the same ballpark (within 2% of each other)
  const ratio = stepUpSIP / flatResult.monthlySIP;
  assert.ok(ratio > 0.98 && ratio < 1.02, `Step-up SIP ${stepUpSIP} should be within 2% of flat SIP ${flatResult.monthlySIP}`);
});

// ─── calcBudget ──────────────────────────────────────────────────────────────

test("calcBudget derives monthly limits from income", () => {
  const budget = calcBudget(sampleProfile());
  assert.equal(budget.income, 150000);
  assert.equal(budget.maxEmi, 52500);
  assert.equal(budget.comfortEmi, 45000);
  assert.equal(budget.targetSavings, 30000);
  assert.equal(budget.minSavings, 15000);
  assert.equal(budget.suggestedExpenses, 75000);
  assert.equal(budget.actualSavings, 60000);
});

test("calcBudget with zero income returns all zeros", () => {
  const budget = calcBudget(sampleProfile({ salary: 0, rentalIncome: 0, otherIncome: 0 }));
  assert.equal(budget.income, 0);
  assert.equal(budget.maxEmi, 0);
  assert.equal(budget.targetSavings, 0);
});

test("calcBudget emiHeadroom is zero when EMI exceeds maxEmi", () => {
  const budget = calcBudget(sampleProfile({ totalEmi: 60000 }));
  assert.equal(budget.emiHeadroom, 0);
});

// ─── calcDebtPayoff ──────────────────────────────────────────────────────────

const sampleDebts: DebtItem[] = [
  { id: "cc", name: "Credit card", balance: 100000, annualRate: 36, minPayment: 5000 },
  { id: "loan", name: "Personal loan", balance: 200000, annualRate: 12, minPayment: 5000 },
];

test("calcDebtPayoff avalanche clears high-rate debt first", () => {
  const result = calcDebtPayoff(sampleDebts, 5000, "avalanche");
  assert.ok(result.monthsToFree > 0, "Should have a payoff timeline");
  assert.ok(result.totalInterest > 0, "Should have interest paid");
  assert.ok(Number.isFinite(result.monthsToFree), "Months should be finite");
});

test("calcDebtPayoff with extra payment finishes faster than without", () => {
  const withExtra = calcDebtPayoff(sampleDebts, 10000, "avalanche");
  const withoutExtra = calcDebtPayoff(sampleDebts, 0, "avalanche");
  assert.ok(withExtra.monthsToFree < withoutExtra.monthsToFree, "Extra payment should reduce payoff time");
  assert.ok(withExtra.totalInterest < withoutExtra.totalInterest, "Extra payment should reduce total interest");
});

test("calcDebtPayoff returns empty result for no debt", () => {
  const result = calcDebtPayoff([], 5000, "avalanche");
  assert.equal(result.monthsToFree, 0);
  assert.equal(result.totalInterest, 0);
});

test("calcDebtPayoff snowball vs avalanche on mixed debt", () => {
  const debts: DebtItem[] = [
    { id: "small", name: "Small loan", balance: 50000, annualRate: 10, minPayment: 2000 },
    { id: "big", name: "Big card", balance: 200000, annualRate: 36, minPayment: 6000 },
  ];
  const avalanche = calcDebtPayoff(debts, 0, "avalanche");
  const snowball = calcDebtPayoff(debts, 0, "snowball");
  // Avalanche saves more interest on high-rate debt
  assert.ok(avalanche.totalInterest <= snowball.totalInterest, "Avalanche should not cost more interest than snowball");
});

// ─── buildReport ─────────────────────────────────────────────────────────────

test("buildReport computes core ratios and net worth", () => {
  const report = buildReport(sampleProfile());

  assert.equal(report.monthlyIncome, 150000);
  assert.equal(report.monthlyOutflow, 90000);
  assert.equal(report.monthlySurplus, 60000);
  assert.equal(report.totalAssets, 11000000);
  assert.equal(report.totalLiabilities, 3700000);
  assert.equal(report.netWorth, 7300000);

  const ratio = (key: string) => report.ratios.find((r) => r.key === key);
  approx(ratio("liquidity")!.value, (1400000 / 11000000) * 100, 0.001);
  approx(ratio("jobcover")!.value, 1400000 / 90000, 0.001);
  approx(ratio("debtasset")!.value, (3700000 / 11000000) * 100, 0.001);
  approx(ratio("debtservice")!.value, (25000 / 150000) * 100, 0.001);
  approx(ratio("savings")!.value, 40, 0.001);
});

test("buildReport handles zero dependents coverage case", () => {
  const report = buildReport(
    sampleProfile({
      dependents: 0,
      homeLoan: 1000000,
      otherLoans: 0,
      creditCardDues: 0,
      cashAndBank: 300000,
      investments: 500000,
      retirementSavings: 200000,
      lifeCover: 0,
    }),
  );

  assert.equal(report.recommendedLifeCover, 200000);
  assert.equal(report.lifeCoverGap, 200000);
});

test("buildReport keeps negative surplus visible", () => {
  const report = buildReport(sampleProfile({ salary: 50000, livingExpenses: 60000, totalEmi: 15000 }));
  assert.equal(report.monthlySurplus, -25000);
  assert.equal(report.ratios.find((r) => r.key === "savings")!.verdict, "alert");
});

test("buildReport returns finite numbers for all fields", () => {
  const report = buildReport(sampleProfile());
  const numericFields = [
    report.monthlyIncome, report.monthlyOutflow, report.monthlySurplus,
    report.totalAssets, report.liquidAssets, report.totalLiabilities, report.netWorth,
    report.retirementCorpusNeeded, report.retirementProjected, report.retirementGap,
    report.retirementSIP, report.recommendedLifeCover, report.lifeCoverGap,
    report.recommendedHealthCover, report.healthCoverGap,
    report.emergencyFundTarget, report.emergencyFundHave,
  ];
  for (const val of numericFields) {
    assert.ok(Number.isFinite(val), `Value ${val} should be finite`);
  }
});

test("buildReport insights include actionable steps", () => {
  const report = buildReport(sampleProfile());
  for (const insight of report.insights) {
    assert.ok(Array.isArray(insight.steps), `Insight '${insight.title}' should have steps array`);
    assert.ok(insight.steps.length > 0, `Insight '${insight.title}' should have at least one step`);
  }
});

test("buildReport with zero assets returns zero net worth and negative net worth", () => {
  const report = buildReport(sampleProfile({
    cashAndBank: 0, investments: 0, retirementSavings: 0, property: 0, otherAssets: 0,
    homeLoan: 500000,
  }));
  assert.equal(report.totalAssets, 0);
  assert.ok(report.netWorth < 0, "Net worth should be negative");
  // When totalAssets = 0, debtAssetRatio = 0 (guard against division by zero), ratio is "good" by threshold
  const debtAssetRatio = report.ratios.find(r => r.key === "debtasset")!.value;
  assert.equal(debtAssetRatio, 0, "Debt-to-asset ratio should be 0 when assets are 0 (division guard)");
});

test("buildReport retirement SIP is zero when already on track", () => {
  const report = buildReport(sampleProfile({
    retirementSavings: 100000000, // Very high existing savings
    livingExpenses: 10000,
  }));
  assert.equal(report.retirementGap, 0);
  assert.equal(report.retirementSIP, 0);
});

test("buildReport health cover recommendation varies by city tier", () => {
  const metro = buildReport(sampleProfile({ cityTier: "metro", dependents: 2 }));
  const tier2 = buildReport(sampleProfile({ cityTier: "tier2", dependents: 2 }));
  const tier3 = buildReport(sampleProfile({ cityTier: "tier3", dependents: 2 }));

  assert.ok(metro.recommendedHealthCover > tier2.recommendedHealthCover, "Metro should need higher health cover");
  assert.ok(tier2.recommendedHealthCover > tier3.recommendedHealthCover, "Tier-2 should need higher health cover than tier-3");
});

test("buildReport emergency fund verdict thresholds are correct", () => {
  const efTarget = (65000 + 25000) * 6; // 6 months of expenses

  const wellFunded = buildReport(sampleProfile({ cashAndBank: efTarget }));
  assert.equal(wellFunded.insights.find(i => i.title === "Emergency fund")!.verdict, "good");

  const halfFunded = buildReport(sampleProfile({ cashAndBank: efTarget / 2 }));
  assert.equal(halfFunded.insights.find(i => i.title === "Emergency fund")!.verdict, "watch");

  const poorlyFunded = buildReport(sampleProfile({ cashAndBank: 10000 }));
  assert.equal(poorlyFunded.insights.find(i => i.title === "Emergency fund")!.verdict, "alert");
});

// ─── calcMilestones ──────────────────────────────────────────────────────────

test("calcMilestones always includes a retirement milestone", () => {
  const p = sampleProfile();
  const r = buildReport(p);
  const milestones = calcMilestones(p, r, 2025);
  const retirement = milestones.find(m => m.type === "retirement");
  assert.ok(retirement, "Should always have a retirement milestone");
  assert.equal(retirement!.calendarYear, 2025 + (p.retireAge - p.age));
});

test("calcMilestones shows emergency fund as achieved when fully funded", () => {
  const efTarget = (65000 + 25000) * 6;
  const p = sampleProfile({ cashAndBank: efTarget + 100000 });
  const r = buildReport(p);
  const milestones = calcMilestones(p, r, 2025);
  const ef = milestones.find(m => m.type === "emergency");
  assert.ok(ef, "Should have emergency fund milestone");
  assert.equal(ef!.yearsFromNow, 0);
  assert.equal(ef!.verdict, "good");
});

test("calcMilestones results are sorted by yearsFromNow", () => {
  const p = sampleProfile();
  const r = buildReport(p);
  const milestones = calcMilestones(p, r, 2025);
  for (let i = 1; i < milestones.length; i++) {
    assert.ok(
      milestones[i].yearsFromNow >= milestones[i - 1].yearsFromNow,
      "Milestones should be sorted ascending by years",
    );
  }
});
