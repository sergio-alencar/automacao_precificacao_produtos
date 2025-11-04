// src/Utils.gs

const Utils = {
  /**
   * @param {number} value
   * @return {string}
   */
  formatCurrency: function (value) {
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
  formatTotalSummary: function (value) {
    if (value < 1000000) {
      return `${Math.round(value / 1000)} MIL`;
    } else {
      return `${Math.round(value / 1000000)} MILHÕES`;
    }
  },

  /**
   * @param {number | null | undefined} value
   * @return {string}
   */
  formatValue: function (value) {
    if (value === null || value === undefined) {
      return "Não Aplicável";
    }
    return this.formatCurrency(value);
  },
};
