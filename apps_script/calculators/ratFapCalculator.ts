// apps_script\calculators\ratFapCalculator.ts

class RatFapCalculator extends BaseCalculator {
  readonly name = "RAT/FAP";
  private readonly RATE = 0.01;
  private readonly RETROACTIVE_MONTHS = 60;

  calculate(inputs: CalculationInput): number | null {
    if (!inputs.folhaMensal) {
      console.warn(
        `RAT/FAP: "Folha mensal" input missing for ${inputs.municipio}/${inputs.uf}. Skipping calculation.`,
      );
      return null;
    }

    const calculation =
      inputs.folhaMensal *
      this.RETROACTIVE_MONTHS *
      this.RATE *
      this.MULTIPLIERS.ESTIMATED_SUCCESS;

    return this.applyFloor(calculation);
  }
}
