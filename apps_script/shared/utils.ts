// apps_script\shared\utils.ts

class Utils {
  static formatCurrency(value: number | null | undefined): string {
    if (value === null || value === undefined || isNaN(value)) {
      return Utils.formatValue(value);
    }

    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  static formatTotalSummary(value: number): string {
    if (value === null || value === undefined || isNaN(value)) {
      return "N/A";
    }

    let val: number;
    let suffix: string;

    if (value < 1e6) {
      val = value / 1e3;
      suffix = "MIL";
    } else if (value < 1e9) {
      val = value / 1e6;
      suffix = val >= 2 ? "MILHÕES" : "MILHÃO";
    } else if (value < 1e12) {
      val = value / 1e9;
      suffix = val >= 2 ? "BILHÕES" : "BILHÃO";
    } else {
      val = value / 1e12;
      suffix = val >= 2 ? "TRILHÕES" : "TRILHÃO";
    }

    let finalString = val.toFixed(1).replace(".", ",");

    if (finalString.endsWith(",0")) {
      finalString = finalString.slice(0, -2);
    }

    return `${finalString} ${suffix}`;
  }

  static formatValue(value: unknown): string {
    if (value === null || value === undefined) {
      return "N/A";
    }

    return String(value);
  }

  static normalizeText(str: string): string {
    if (!str) {
      return "";
    }

    return String(str)
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");
  }

  static parseCurrencyToNumber(
    value: string | number | null | undefined,
  ): number {
    if (value === null || value === undefined || value === "") {
      return NaN;
    }

    if (typeof value === "number") {
      return value;
    }

    const cleanString = String(value)
      .replace(/[^\d,-]/g, "")
      .replace(",", ".");

    return parseFloat(cleanString);
  }

  static getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
