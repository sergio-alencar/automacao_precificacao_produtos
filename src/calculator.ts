// src/calculator.ts

interface CalculationInput {
  uf: string;
  municipio: string;
  receitaAnual?: number;
  folhaMensal?: number;
  populacao?: number;
  numServidores?: number;
  icmsAnual?: number;
  cfemReceita?: number;
  contaLuz?: number;
  [key: string]: any;
}

interface CalculationResult {
  name: string;
  value: number | null;
}

class ProductCalculator {
  private static getCalculators(): BaseCalculator[] {
    return [
      new CfemCalculator(),
      new FpmCalculator(),
      new IrrfCalculator(),
      new IssqnCalculator(),
      new RatFapCalculator(),
      new TunepCalculator(),
      new VafCalculator(),
      new VerbasCalculator(),
      new ReEnergiaCalculator(),
    ];
  }

  static calculateAllProducts(rawInputs: any): CalculationResult[] {
    const inputs: CalculationInput = {
      uf: rawInputs[COLS.UF],
      municipio: rawInputs[COLS.MUNICIPIO],
      receitaAnual: rawInputs[COLS.RECEITA_ANUAL],
      folhaMensal: rawInputs[COLS.FOLHA_MENSAL],
      populacao: rawInputs[COLS.POPULACAO],
      numServidores: rawInputs[COLS.NUM_SERVIDORES],
      icmsAnual: rawInputs[COLS.ICMS_ANUAL],
      cfemReceita: rawInputs[COLS.CFEM_RECEITA],
      contaLuz: rawInputs[COLS.CONTA_LUZ],
    };

    return this.getCalculators().map((calc) => ({
      name: calc.name,
      value: calc.calculate(inputs),
    }));
  }
}
