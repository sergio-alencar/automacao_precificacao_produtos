// apps_script\calculators\baseCalculator.ts

abstract class BaseCalculator {
  protected readonly GLOBAL_FLOOR = 1_500_000;

  protected readonly MULTIPLIERS = {
    DEFAULT_PERIOD: 5,
    SUCCESS_FEE: 0.2, // honorários
    ESTIMATED_SUCCESS: 1.15,
  };

  abstract readonly name: string;

  abstract calculate(inputs: CalculationInput): number | null;

  protected applyFloor(
    value: number | null | undefined,
    floor: number = this.GLOBAL_FLOOR,
  ): number | null {
    if (value === null || value === undefined || isNaN(value)) {
      return null;
    }

    return Math.max(value, floor);
  }
}
