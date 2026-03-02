// src/main.ts

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
    CONFIG.SHEET_NAME,
  );

  if (!sheet) {
    ui.alert(`Erro: A aba "${CONFIG.SHEET_NAME}" não foi encontrada.`);
    return;
  }

  const rowsToProcess = SheetHelper.getRowsToProcess(sheet);

  if (rowsToProcess.length === 0) {
    ui.alert("Por favor, selecione uma ou mais células em linhas de dados.");
    return;
  }

  const { headers, colIndices } = getSheetMetadata(sheet);
  let stats = { success: 0, error: 0 };

  for (const currentRow of rowsToProcess) {
    try {
      ProposalService.processRow(sheet, currentRow, headers, colIndices);
      stats.success++;
    } catch (e: any) {
      console.error(`Error processing row ${currentRow}: ${e.message}`);
      sheet
        .getRange(currentRow, colIndices.status + 1)
        .setValue(`Erro: ${e.message}`);
      stats.error++;
    }
  }

  ui.alert(
    `Processamento concluído.\nSucessos: ${stats.success}\nErros: ${stats.error}`,
  );
}

function handleFormSubmit(e: FormSubmitEvent) {
  const currentRow = e.range.getRow();
  if (currentRow === 1) return;

  const sheet = e.range.getSheet();
  if (sheet.getName() !== CONFIG.SHEET_NAME) return;

  const { headers, colIndices } = getSheetMetadata(sheet);
  const statusCell = sheet.getRange(currentRow, colIndices.status + 1);

  try {
    ProposalService.processRow(sheet, currentRow, headers, colIndices);
  } catch (err: any) {
    console.error(`Error processing row ${currentRow}: ${err.stack}`);
    statusCell.setValue(`Erro: ${err.message}`);

    const municipio = getMunicipioSafe(sheet, currentRow, headers);
    NotificationService.sendAdminError(municipio, currentRow, err.message);
  }
}

function getSheetMetadata(sheet: GoogleAppsScript.Spreadsheet.Sheet) {
  const headers = SheetHelper.getHeaders(sheet);
  const colIndices = {
    status: SheetHelper.getColumnIndex(headers, COLS.STATUS),
    email: SheetHelper.getColumnIndex(headers, COLS.EMAIL),
    emailCC: SheetHelper.getColumnIndex(headers, COLS.EMAIL_CC),
    lastCol: sheet.getLastColumn(),
  };

  return { headers, colIndices };
}

function getMunicipioSafe(
  sheet: GoogleAppsScript.Spreadsheet.Sheet,
  row: number,
  headers: string[],
): string {
  try {
    const munIdx = headers.indexOf(COLS.MUNICIPIO);
    if (munIdx > -1) {
      return sheet.getRange(row, munIdx + 1).getValue();
    }
  } catch {}

  return "Desconhecido";
}
