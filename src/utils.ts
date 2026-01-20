// src/utils.ts

class Utils {
  static formatCurrency(value: number | null | undefined): string {
    if (value === null || value === undefined || isNaN(value)) {
      return this.formatValue(value);
    }

    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  static formatTotalSummary(value) {
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
      finalString.slice(0, -2);
    }

    return `${finalString} ${suffix}`;
  }

  static formatValue(value: any): string {
    if (value === null || value === undefined) {
      return "N/A";
    }

    return String(value);
  }
}
