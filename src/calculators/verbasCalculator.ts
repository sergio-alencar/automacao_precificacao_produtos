// src/calculators/verbasCalculator.ts

class VerbasCalculator extends BaseCalculator {
  name = "Verbas Indenizatórias";

  calculate(inputs: CalculationInput): number | null {
    if (!inputs.numServidores || !inputs.folhaMensal) {
      return null;
    }

    const folhaAcrescida = inputs.folhaMensal * 1.2;
    let percentual = 0.6;

    if (inputs.numServidores <= 300) {
      percentual = 1.0;
    } else if (inputs.numServidores <= 600) {
      percentual = 0.9;
    } else if (inputs.numServidores <= 1_000) {
      percentual = 0.8;
    } else if (inputs.numServidores <= 2_000) {
      percentual = 0.7;
    }

    return this.applyFloor(folhaAcrescida * percentual);
  }
}
