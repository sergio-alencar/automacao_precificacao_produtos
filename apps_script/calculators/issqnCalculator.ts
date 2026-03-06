// apps_script\calculators\issqnCalculator.ts

class IssqnCalculator extends BaseCalculator {
  readonly name = "ISSQN";

  private readonly RECOVERY_POTENTIAL_RATE = 0.2;
  private readonly TAX_BASE_RATE = 0.25;
  private readonly ISSQN_TAX_RATE = 0.05;
  private readonly RETROACTIVE_MONTHS = 60;
  private readonly COSIF_ACCUMULATION_FACTOR = 3.5;

  calculate(inputs: CalculationInput): number | null {
    const inputMunNorm = Utils.normalizeText(inputs.municipio);
    const inputUFNorm = Utils.normalizeText(inputs.uf);

    if (!inputMunNorm || !inputUFNorm) {
      console.warn("ISSQN: Municipality or UF missing. Skipping calculation.");
      return null;
    }

    const rawEstbanValue = this.findEstbanValue(inputUFNorm, inputMunNorm);
    if (rawEstbanValue === null || rawEstbanValue === 0) {
      console.warn(
        `ISSQN: No ESTBAN value found for ${inputs.municipio}/${inputs.uf}. Defaulting to floor.`,
      );
      return this.applyFloor(0);
    }

    return this.performMath(rawEstbanValue);
  }

  private findEstbanValue(ufNorm: string, munNorm: string): number | null {
    let estbanData: unknown[][];

    try {
      estbanData = ExternalDataHelper.getEstbanData();
    } catch (error) {
      console.error(
        `ISSQN: Failed to fetch ESTBAN data. ${Utils.getErrorMessage(error)}`,
      );
      return null;
    }

    if (!estbanData || estbanData.length < 2) {
      console.error("ISSQN: ESTBAN data is empty or missing headers.");
      return null;
    }

    const headers = estbanData[0] as string[];
    const colMap = {
      UF: headers.indexOf("UF"),
      MUNICIPIO: headers.indexOf("MUNICIPIO"),
      VALUE: headers.indexOf("VERBETE_711_CONTAS_CREDORAS_AVG"),
    };

    const hasMissingColumns = Object.values(colMap).some((idx) => idx === -1);
    if (hasMissingColumns) {
      console.error(
        `ISSQN: Required columns not found. Mapped indexes: ${JSON.stringify(colMap)}`,
      );
      return null;
    }

    let totalEstbanValue = 0;
    for (let i = 1; i < estbanData.length; i++) {
      const row = estbanData[i] as string[];
      if (Utils.normalizeText(row[colMap.UF]) !== ufNorm) {
        continue;
      }

      const rowMun = Utils.normalizeText(row[colMap.MUNICIPIO]);
      if (rowMun.startsWith(munNorm)) {
        const val = Utils.parseCurrencyToNumber(row[colMap.VALUE]);
        if (!isNaN(val)) {
          totalEstbanValue += val;
        }
      }
    }

    return totalEstbanValue;
  }

  private performMath(rawEstbanValue: number): number | null {
    const trueMonthlyRevenue = rawEstbanValue / this.COSIF_ACCUMULATION_FACTOR;

    const recoveryPotential = trueMonthlyRevenue * this.RECOVERY_POTENTIAL_RATE;
    const taxBase = recoveryPotential * this.TAX_BASE_RATE;
    const monthlyTaxDue = taxBase * this.ISSQN_TAX_RATE;

    const finalCalculation = monthlyTaxDue * this.RETROACTIVE_MONTHS;

    return this.applyFloor(finalCalculation);
  }
}
