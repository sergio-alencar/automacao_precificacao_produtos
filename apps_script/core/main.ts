// apps_script\core\main.ts

interface FormSubmitEvent {
  range: GoogleAppsScript.Spreadsheet.Range;
  namedValues: { [key: string]: string[] };
  values: string[];
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Automação MSL")
    .addItem("1. Gerar Apresentações Selecionadas", "processActiveRows")
    .addToUi();
}

function processActiveRows() {
  const ui = SpreadsheetApp.getUi();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(
    AppConstants.CONFIG.SHEET_NAME,
  );

  if (!sheet) {
    ui.alert(
      `Erro: A aba "${AppConstants.CONFIG.SHEET_NAME}" não foi encontrada.`,
    );
    return;
  }

  const rowsToProcess = SheetHelper.getRowsToProcess(sheet);

  if (rowsToProcess.length === 0) {
    ui.alert(
      "Por favor, selecione uma ou mais células em linhas de dados válidas.",
    );
    return;
  }

  const { headers, colIndices } = getSheetMetadata(sheet);
  const stats = { success: 0, error: 0 };

  for (const currentRow of rowsToProcess) {
    try {
      ProposalService.processRow(sheet, currentRow, headers, colIndices);
      stats.success++;
    } catch (error) {
      const errorMsg = Utils.getErrorMessage(error);
      console.error(`Error processing row ${currentRow}:`, errorMsg);

      sheet
        .getRange(currentRow, colIndices.status + 1)
        .setValue(`Erro: ${errorMsg}`);

      stats.error++;
    }
  }

  ui.alert(
    `Processamento concluído.\nSucessos: ${stats.success}\nErros: ${stats.error}`,
  );
}

function handleFormSubmit(e: FormSubmitEvent) {
  const currentRow = e.range.getRow();
  if (currentRow === 1) {
    return;
  }

  const sheet = e.range.getSheet();
  if (sheet.getName() !== AppConstants.CONFIG.SHEET_NAME) {
    return;
  }

  const { headers, colIndices } = getSheetMetadata(sheet);
  const statusCell = sheet.getRange(currentRow, colIndices.status + 1);

  try {
    ProposalService.processRow(sheet, currentRow, headers, colIndices);
  } catch (error) {
    const errorMsg = Utils.getErrorMessage(error);
    const errorStack = error instanceof Error ? error.stack : String(error);

    console.error(
      `Error processing form submission on row ${currentRow}:`,
      errorStack,
    );
    statusCell.setValue(`Erro: ${errorMsg}`);

    const cityName = getSafeCityName(sheet, currentRow, headers);
    NotificationService.sendAdminError(cityName, currentRow, errorMsg);
  }
}

function getSheetMetadata(sheet: GoogleAppsScript.Spreadsheet.Sheet) {
  const headers = SheetHelper.getHeaders(sheet);
  const { COLUMNS } = AppConstants;

  const colIndices = {
    status: SheetHelper.getColumnIndex(headers, COLUMNS.STATUS),
    email: SheetHelper.getColumnIndex(headers, COLUMNS.EMAIL),
    emailCC: SheetHelper.getColumnIndex(headers, COLUMNS.CC_EMAIL),
    lastCol: sheet.getLastColumn(),
  };

  return { headers, colIndices };
}

function getSafeCityName(
  sheet: GoogleAppsScript.Spreadsheet.Sheet,
  row: number,
  headers: string[],
): string {
  try {
    const cityIndex = headers.indexOf(AppConstants.COLUMNS.CITY);
    if (cityIndex > -1) {
      const value = sheet.getRange(row, cityIndex + 1).getValue();
      return value ? String(value) : "Município não preenchido";
    }
  } catch (error) {
    console.warn(
      `Could not retrieve city name for row ${row}. Reason: ${Utils.getErrorMessage(error)}`,
    );
  }

  return "Desconhecido";
}
