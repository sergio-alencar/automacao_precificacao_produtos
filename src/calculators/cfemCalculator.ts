// src/calculators/cfemCalculator.ts

class CfemCalculator extends BaseCalculator {
  name = "CFEM";
  private readonly CFEM_FLOOR = 2_500_000;
  private readonly ALIQUOTA = 0.15;

  calculate(inputs: CalculationInput): number | null {
    const validStates = ["MG", "PA"];

    if (!validStates.includes(inputs.uf)) {
      console.warn(`CFEM: Skipping. State "${inputs.uf}" invalid.`);
      return null;
    }

    if (!inputs.cfemReceita) {
      console.warn(`CFEM: Input missing. Applying default floor.`);
      return this.CFEM_FLOOR;
    }

    const calculation =
      inputs.cfemReceita * this.MULTIPLIERS.DEFAULT_PERIOD * this.ALIQUOTA;

    return Math.max(calculation, this.CFEM_FLOOR);
  }
}
