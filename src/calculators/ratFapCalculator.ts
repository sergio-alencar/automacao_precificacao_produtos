// src/calculators/ratFapCalculator.ts

class RatFapCalculator extends BaseCalculator {
  name = "RAT/FAP";
  private readonly ALIQUOTA = 0.01;

  calculate(inputs: CalculationInput): number | null {
    if (!inputs.folhaMensal) {
      return null;
    }

    const calculation =
      inputs.folhaMensal *
      60 *
      this.ALIQUOTA *
      this.MULTIPLIERS.SUCESSO_ESTIMADO;

    return this.applyFloor(calculation);
  }
}
