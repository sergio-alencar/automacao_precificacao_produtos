// src/sheetHelper.ts

class SheetHelper {
  private static readonly NUMERIC_HEADERS: string[] = [
    COLS.POPULACAO,
    COLS.RECEITA_ANUAL,
    COLS.FOLHA_MENSAL,
    COLS.NUM_SERVIDORES,
    COLS.CFEM_RECEITA,
    COLS.CONTA_LUZ,
  ];

  static getRowsToProcess(sheet: GoogleAppsScript.Spreadsheet.Sheet): number[] {
    const activeRange = sheet.getActiveRange();
    if (!activeRange) {
      return [];
    }

    const startRow = activeRange.getRow();
    const numRows = activeRange.getNumRows();
    const endRow = startRow + numRows - 1;
    const rowsToProcess: number[] = [];

    for (let i = startRow; i <= endRow; i++) {
      if (i > 1) {
        rowsToProcess.push(i);
      }
    }

    return [...new Set(rowsToProcess)];
  }

  static getHeaders(sheet: GoogleAppsScript.Spreadsheet.Sheet): string[] {
    return sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0]
      .map((header) => String(header).trim());
  }

  static getColumnIndex(headers: string[], columnName: string): number {
    const index = headers.indexOf(columnName);
    if (index === -1) {
      throw new Error(
        `Coluna obrigatória não encontrada: "${columnName}". Verifique se o nome no cabeçalho está exato.`,
      );
    }

    return index;
  }

  static mapRowToInputs(rowData: any[], headers: string[]): any {
    const inputs: any = {};

    headers.forEach((header, index) => {
      const rawValue = rowData[index];
      let cleanValue;
      if (this.NUMERIC_HEADERS.includes(header)) {
        cleanValue = this.parseNumber(rawValue);
      } else if (header === COLS.IS_AJF) {
        cleanValue =
          String(rawValue).toLowerCase().includes("sim") || rawValue === true;
      } else {
        cleanValue = this.parseString(rawValue);
      }

      inputs[header] = cleanValue;
    });

    return inputs;
  }

  private static parseNumber(value: any): number | undefined {
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
  }

  private static parseString(value: any): string {
    if (value === null || value === undefined) {
      return "";
    }

    let strValue = String(value).trim();
    const regex = /^munic[ií]pio de /i;

    return strValue.replace(regex, "");
  }
}
