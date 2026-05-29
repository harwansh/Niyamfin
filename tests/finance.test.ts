import test from "node:test";
import assert from "node:assert/strict";
import {
  buildReport,
  calcBudget,
  calcGoal,
  defaultProfile,
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
