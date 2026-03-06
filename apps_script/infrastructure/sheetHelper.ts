// apps_script\infrastructure\sheetHelper.ts

class SheetHelper {
  private static readonly NUMERIC_HEADERS: string[] = [
    AppConstants.COLUMNS.POPULATION,
    AppConstants.COLUMNS.ANNUAL_REVENUE,
    AppConstants.COLUMNS.MONTHLY_PAYROLL,
    AppConstants.COLUMNS.NUM_EMPLOYEES,
    AppConstants.COLUMNS.CFEM_REVENUE,
    AppConstants.COLUMNS.ELECTRICITY_BILL,
    AppConstants.COLUMNS.ANNUAL_ICMS,
  ];

  static getRowsToProcess(sheet: GoogleAppsScript.Spreadsheet.Sheet): number[] {
    const activeRange = sheet.getActiveRange();
    if (!activeRange) {
      return [];
    }

    const startRow = activeRange.getRow();
    const endRow = startRow + activeRange.getNumRows() - 1;
    const rowsToProcess: number[] = [];

    for (let i = startRow; i <= endRow; i++) {
      if (i > 1) {
        rowsToProcess.push(i);
      }
    }

    return [...new Set(rowsToProcess)];
  }

  static getHeaders(sheet: GoogleAppsScript.Spreadsheet.Sheet): string[] {
    const rawHeaders = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0];
    return rawHeaders.map((header) => String(header).trim());
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

  static mapRowToInputs(
    rowData: unknown[],
    headers: string[],
  ): Record<string, unknown> {
    const inputs: Record<string, unknown> = {};

    headers.forEach((header, index) => {
      const rawValue = rowData[index];
      let cleanValue: unknown;

      if (this.NUMERIC_HEADERS.includes(header)) {
        const parsedNum = Utils.parseCurrencyToNumber(
          rawValue as string | number,
        );
        cleanValue = isNaN(parsedNum) ? undefined : parsedNum;
      } else if (header === AppConstants.COLUMNS.IS_AJF) {
        cleanValue =
          String(rawValue).toLowerCase().includes("sim") || rawValue === true;
      } else {
        cleanValue = this.cleanStringValue(rawValue);
      }

      inputs[header] = cleanValue;
    });

    return inputs;
  }

  private static cleanStringValue(value: unknown): string {
    if (value === null || value === undefined) {
      return "";
    }

    const strValue = String(value).trim();
    const prefixRegex = /^munic[ií]pio de /i;

    return strValue.replace(prefixRegex, "");
  }
}
