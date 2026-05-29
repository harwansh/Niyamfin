import type { ProfileInput } from "./finance";

export type ProfileErrors = Partial<Record<keyof ProfileInput, string>>;

const finite = (value: number, fallback = 0) => (Number.isFinite(value) ? value : fallback);

export const clampNumber = (value: number, min = 0, max = Number.POSITIVE_INFINITY) =>
  Math.min(max, Math.max(min, finite(value, min)));

export function sanitizeProfile(input: ProfileInput): ProfileInput {
  const age = clampNumber(input.age, 18, 75);
  const retireAge = clampNumber(input.retireAge, 40, 75);
  const lifeExpectancy = clampNumber(input.lifeExpectancy, 60, 100);

  return {
    ...input,
    age,
    retireAge,
    lifeExpectancy,
    dependents: Math.round(clampNumber(input.dependents, 0, 10)),
    salary: clampNumber(input.salary),
    rentalIncome: clampNumber(input.rentalIncome),
    otherIncome: clampNumber(input.otherIncome),
    livingExpenses: clampNumber(input.livingExpenses),
    totalEmi: clampNumber(input.totalEmi),
    cashAndBank: clampNumber(input.cashAndBank),
    investments: clampNumber(input.investments),
    retirementSavings: clampNumber(input.retirementSavings),
    property: clampNumber(input.property),
    otherAssets: clampNumber(input.otherAssets),
    homeLoan: clampNumber(input.homeLoan),
    otherLoans: clampNumber(input.otherLoans),
    creditCardDues: clampNumber(input.creditCardDues),
    lifeCover: clampNumber(input.lifeCover),
    healthCover: clampNumber(input.healthCover),
    inflation: clampNumber(input.inflation, 2, 12),
    preReturn: clampNumber(input.preReturn, 4, 18),
    postReturn: clampNumber(input.postReturn, 3, 12),
  };
}

export function validateProfile(input: ProfileInput): ProfileErrors {
  const p = sanitizeProfile(input);
  const errors: ProfileErrors = {};

  if (p.retireAge <= p.age) errors.retireAge = "Retirement age must be greater than current age.";
  if (p.lifeExpectancy <= p.retireAge) errors.lifeExpectancy = "Life expectancy must be greater than retirement age.";
  if (p.salary + p.rentalIncome + p.otherIncome <= 0) errors.salary = "Enter at least one source of income.";
  if (p.livingExpenses <= 0) errors.livingExpenses = "Enter monthly living expenses.";

  return errors;
}

export const hasValidationErrors = (errors: ProfileErrors) => Object.keys(errors).length > 0;
