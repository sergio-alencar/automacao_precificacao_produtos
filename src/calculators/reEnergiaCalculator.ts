// src/calculators/reEnergiaCalculator.ts

/**
 * Calculadora: Re-Energia
 *
 * Objetivo: Estimar o Potencial de Recuperação Econômica (Crédito Estimado + Margem Técnica) para o município.
 *
 * Lógica de Definição da Conta Mensal:
 * 1. Prioridade: Usa o valor real informado no campo "Conta de luz do município" (`contaLuz`).
 * 2. Estimativa: Se o valor real não for informado, estima a conta baseada na `populacao`
 * utilizando a Tabela de Referência (faixas populacionais).
 *
 * Fórmula de Cálculo:
 * O cálculo segue 3 etapas sequenciais conforme planilha de precificação:
 *
 * 1. Base Temporal (10 anos):
 * Base = Conta Mensal * 120 meses
 *
 * 2. Crédito Estimado (Recuperável):
 * Crédito = Base * 18% (Alíquota média de recuperação)
 *
 * 3. Aplicação da Margem Técnica (Valor Final):
 * Resultado = Crédito * 1.20 (Acréscimo de 20% de margem técnica)
 *
 * Expressão Resumida:
 * Valor = (Conta * 120 * 0.18 * 1.20)
 */

class ReEnergiaCalculator extends BaseCalculator {
  name = "Re-Energia";

  private readonly MONTHS = 120;
  private readonly ALIQUOTA_RECUPERAVEL = 0.18;
  private readonly MARGEM_TECNICA = 0.2;

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

  calculate(inputs: CalculationInput): number | null {
    let monthlyBill = inputs.contaLuz;

    if (!monthlyBill && inputs.populacao) {
      monthlyBill = this.getEstimatedBill(inputs.populacao);
    }

    if (!monthlyBill) {
      return null;
    }

    const base10Anos = monthlyBill * this.MONTHS;
    const creditoEstimado = base10Anos * this.ALIQUOTA_RECUPERAVEL;
    const creditoComMargem = creditoEstimado * (1 + this.MARGEM_TECNICA);

    return this.applyFloor(creditoComMargem);
  }

  private getEstimatedBill(populacao: number): number {
    for (const range of this.POPULATION_TABLE) {
      if (populacao >= range.min) {
        return range.value;
      }
    }
    return 52_500;
  }
}
