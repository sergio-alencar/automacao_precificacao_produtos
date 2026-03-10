// apps_script\calculators\reEnergiaCalculator.ts

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
    if (!inputs.populacao) {
      console.warn(
        `Re-energia: Population not informed for ${inputs.municipio}/${inputs.municipio}. Skipping calculation.`,
      );
      return null;
    }

    const monthlyBill = this.getEstimatedBill(inputs.populacao);
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
