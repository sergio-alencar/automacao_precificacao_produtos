// apps_script\infrastructure\externalDataHelper.ts

class ExternalDataHelper {
  private static cachedEstbanData: unknown[][] | null = null;

  static getEstbanData(): unknown[][] {
    if (this.cachedEstbanData) {
      return this.cachedEstbanData;
    }

    console.log("Fetching processed ESTBAN data from Google Sheets API...");

    try {
      const spreadsheet = SpreadsheetApp.openById(ENV.ESTBAN_FILE_ID);
      const sheet = spreadsheet.getSheetByName(ENV.ESTBAN_SHEET_NAME);

      if (!sheet) {
        throw new Error(
          `Sheet "${ENV.ESTBAN_SHEET_NAME}" not found. Did the Python ETL run?`,
        );
      }

      this.cachedEstbanData = sheet.getDataRange().getValues();

      console.log(
        `Successfully cached ${this.cachedEstbanData.length} rows from ESTBAN.`,
      );
      return this.cachedEstbanData;
    } catch (error) {
      const errorMsg = Utils.getErrorMessage(error);
      console.error(`Failed to read ESTBAN data: ${errorMsg}`);
      throw new Error(`ExternalDataHelper Error: ${errorMsg}`);
    }
  }
}
