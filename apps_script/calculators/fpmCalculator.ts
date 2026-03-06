// apps_script\calculators\fpmCalculator.ts

class FpmCalculator extends BaseCalculator {
  readonly name = "FPM";
  private readonly TAX_RATE = 0.03;

  calculate(inputs: CalculationInput): number | null {
    if (!inputs.receitaAnual) {
      console.warn(
        `FPM: Revenue input missing for ${inputs.municipio}/${inputs.uf}. Skipping calculation.`,
      );
      return null;
    }

    const calculation =
      inputs.receitaAnual *
      this.TAX_RATE *
      this.MULTIPLIERS.DEFAULT_PERIOD *
      this.MULTIPLIERS.ESTIMATED_SUCCESS;

    return this.applyFloor(calculation);
  }
}
