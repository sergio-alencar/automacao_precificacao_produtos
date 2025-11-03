// src/Utils.gs

/**
 * @param {number} value
 * @returns {string}
 */
function formatCurrency(value) {
  if (value === null || value === undefined) return "N/A";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatTotalSummary(value) {
  if (value < 1000000) {
    return `${Math.round(value / 1000)} MIL`;
  } else {
    return `${Math.round(value / 1000000)} MILHÕES`;
  }
}
