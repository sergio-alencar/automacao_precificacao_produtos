// src/SheetHelper.gs

/**
 * @OnlyCurrentDoc
 */

const SheetHelper = {
  /**
   * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
   * @returns {number[]}
   */
  getRowsToProcess(sheet) {
    const activeRange = sheet.getActiveRange();

    if (!activeRange) return [];

    const startRow = activeRange.getRow();
    const numRows = activeRange.getNumRows();
    const endRow = startRow + numRows - 1;

    let rowsToProcess = [];
    for (let i = startRow; i <= endRow; i++) {
      if (i > 1) rowsToProcess.push(i);
    }

    return [...new Set(rowsToProcess)];
  },

  /**
   * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
   * @returns {string[]}
   */
  getHeaders(sheet) {
    return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  },

  /**
   * @param {string[]} headers
   * @param {string} columnName
   * @returns {number}
   */
  getColumnIndex(headers, columnName) {
    const index = headers.indexOf(columnName);

    if (index === -1) {
      throw new Error(`Coluna obrigatória não encontrada: ${columnName}.`);
    }

    return index;
  },

  /**
   * @param {any[]} rowData
   * @param {string[]} headers
   * @return {Object}
   */
  mapRowToInputs(rowData, headers) {
    const inputs = {};

    headers.forEach((header, index) => {
      const rawValue = rowData[index];
      let cleanValue;

      const numericHeaders = [
        COLS.POPULACAO,
        COLS.RECEITA_ANUAL,
        COLS.FOLHA_MENSAL,
        COLS.NUM_SERVIDORES,
        COLS.NUM_ALUNOS,
        COLS.ICMS_ANUAL,
        COLS.CFEM_RECEITA,
        COLS.ENERGIA_GERADA,
        COLS.AREA_INUNDADA,
        COLS.TAR,
        COLS.AREA_RESERVATORIO,
      ];

      if (numericHeaders.includes(header)) {
        cleanValue = this._parseNumber(rawValue);
      } else {
        cleanValue = this._parseString(rawValue);
      }

      inputs[header] = cleanValue;
    });

    return inputs;
  },

  /**
   * @param {any} value
   * @return {number | undefined}
   */
  _parseNumber(value) {
    if (value === null || value === undefined || value === "") {
      return undefined;
    }

    if (typeof value === "number") {
      return value;
    }

    const cleanString = String(value)
      .replace("R$", "")
      .replace(/\./g, "")
      .replace(",", ".")
      .trim();
    const number = parseFloat(cleanString);

    return isNaN(number) ? undefined : number;
  },

  /**
   * @param {any} value
   * @return {string}
   */
  _parseString(value) {
    if (value === null || value === undefined) {
      return "";
    }

    let strValue = String(value).trim();
    const regex = /^munic[ií]pio de /i;

    return strValue.replace(regex, "");
  },
};
