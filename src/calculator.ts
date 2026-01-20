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
  [key: string]: any;
}

interface CalculationResult {
  name: string;
  value: number | null;
}

class ProductCalculator {
  private static readonly CONSTANTS = {
    GLOBAL_FLOOR: 500_000,
    ISSQN_FLOOR: 1_500_000,
    CFEM_FLOOR: 2_500_000,
    MULTIPLIERS: {
      DEFAULT_PERIOD: 5,
      HONORARIOS: 0.2,
      SUCESSO_ESTIMADO: 1.15,
    },
    ALIQUOTAS: {
      CFEM: 0.15,
      FPM: 0.03,
      VAF: 0.04,
      TUNEP: 180,
      RAT_FAP: 0.01,
    },
  };

  private static applyFloor(
    value: number | null | undefined,
    floor: number = this.CONSTANTS.GLOBAL_FLOOR,
  ): number | null {
    if (value === null || value === undefined || isNaN(value)) {
      return null;
    }

    return Math.max(value, floor);
  }

  private static normalizeString(str: string): string {
    if (!str) return "";

    return str
      .toString()
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");
  }

  private static normalizeValue(
    value: string | number | null | undefined,
  ): number {
    if (value === null || value === undefined || value === "") {
      return NaN;
    }

    if (typeof value === "number") {
      return value;
    }

    const cleanString = String(value)
      .replace("R$", "")
      .replace(/\./g, "")
      .replace(",", ".");

    return parseFloat(cleanString);
  }

  static cfem(inputs: CalculationInput): number | null {
    const validStates = ["MG", "PA"];

    if (!validStates.includes(inputs.uf)) {
      console.warn(
        `CFEM: Skipping. State "${inputs.uf}" is not in [${validStates.join(", ")}].`,
      );
      return null;
    }

    if (!inputs.cfemReceita) {
      console.warn(`CFEM: Input missing. Applying default floor.`);
      return this.CONSTANTS.CFEM_FLOOR;
    }

    const { DEFAULT_PERIOD } = this.CONSTANTS.MULTIPLIERS;
    const { CFEM } = this.CONSTANTS.ALIQUOTAS;
    const calculation = inputs.cfemReceita * DEFAULT_PERIOD * CFEM;

    return Math.max(calculation, this.CONSTANTS.CFEM_FLOOR);
  }

  static fpm(inputs: CalculationInput): number | null {
    if (!inputs.receitaAnual) return null;

    const { DEFAULT_PERIOD, SUCESSO_ESTIMADO } = this.CONSTANTS.MULTIPLIERS;
    const { FPM } = this.CONSTANTS.ALIQUOTAS;
    const calculation =
      inputs.receitaAnual * FPM * DEFAULT_PERIOD * SUCESSO_ESTIMADO;

    return this.applyFloor(calculation);
  }

  static irrf(inputs: CalculationInput): number | null {
    if (!inputs.receitaAnual) return null;

    const rcl = inputs.receitaAnual;
    const p1 = rcl * 0.25 * 0.1 * 0.0024;
    const p2 = rcl * 0.25 * 0.2 * 0.01;
    const p3 = rcl * 0.25 * 0.3 * 0.02;
    const p4 = rcl * 0.25 * 0.4 * 0.035;
    const { DEFAULT_PERIOD, SUCESSO_ESTIMADO } = this.CONSTANTS.MULTIPLIERS;
    const calculation = (p1 + p2 + p3 + p4) * DEFAULT_PERIOD * SUCESSO_ESTIMADO;

    return this.applyFloor(calculation);
  }

  static issqn(inputs: CalculationInput): number | null {
    const inputMunNorm = this.normalizeString(inputs.municipio);
    const inputUFNorm = this.normalizeString(inputs.uf);

    if (!inputMunNorm || !inputUFNorm) {
      console.warn("ISSQN: Municipality or UF missing.");
      return null;
    }

    let estbanData: any[][];
    try {
      estbanData = ExternalDataHelper.getEstbanData();
    } catch (e: any) {
      console.error(`ISSQN: Failed to fetch ESTBAN data. ${e.message}`);
      return null;
    }

    const headers = estbanData[0];
    const colMap = {
      UF: headers.indexOf("UF"),
      MUNICIPIO: headers.indexOf("MUNICIPIO"),
      VALOR: headers.indexOf("VERBETE_711_CREDORAS"),
    };

    if (Object.values(colMap).some((idx) => idx === -1)) {
      console.error("ISSQN: Required columns not found in ESTBAN data.");
      return null;
    }

    let sum = 0;
    for (let i = 1; i < estbanData.length; i++) {
      const row = estbanData[i];

      if (this.normalizeString(row[colMap.UF]) === inputUFNorm) {
        const rowMun = this.normalizeString(row[colMap.MUNICIPIO]);
        if (rowMun.startsWith(inputMunNorm)) {
          const val = this.normalizeValue(row[colMap.VALOR]);
          if (!isNaN(val)) {
            sum += val;
          }
        }
      }
    }

    if (sum === 0) {
      console.warn(
        `ISSQN: No value found for ${inputs.municipio}/${inputs.uf}. Defaulting to floor.`,
      );
      return this.applyFloor(0, this.CONSTANTS.ISSQN_FLOOR);
    }

    const calculation = sum * 0.2 * 12 * 0.25 * 0.05 * 5;

    return this.applyFloor(calculation, this.CONSTANTS.ISSQN_FLOOR);
  }

  static rat_fap(inputs: CalculationInput): number | null {
    if (!inputs.folhaMensal) return null;

    const { SUCESSO_ESTIMADO } = this.CONSTANTS.MULTIPLIERS;
    const { RAT_FAP } = this.CONSTANTS.ALIQUOTAS;
    const calculation = inputs.folhaMensal * 60 * RAT_FAP * SUCESSO_ESTIMADO;

    return this.applyFloor(calculation);
  }

  static tunep(inputs: CalculationInput): number | null {
    if (!inputs.populacao) return null;

    const { DEFAULT_PERIOD, SUCESSO_ESTIMADO } = this.CONSTANTS.MULTIPLIERS;
    const { TUNEP } = this.CONSTANTS.ALIQUOTAS;
    const calculation =
      inputs.populacao * TUNEP * DEFAULT_PERIOD * SUCESSO_ESTIMADO;

    return this.applyFloor(calculation);
  }

  static vaf(inputs: CalculationInput): number | null {
    if (!inputs.icmsAnual) return null;

    const { DEFAULT_PERIOD, SUCESSO_ESTIMADO } = this.CONSTANTS.MULTIPLIERS;
    const { VAF } = this.CONSTANTS.ALIQUOTAS;
    const calculation =
      inputs.icmsAnual * VAF * DEFAULT_PERIOD * SUCESSO_ESTIMADO;

    return this.applyFloor(calculation);
  }

  static verbas(inputs: CalculationInput): number | null {
    if (!inputs.numServidores || !inputs.folhaMensal) return null;

    const folhaAcrescida = inputs.folhaMensal * 1.2;
    let percentual = 0.6;

    if (inputs.numServidores <= 300) {
      percentual = 1.0;
    } else if (inputs.numServidores <= 600) {
      percentual = 0.9;
    } else if (inputs.numServidores <= 1000) {
      percentual = 0.8;
    } else if (inputs.numServidores <= 2000) {
      percentual = 0.7;
    }

    return this.applyFloor(folhaAcrescida * percentual);
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
    };

    const calculators = [
      { name: "CFEM", fn: this.cfem },
      { name: "FPM", fn: this.fpm },
      { name: "IRRF", fn: this.irrf },
      { name: "ISSQN", fn: this.issqn },
      { name: "RAT/FAP", fn: this.rat_fap },
      { name: "TUNEP", fn: this.tunep },
      { name: "VAF", fn: this.vaf },
      { name: "Verbas Indenizatórias", fn: this.verbas },
    ];

    return calculators.map((calc) => ({
      name: calc.name,
      value: calc.fn.call(this, inputs),
    }));
  }
}
