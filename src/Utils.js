// src/Utils.gs

const Utils = {
  /**
   * @param {number} value
   * @return {string}
   */
  formatCurrency(value) {
    if (typeof value !== "number") {
      return this.formatValue(value);
    }

    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  },

  /**
   * @param {number} value
   * @return {string}
   */
  formatTotalSummary(value) {
    let val, suffix;

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
    finalString = finalString.endsWith(",0") ? finalString.slice(0, -2) : finalString;

    return `${finalString} ${suffix}`;
  },

  /**
   * @param {number | null | undefined} value
   * @return {string}
   */
  formatValue(value) {
    if (value === null || value === undefined) {
      return "N/A";
    }

    return String(value);
  },
};
