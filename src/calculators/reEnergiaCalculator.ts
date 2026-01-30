// src/calculators/reEnergiaCalculator.ts

class ReEnergiaCalculator extends BaseCalculator {
  name = "Re-Energia";

  private readonly MONTHS = 120;
  private readonly ALIQUOTA_RECUPERAVEL = 0.18;
  private readonly HONORARIOS_ESPECIFICOS = 0.2;

  calculate(inputs: CalculationInput): number | null {
    if (!inputs.contaLuz) {
      return null;
    }

    const calculation =
      inputs.contaLuz *
      this.MONTHS *
      this.ALIQUOTA_RECUPERAVEL *
      this.HONORARIOS_ESPECIFICOS;

    return this.applyFloor(calculation);
  }
}
