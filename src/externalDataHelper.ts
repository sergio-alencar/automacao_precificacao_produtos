// src/externalDataHelper.ts

class ExternalDataHelper {
  private static readonly ESTBAN_FILE_ID =
    "1QZ9YtVX-DCIiPO5xdg8UwuBSWMhndEbVP4lgQ61dXR0";
  private static readonly ESTBAN_SHEET_NAME = "ESTBAN";

  static getEstbanData(): any[][] {
    console.log("Fetching ESTBAN data from Google Sheets (live read)...");

    try {
      const ss = SpreadsheetApp.openById(this.ESTBAN_FILE_ID);
      const sheet = ss.getSheetByName(this.ESTBAN_SHEET_NAME);

      if (!sheet) {
        throw new Error(`Sheet "${this.ESTBAN_SHEET_NAME}" not found in file.`);
      }

      const lastRow = sheet.getLastRow();

      if (lastRow < 2) {
        return [["UF", "MUNICIPIO", "VERBETE_711_CREDORAS"]];
      }

      const numRows = lastRow - 1;
      const dataBlock = sheet.getRange(2, 2, numRows, 7).getValues();
      const newData: any[][] = [];
      newData.push(["UF", "MUNICIPIO", "VERBETE_711_CREDORAS"]);

      for (let i = 0; i < dataBlock.length; i++) {
        const row = dataBlock[i];
        const uf = row[0];
        const municipio = row[2];
        const verbete = row[6];

        if (!uf && !municipio) continue;

        newData.push([uf, municipio, verbete]);
      }

      return newData;
    } catch (e: any) {
      console.error(`Failed to read ESTBAN data: ${e.message}`);
      throw e;
    }
  }
}
