// apps_script\calculators\calculatorFactory.ts

class CalculatorFactory {
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
    const { COLUMNS } = AppConstants;

    const inputs: CalculationInput = {
      uf: rawInputs[COLUMNS.STATE],
      municipio: rawInputs[COLUMNS.CITY],
      receitaAnual: rawInputs[COLUMNS.ANNUAL_REVENUE],
      folhaMensal: rawInputs[COLUMNS.MONTHLY_PAYROLL],
      populacao: rawInputs[COLUMNS.POPULATION],
      numServidores: rawInputs[COLUMNS.NUM_EMPLOYEES],
      icmsAnual: rawInputs[COLUMNS.ANNUAL_ICMS],
      cfemReceita: rawInputs[COLUMNS.CFEM_REVENUE],
      contaLuz: rawInputs[COLUMNS.ELECTRICITY_BILL],
    };

    return this.getCalculators().map((calc) => {
      try {
        return {
          name: calc.name,
          value: calc.calculate(inputs),
        };
      } catch (error) {
        console.error(
          `Error calculating product ${calc.name}:`,
          Utils.getErrorMessage(error),
        );

        return {
          name: calc.name,
          value: null,
        };
      }
    });
  }
}
