// apps_script\calculators\irrfCalculator.ts

class IrrfCalculator extends BaseCalculator {
  readonly name = "IRRF";
  private readonly CONTRACT_BASE_FRACTION = 0.25;

  private readonly DISTRIBUTION_WEIGHTS = {
    TIER_1: 0.1,
    TIER_2: 0.2,
    TIER_3: 0.3,
    TIER_4: 0.4,
  } as const;

  private readonly EFFECTIVE_RATES = {
    TIER_1: 0.0024,
    TIER_2: 0.01,
    TIER_3: 0.02,
    TIER_4: 0.035,
  } as const;

  calculate(inputs: CalculationInput): number | null {
    if (!inputs.receitaAnual) {
      console.warn(
        `IRRF: Revenue input missing for ${inputs.municipio}/${inputs.uf}. Skipping calculation.`,
      );
      return null;
    }

    const rcl = inputs.receitaAnual;
    const baseContratual = rcl * this.CONTRACT_BASE_FRACTION;

    const p1 =
      baseContratual *
      this.DISTRIBUTION_WEIGHTS.TIER_1 *
      this.EFFECTIVE_RATES.TIER_1;

    const p2 =
      baseContratual *
      this.DISTRIBUTION_WEIGHTS.TIER_2 *
      this.EFFECTIVE_RATES.TIER_2;

    const p3 =
      baseContratual *
      this.DISTRIBUTION_WEIGHTS.TIER_3 *
      this.EFFECTIVE_RATES.TIER_3;

    const p4 =
      baseContratual *
      this.DISTRIBUTION_WEIGHTS.TIER_4 *
      this.EFFECTIVE_RATES.TIER_4;

    const calculation =
      (p1 + p2 + p3 + p4) *
      this.MULTIPLIERS.DEFAULT_PERIOD *
      this.MULTIPLIERS.ESTIMATED_SUCCESS;

    return this.applyFloor(calculation);
  }
}
