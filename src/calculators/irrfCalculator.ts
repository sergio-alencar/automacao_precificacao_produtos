// src/calculators/irrfCalculator.ts

class IrrfCalculator extends BaseCalculator {
  name = "IRRF";

  calculate(inputs: CalculationInput): number | null {
    if (!inputs.receitaAnual) {
      return null;
    }

    const rcl = inputs.receitaAnual;

    const p1 = rcl * 0.25 * 0.1 * 0.0024;
    const p2 = rcl * 0.25 * 0.2 * 0.01;
    const p3 = rcl * 0.25 * 0.3 * 0.02;
    const p4 = rcl * 0.25 * 0.4 * 0.035;

    const calculation =
      (p1 + p2 + p3 + p4) *
      this.MULTIPLIERS.DEFAULT_PERIOD *
      this.MULTIPLIERS.SUCESSO_ESTIMADO;

    return this.applyFloor(calculation);
  }
}
