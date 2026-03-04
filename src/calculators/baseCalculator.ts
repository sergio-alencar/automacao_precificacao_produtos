// src\calculators\baseCalculator.ts

abstract class BaseCalculator {
  protected readonly GLOBAL_FLOOR = 1_500_000;

  protected readonly MULTIPLIERS = {
    DEFAULT_PERIOD: 5,
    HONORARIOS: 0.2,
    SUCESSO_ESTIMADO: 1.15,
  };

  abstract name: string;

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

  protected normalizeString(str: string): string {
    if (!str) {
      return "";
    }

    return str
      .toString()
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");
  }

  protected normalizeValue(value: any): number {
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
}
