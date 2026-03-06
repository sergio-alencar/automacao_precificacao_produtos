// apps_script\calculators\vafCalculator.ts

class VafCalculator extends BaseCalculator {
  readonly name = "VAF";
  private readonly RATE = 0.04;

  calculate(inputs: CalculationInput): number | null {
    if (!inputs.icmsAnual) {
      console.warn(
        `VAF: Annual ICMS input missing for ${inputs.municipio}/${inputs.uf}. Skipping calculation.`,
      );
      return null;
    }

    const calculation =
      inputs.icmsAnual *
      this.RATE *
      this.MULTIPLIERS.DEFAULT_PERIOD *
      this.MULTIPLIERS.ESTIMATED_SUCCESS;

    return this.applyFloor(calculation);
  }
}
