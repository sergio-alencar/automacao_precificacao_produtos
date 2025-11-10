// src/Main.gs

/**
 * @OnlyCurrentDoc
 */

const TEMPLATE_ID = "1wWHtPJAXyRPZpG9kVka9qfzrsAogpHHT2_3e3zPpN0o";
const OUTPUT_FOLDER_ID = "1edKkvPT0XXP-SrRHXw_tRATdnUamXBCR";
const SHEET_NAME = "Respostas ao formulário 1";
const STATUS_COLUMN_NAME = COLS.STATUS;
const EMAIL_COLUMN_NAME = COLS.EMAIL;

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Automação MSL")
    .addItem("1. Gerar Apresentações Selecionadas", "processActiveRows")
    .addToUi();
}

function processActiveRows() {
  const ui = SpreadsheetApp.getUi();
  const sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

  if (!sheet) {
    ui.alert(`Erro: A aba "${SHEET_NAME}" não foi encontrada.`);
    return;
  }

  const rowsToProcess = SheetHelper.getRowsToProcess(sheet);
  if (rowsToProcess.length === 0) {
    ui.alert(
      "Por favor, selecione uma ou mais células em linhas de dados (abaixo do cabeçalho)."
    );
    return;
  }

  const headers = SheetHelper.getHeaders(sheet);
  const lastCol = sheet.getLastColumn();
  const statusColIdx = SheetHelper.getColumnIndex(headers, STATUS_COLUMN_NAME);
  const emailColIdx = SheetHelper.getColumnIndex(headers, EMAIL_COLUMN_NAME);

  let successCount = 0;
  let errorCount = 0;

  for (const currentRow of rowsToProcess) {
    const statusCell = sheet.getRange(currentRow, statusColIdx + 1);
    const rowData = sheet.getRange(currentRow, 1, 1, lastCol).getValues()[0];
    const email = rowData[emailColIdx];

    if (!email) {
      statusCell.setValue("Erro: Email para envio não preenchido.");
      errorCount++;
      continue;
    }

    try {
      statusCell.setValue("Processando...");
      SpreadsheetApp.flush();

      const inputs = SheetHelper.mapRowToInputs(rowData, headers);
      Logger.log(`Processing ${inputs[COLS.MUNICIPIO]}/${inputs[COLS.UF]}...`);

      const results = ProductCalculator.calculateAllProducts(inputs);
      Logger.log(`Calculated results: ${JSON.stringify(results)}`);

      const pdfFile = SlideGenerator.generatePresentation(
        TEMPLATE_ID,
        OUTPUT_FOLDER_ID,
        inputs[COLS.MUNICIPIO],
        inputs[COLS.UF],
        results
      );
      Logger.log(`Presentation created: ${pdfFile.getName()}`);

      EmailService.sendEmailWithAttachment(
        email,
        inputs[COLS.MUNICIPIO],
        inputs[COLS.UF],
        pdfFile
      );
      Logger.log(`Email sent to ${email}.`);

      const url = pdfFile.getUrl();
      statusCell
        .setValue("Concluído")
        .setRichTextValue(
          SpreadsheetApp.newRichTextValue()
            .setText("Concluído")
            .setLinkUrl(url)
            .build()
        );
      successCount++;
    } catch (e) {
      Logger.log(`Error processing row ${currentRow}: ${e.stack}`);
      statusCell.setValue(`Erro: ${e.message}`);
      errorCount++;
    }
  }

  ui.alert(
    `Processamento concluído.\nSucessos: ${successCount}\nErros: ${errorCount}`
  );
}

function handleFormSubmit(e) {
  const currentRow = e.range.getRow();

  if (currentRow === 1) {
    Logger.log("Trigger activated for row 1 (header). Ignoring.");
    return;
  }

  const sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const headers = SheetHelper.getHeaders(sheet);
  const lastCol = sheet.getLastColumn();

  const statusColIdx = SheetHelper.getColumnIndex(headers, STATUS_COLUMN_NAME);
  const emailColIdx = SheetHelper.getColumnIndex(headers, EMAIL_COLUMN_NAME);

  const statusCell = sheet.getRange(currentRow, statusColIdx + 1);
  const rowData = sheet.getRange(currentRow, 1, 1, lastCol).getValues()[0];
  const email = rowData[emailColIdx];

  if (!email) {
    statusCell.setValue("Erro: Email para envio não preenchido.");
    return;
  }

  try {
    statusCell.setValue("Processando...");
    SpreadsheetApp.flush();

    const inputs = SheetHelper.mapRowToInputs(rowData, headers);
    Logger.log(`Processing "${inputs[COLS.MUNICIPIO]}/${inputs[COLS.UF]}"...`);

    const results = ProductCalculator.calculateAllProducts(inputs);
    Logger.log(`Calculated results: ${JSON.stringify(results)}`);

    const pdfFile = SlideGenerator.generatePresentation(
      TEMPLATE_ID,
      OUTPUT_FOLDER_ID,
      inputs[COLS.MUNICIPIO],
      inputs[COLS.UF],
      results
    );
    Logger.log(`Presentation created: ${pdfFile.getName()}`);

    EmailService.sendEmailWithAttachment(
      email,
      inputs[COLS.MUNICIPIO],
      inputs[COLS.UF],
      pdfFile
    );
    Logger.log(`Email sent to ${email}.`);

    const url = pdfFile.getUrl();
    statusCell
      .setValue("Concluído")
      .setRichTextValue(
        SpreadsheetApp.newRichTextValue()
          .setText("Concluído")
          .setLinkUrl(url)
          .build()
      );
  } catch (err) {
    Logger.log(`Error processing row ${currentRow}: ${err.stack}`);
    statusCell.setValue(`Erro: ${err.message}`);
  }
}
