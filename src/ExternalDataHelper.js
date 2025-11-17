// src/ExternalDataHelper.js

const ESTBAN_FILE_ID = "1QZ9YtVX-DCIiPO5xdg8UwuBSWMhndEbVP4lgQ61dXR0";
const ESTBAN_SHEET_NAME = "ESTBAN";

/**
 * @returns {Array<Array<any>>}
 */
function getEstbanData() {
  Logger.log("Fetching ESTBAN data from Google Sheet (live read)...");

  try {
    const ss = SpreadsheetApp.openById(ESTBAN_FILE_ID);
    const sheet = ss.getSheetByName(ESTBAN_SHEET_NAME);
    if (!sheet) {
      throw new Error(`Sheet "${ESTBAN_SHEET_NAME}" not found in file.`);
    }

    const lastRow = sheet.getLastRow();
    const ufData = sheet.getRange("B2:B" + lastRow).getValues();
    const munData = sheet.getRange("D2:D" + lastRow).getValues();
    const verbeteData = sheet.getRange("H2:H" + lastRow).getValues();
    const newData = [];
    newData.push(["UF", "MUNICIPIO", "VERBETE_711_CREDORAS"]);

    for (let i = 1; i < ufData.length; i++) {
      if (!ufData[i][0] && !munData[i][0]) continue;
      newData.push([ufData[i][0], munData[i][0], verbeteData[i][0]]);
    }

    return newData;
  } catch (e) {
    Logger.log(`Failed to read ESTBAN data: ${e}`);
    throw e;
  }
}
