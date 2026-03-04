// src/externalDataHelper.ts

class ExternalDataHelper {
  static getEstbanData(): any[][] {
    console.log("Fetching processed ESTBAN data from Google Sheets...");

    try {
      const spreadsheet = SpreadsheetApp.openById(ENV.ESTBAN_FILE_ID);
      const sheet = spreadsheet.getSheetByName(ENV.ESTBAN_SHEET_NAME);

      if (!sheet) {
        throw new Error(
          `Sheet "${ENV.ESTBAN_SHEET_NAME}" not found. Did the Python ETL run?`,
        );
      }

      return sheet.getDataRange().getValues();
    } catch (e: any) {
      console.error(`Failed to read ESTBAN data: ${e.message}`);
      throw e;
    }
  }
}
