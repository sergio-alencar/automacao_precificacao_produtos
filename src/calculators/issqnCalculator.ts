// src/calculators/issqnCalculator.ts

class IssqnCalculator extends BaseCalculator {
  name = "ISSQN";

  calculate(inputs: CalculationInput): number | null {
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
          if (!isNaN(val)) sum += val;
        }
      }
    }

    if (sum === 0) {
      console.warn(`ISSQN: No value found. Defaulting to floor.`);
      return this.applyFloor(0);
    }

    const calculation = sum * 0.2 * 12 * 0.25 * 0.05 * 5;

    return this.applyFloor(calculation);
  }
}
