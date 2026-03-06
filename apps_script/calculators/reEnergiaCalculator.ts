// apps_script\calculators\reEnergiaCalculator.ts

/**
 * Calculadora: Re-Energia
 *
 * Objetivo: Estimar o Potencial de Recuperação Econômica (Crédito Estimado + Margem Técnica) para o município.
 *
 * Lógica de Definição da Conta Mensal:
 * 1. Prioridade: Usa o valor real informado no campo "Conta de luz do município" (`contaLuz`).
 * 2. Estimativa: Se o valor real não for informado, estima a conta baseada na `populacao`
 * utilizando a Tabela de Referência (faixas populacionais).
 */

class ReEnergiaCalculator extends BaseCalculator {
  readonly name = "Re-Energia";

  private readonly RECOVERABLE_MONTHS = 120;
  private readonly AVERAGE_RECOVERY_RATE = 0.18;
  private readonly TECHNICAL_MARGIN = 0.2;

  private readonly POPULATION_TABLE = [
    { min: 300_001, value: 580_000 },
    { min: 250_001, value: 500_000 },
    { min: 200_001, value: 420_000 },
    { min: 150_001, value: 340_000 },
    { min: 80_001, value: 240_000 },
    { min: 40_001, value: 175_000 },
    { min: 20_001, value: 130_000 },
    { min: 10_001, value: 95_000 },
    { min: 5_001, value: 70_000 },
    { min: 0, value: 52_500 },
  ];

  private readonly DEFAULT_MINIMUM_BILL = 52_500;

  calculate(inputs: CalculationInput): number | null {
    let monthlyBill = inputs.contaLuz;

    if (!monthlyBill && inputs.populacao) {
      monthlyBill = this.getEstimatedBill(inputs.populacao);
    }

    if (!monthlyBill) {
      console.warn(
        `Re-Energia: Missing both electricity bill and population for ${inputs.municipio}/${inputs.uf}. Skipping calculation.`,
      );
      return null;
    }

    const tenYearBase = monthlyBill * this.RECOVERABLE_MONTHS;
    const estimatedCredit = tenYearBase * this.AVERAGE_RECOVERY_RATE;
    const creditWithMargin = estimatedCredit * (1 + this.TECHNICAL_MARGIN);

    return this.applyFloor(creditWithMargin);
  }

  private getEstimatedBill(populacao: number): number {
    for (const range of this.POPULATION_TABLE) {
      if (populacao >= range.min) {
        return range.value;
      }
    }

    return this.DEFAULT_MINIMUM_BILL;
  }
}
