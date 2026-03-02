// src/calculators/fpmCalculator.ts

class FpmCalculator extends BaseCalculator {
  name = "FPM";
  private readonly ALIQUOTA = 0.03;

  calculate(inputs: CalculationInput): number | null {
    if (!inputs.receitaAnual) {
      return null;
    }

    const calculation =
      inputs.receitaAnual *
      this.ALIQUOTA *
      this.MULTIPLIERS.DEFAULT_PERIOD *
      this.MULTIPLIERS.SUCESSO_ESTIMADO;

    return this.applyFloor(calculation);
  }
}
