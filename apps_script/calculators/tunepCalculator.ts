// apps_script\calculators\tunepCalculator.ts

class TunepCalculator extends BaseCalculator {
  readonly name = "TUNEP";
  private readonly VALUE_PER_INHABITANT = 180;

  calculate(inputs: CalculationInput): number | null {
    if (!inputs.populacao) {
      console.warn(
        `TUNEP: Population input missing for ${inputs.municipio}/${inputs.uf}. Skipping calculation.`,
      );
      return null;
    }

    const calculation =
      inputs.populacao *
      this.VALUE_PER_INHABITANT *
      this.MULTIPLIERS.DEFAULT_PERIOD *
      this.MULTIPLIERS.ESTIMATED_SUCCESS;

    return this.applyFloor(calculation);
  }
}
