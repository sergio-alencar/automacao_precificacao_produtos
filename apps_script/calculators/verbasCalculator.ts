// apps_script\calculators\verbasCalculator.ts

class VerbasCalculator extends BaseCalculator {
  readonly name = "Verbas Indenizatórias";
  private readonly SAFETY_MARGIN_MULTIPLIER = 1.2;
  private readonly DEFAULT_TIER_PERCENTAGE = 0.6;

  private readonly TIERS = [
    { maxEmployees: 300, percentage: 1.0 },
    { maxEmployees: 600, percentage: 0.9 },
    { maxEmployees: 1000, percentage: 0.8 },
    { maxEmployees: 2000, percentage: 0.7 },
  ] as const;

  calculate(inputs: CalculationInput): number | null {
    if (!inputs.numServidores || !inputs.folhaMensal) {
      console.warn(
        `Verbas Indenizatórias: Missing employees or payroll for ${inputs.municipio}/${inputs.uf}. Skipping.`,
      );
      return null;
    }

    const adjustedPayroll = inputs.folhaMensal * this.SAFETY_MARGIN_MULTIPLIER;
    const applicablePercentage = this.getTierPercentage(inputs.numServidores);
    const estimatedRecovery = adjustedPayroll * applicablePercentage;

    return this.applyFloor(estimatedRecovery);
  }

  private getTierPercentage(numEmployees: number): number {
    for (const tier of this.TIERS) {
      if (numEmployees <= tier.maxEmployees) {
        return tier.percentage;
      }
    }

    return this.DEFAULT_TIER_PERCENTAGE;
  }
}
