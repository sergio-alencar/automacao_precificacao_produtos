// src/calculators/tunepCalculator.ts

class TunepCalculator extends BaseCalculator {
  name = "TUNEP";
  private readonly VALOR_POR_HABITANTE = 180;

  calculate(inputs: CalculationInput): number | null {
    if (!inputs.populacao) {
      return null;
    }

    const calculation =
      inputs.populacao *
      this.VALOR_POR_HABITANTE *
      this.MULTIPLIERS.DEFAULT_PERIOD *
      this.MULTIPLIERS.SUCESSO_ESTIMADO;

    return this.applyFloor(calculation);
  }
}
