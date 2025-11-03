// src/SheetHelper.gs

const SheetHelper = {
  /**
   * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
   * @returns {string[]}
   */
  getHeaders: function (sheet) {
    return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  },

  /**
   * @param {string[]} headers
   * @param {string} columnName
   * @returns {number}
   */
  getColumnIndex: function (headers, columnName) {
    const index = headers.indexOf(columnName);
    if (index === -1) {
      throw new Error(`Erro: A coluna "${columnName}" não foi encontrada.`);
    }
    return index;
  },

  /**
   * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
   * @returns {number[]}
   */
  getRowsToProcess: function (sheet) {
    const selection = sheet.getActiveRange();
    if (!selection) return [];

    const startRow = selection.getRow();
    const numRows = selection.getNumRows();

    const rowIndexes = new Set();
    for (let i = 0; i < numRows; i++) {
      const currentRowIndex = startRow + i;
      if (currentRowIndex > 1) {
        rowIndexes.add(currentRowIndex);
      }
    }

    return Array.from(rowIndexes);
  },

  /**
   * @param {Array<any>} rowData
   * @param {string[]} headers
   * @returns {Object}
   */
  mapRowToInputs: function (rowData, headers) {
    const inputs = {};
    headers.forEach((header, index) => {
      if (header) {
        const cellValue = rowData[index];

        if (cellValue === "S") {
          inputs[header] = true;
        } else if (cellValue === "N") {
          inputs[header] = false;
        } else if (typeof cellValue === "number") {
          inputs[header] = cellValue;
        } else if (typeof cellValue === "string") {
          const cleanedValue = String(cellValue).replace("R$", "").replace(/\./g, "").replace(",", ".").trim();

          const numberValue = parseFloat(cleanedValue);

          if (!isNaN(numberValue) && String(numberValue) === cleanedValue) {
            inputs[header] = numberValue;
          } else {
            inputs[header] = cellValue;
          }
        } else {
          inputs[header] = cellValue;
        }
      }
    });

    if (!inputs.municipio || !inputs.uf) {
      throw new Error("Município ou UF não preenchidos.");
    }
    return inputs;
  },
};
