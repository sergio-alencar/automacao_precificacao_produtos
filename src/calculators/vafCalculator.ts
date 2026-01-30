// src/calculators/vafCalculator.ts

class VafCalculator extends BaseCalculator {
  name = "VAF";
  private readonly ALIQUOTA = 0.04;

  calculate(inputs: CalculationInput): number | null {
    if (!inputs.icmsAnual) {
      return null;
    }

    const calculation =
      inputs.icmsAnual *
      this.ALIQUOTA *
      this.MULTIPLIERS.DEFAULT_PERIOD *
      this.MULTIPLIERS.SUCESSO_ESTIMADO;

    return this.applyFloor(calculation);
  }
}
