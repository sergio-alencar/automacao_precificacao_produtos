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

    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  },

  /**
   * @param {number} value
   * @return {string}
   */
  formatTotalSummary(value) {
    if (value < 1000000) {
      return `${Math.round(value / 1000)} MIL`;
    } else if (value < 1000000000) {
      const finalValue = Math.round(value / 1000000);
      return finalValue > 1 ? `${finalValue} MILHÕES` : `${finalValue} MILHÃO`;
    } else {
      const finalValue = Math.round(value / 1000000000);
      return finalValue > 1 ? `${finalValue} BILHÕES` : `${finalValue} BILHÃO`;
    }
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
