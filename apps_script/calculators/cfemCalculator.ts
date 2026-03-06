// apps_script\calculators\cfemCalculator.ts

class CfemCalculator extends BaseCalculator {
  readonly name = "CFEM";

  private readonly CFEM_FLOOR = 2_500_000;
  private readonly TAX_RATE = 0.15;
  private readonly ELIGIBLE_STATES = ["MG", "PA"];

  calculate(inputs: CalculationInput): number | null {
    if (!this.ELIGIBLE_STATES.includes(inputs.uf)) {
      console.warn(`CFEM: Skipping. State "${inputs.uf}" is not eligible.`);
      return null;
    }

    if (!inputs.cfemReceita) {
      console.warn(
        `CFEM: Revenue input missing for ${inputs.municipio}/${inputs.uf}. Applying specific floor.`,
      );
      return this.CFEM_FLOOR;
    }

    const calculation =
      inputs.cfemReceita * this.MULTIPLIERS.DEFAULT_PERIOD * this.TAX_RATE;

    return Math.max(calculation, this.CFEM_FLOOR);
  }
}
