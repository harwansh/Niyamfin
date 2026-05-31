"use client";

import { ProfileInput } from "@/lib/finance";
import { validateProfile, warnProfile } from "@/lib/validation";
import { ChoiceField, MoneyField, NumField } from "./Fields";

const STEPS = ["About you", "Income", "Expenses & EMIs", "Assets", "Liabilities", "Protection"];
const STEP_DESCRIPTIONS = [
  "Basic details about your age, retirement plans, and location.",
  "Your monthly take-home and other income sources.",
  "Monthly household costs and loan repayments.",
  "What you own — savings, investments, and property.",
  "Outstanding loans and credit card balances.",
  "Life and health insurance cover, plus calculation assumptions.",
];

export default function IntakeForm({
  step,
  setStep,
  p,
  set,
  onSubmit,
}: {
  step: number;
  setStep: (n: number) => void;
  p: ProfileInput;
  set: <K extends keyof ProfileInput>(k: K, v: ProfileInput[K]) => void;
  onSubmit: () => void;
}) {
  const last = STEPS.length - 1;
  const errors = validateProfile(p);
  const warnings = warnProfile(p);

  const stepBlocked = (() => {
    if (step === 0) return !!errors.retireAge || !!errors.lifeExpectancy;
    if (step === 1) return !!errors.salary;
    if (step === 2) return !!errors.livingExpenses;
    return false;
  })();

  const blockMessage = (() => {
    if (step === 0 && (errors.retireAge || errors.lifeExpectancy)) return "Please fix the highlighted ages to continue.";
    if (step === 1 && errors.salary) return errors.salary;
    if (step === 2 && errors.livingExpenses) return errors.livingExpenses;
    return "";
  })();

  return (
    <div>
      {/* Progress */}
      <nav aria-label="Form progress" className="mb-7">
        <ol className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <li key={s} className="flex flex-1 flex-col gap-1.5">
              <div
                className={`h-1 rounded-full transition ${i <= step ? "bg-sage-600" : "bg-sage-100"}`}
                aria-hidden="true"
              />
              <span
                className={`hidden text-[11px] font-medium sm:block ${i === step ? "text-sage-700" : "text-sage-400"}`}
                aria-current={i === step ? "step" : undefined}
              >
                {s}
              </span>
            </li>
          ))}
        </ol>
      </nav>

      <h2 className="mb-1 font-display text-2xl font-600 text-ink" id="step-heading">
        {STEPS[step]}
      </h2>
      <p className="mb-6 text-sm text-sage-600">
        Step {step + 1} of {STEPS.length} — {STEP_DESCRIPTIONS[step]}{step === 0 ? " Takes 3–5 minutes." : ""}
      </p>

      <div key={step} className="rise space-y-5" aria-labelledby="step-heading">
        {step === 0 && (
          <fieldset className="contents" aria-label="About you">
            <div className="grid grid-cols-2 gap-4">
              <NumField label="Your age" value={p.age} onChange={(v) => set("age", v)} min={18} max={75} suffix="yrs" />
              <NumField label="Planned retirement age" value={p.retireAge} onChange={(v) => set("retireAge", v)} min={40} max={75} suffix="yrs" error={errors.retireAge} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <NumField label="Life expectancy" value={p.lifeExpectancy} onChange={(v) => set("lifeExpectancy", v)} min={60} max={100} suffix="yrs" error={errors.lifeExpectancy} />
              <NumField label="Dependents" value={p.dependents} onChange={(v) => set("dependents", v)} min={0} max={10} />
            </div>
            <ChoiceField
              label="Where do you live?"
              value={p.cityTier}
              onChange={(v) => set("cityTier", v)}
              options={[
                { value: "metro", label: "Metro" },
                { value: "tier2", label: "Tier-2 city" },
                { value: "tier3", label: "Tier-3 / town" },
              ]}
            />
          </fieldset>
        )}

        {step === 1 && (
          <fieldset className="contents" aria-label="Monthly income">
            <p className="mb-4 text-xs text-sage-600 rounded-lg bg-sage-50/60 px-3 py-2 border border-sage-100">Used only to calculate ratios and estimates in your browser. Not sent anywhere.</p>
            <MoneyField label="Monthly salary (take-home)" value={p.salary} onChange={(v) => set("salary", v)} warning={warnings.salary} />
            <MoneyField label="Monthly rental income" value={p.rentalIncome} onChange={(v) => set("rentalIncome", v)} hint="Rent received, if any." />
            <MoneyField label="Other monthly income" value={p.otherIncome} onChange={(v) => set("otherIncome", v)} hint="Freelance, interest, dividends, etc." />
          </fieldset>
        )}

        {step === 2 && (
          <fieldset className="contents" aria-label="Monthly expenses">
            <MoneyField label="Monthly living expenses" value={p.livingExpenses} onChange={(v) => set("livingExpenses", v)} hint="Household, food, utilities, lifestyle — excluding EMIs." warning={warnings.livingExpenses} />
            <MoneyField label="Total monthly EMIs" value={p.totalEmi} onChange={(v) => set("totalEmi", v)} hint="All loan repayments combined." warning={warnings.totalEmi} />
          </fieldset>
        )}

        {step === 3 && (
          <fieldset className="contents" aria-label="Assets">
            <p className="mb-4 text-xs text-sage-600 rounded-lg bg-sage-50/60 px-3 py-2 border border-sage-100">Used to estimate your net worth and emergency cover. Not sent anywhere.</p>
            <MoneyField label="Cash & bank balance" value={p.cashAndBank} onChange={(v) => set("cashAndBank", v)} />
            <MoneyField label="Investments (stocks, MF, bonds)" value={p.investments} onChange={(v) => set("investments", v)} />
            <MoneyField label="Retirement savings (EPF, PPF, NPS)" value={p.retirementSavings} onChange={(v) => set("retirementSavings", v)} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <MoneyField label="Property (home + real estate)" value={p.property} onChange={(v) => set("property", v)} />
              <MoneyField label="Other (gold, vehicle...)" value={p.otherAssets} onChange={(v) => set("otherAssets", v)} />
            </div>
          </fieldset>
        )}

        {step === 4 && (
          <fieldset className="contents" aria-label="Liabilities">
            <p className="mb-4 text-xs text-sage-600 rounded-lg bg-sage-50/60 px-3 py-2 border border-sage-100">Used to calculate debt ratios and net worth. Not sent anywhere.</p>
            <MoneyField label="Home loan outstanding" value={p.homeLoan} onChange={(v) => set("homeLoan", v)} />
            <MoneyField label="Other loans (car, personal, education)" value={p.otherLoans} onChange={(v) => set("otherLoans", v)} />
            <MoneyField label="Credit card dues" value={p.creditCardDues} onChange={(v) => set("creditCardDues", v)} hint="Outstanding balance you carry over." warning={warnings.creditCardDues} />
          </fieldset>
        )}

        {step === 5 && (
          <fieldset className="contents" aria-label="Protection and assumptions">
            <p className="mb-4 text-xs text-sage-600 rounded-lg bg-sage-50/60 px-3 py-2 border border-sage-100">Used to estimate your insurance coverage gap. Not sent anywhere.</p>
            <MoneyField label="Existing life insurance cover" value={p.lifeCover} onChange={(v) => set("lifeCover", v)} hint="Total term/life sum assured." />
            <MoneyField label="Existing health insurance cover" value={p.healthCover} onChange={(v) => set("healthCover", v)} hint="Family floater amount." />
            <div className="rounded-xl border border-sage-100 bg-white/60 p-4">
              <fieldset>
                <legend className="field-label mb-3">Assumptions (advanced — defaults are fine)</legend>
                <div className="grid grid-cols-3 gap-3">
                  <NumField label="Inflation" value={p.inflation} onChange={(v) => set("inflation", v)} min={2} max={12} step={0.5} suffix="%" />
                  <NumField label="Growth" value={p.preReturn} onChange={(v) => set("preReturn", v)} min={4} max={18} step={0.5} suffix="%" />
                  <NumField label="Post-ret." value={p.postReturn} onChange={(v) => set("postReturn", v)} min={3} max={12} step={0.5} suffix="%" />
                </div>
              </fieldset>
            </div>
          </fieldset>
        )}
      </div>

      {blockMessage && (
        <p role="alert" className="mt-6 rounded-lg bg-[#f7e4df] px-3 py-2 text-sm font-medium text-clay">
          {blockMessage}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          aria-label="Go to previous step"
          className="rounded-xl px-4 py-2.5 text-sm font-medium text-sage-700 transition hover:bg-sage-50 disabled:opacity-0"
        >
          ← Back
        </button>
        {step < last ? (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            disabled={stepBlocked}
            aria-label={`Continue to ${STEPS[step + 1]}`}
            aria-disabled={stepBlocked}
            className="rounded-xl bg-sage-900 px-6 py-2.5 text-sm font-semibold text-paper shadow-card transition hover:bg-sage-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue →
          </button>
        ) : (
          <button
            type="button"
            onClick={onSubmit}
            disabled={stepBlocked}
            aria-disabled={stepBlocked}
            className="rounded-xl bg-brass px-7 py-3 text-sm font-bold text-ink shadow-card transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Generate my report ✦
          </button>
        )}
      </div>
    </div>
  );
}
