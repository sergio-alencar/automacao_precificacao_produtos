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
    ui.alert(
      "Por favor, selecione uma ou mais células em linhas de dados (abaixo do cabeçalho).",
    );
    return;
  }

  const headers = SheetHelper.getHeaders(sheet);
  const colIndices = {
    status: SheetHelper.getColumnIndex(headers, COLS.STATUS),
    email: SheetHelper.getColumnIndex(headers, COLS.EMAIL),
    emailCC: SheetHelper.getColumnIndex(headers, COLS.EMAIL_CC),
    lastCol: sheet.getLastColumn(),
  };

  let successCount = 0;
  let errorCount = 0;

  for (const currentRow of rowsToProcess) {
    try {
      processSingleRow(currentRow, sheet, headers, colIndices);
      successCount++;
    } catch (e: any) {
      console.error(`Error processing row ${currentRow}: ${e.message}`);
      sheet
        .getRange(currentRow, colIndices.status + 1)
        .setValue(`Erro: ${e.message}`);
    }
    errorCount++;
  }

  ui.alert(
    `Processamento concluído.\nSucessos: ${successCount}\nErros: ${errorCount}`,
  );
}

function handleFormSubmit(e: FormSubmitEvent) {
  const currentRow = e.range.getRow();

  if (currentRow === 1) return;

  const sheet = e.range.getSheet();

  if (sheet.getName() !== CONFIG.SHEET_NAME) return;

  const headers = SheetHelper.getHeaders(sheet);
  const colIndices = {
    status: SheetHelper.getColumnIndex(headers, COLS.STATUS),
    email: SheetHelper.getColumnIndex(headers, COLS.EMAIL),
    emailCC: SheetHelper.getColumnIndex(headers, COLS.EMAIL_CC),
    lastCol: sheet.getLastColumn(),
  };

  const statusCell = sheet.getRange(currentRow, colIndices.status + 1);

  try {
    processSingleRow(currentRow, sheet, headers, colIndices);
  } catch (err: any) {
    console.error(`Error processing row ${currentRow}: ${err.stack}`);
    statusCell.setValue(`Erro: ${err.message}`);

    let municipio = "Desconhecido";
    try {
      const rowData = sheet
        .getRange(currentRow, 1, 1, colIndices.lastCol)
        .getValues()[0];
      const munIdx = headers.indexOf(COLS.MUNICIPIO);
      if (munIdx > -1) {
        municipio = rowData[munIdx];
      }
    } catch {}

    sendAdminErrorEmail(municipio, currentRow, err.message);
  }
}

function processSingleRow(
  currentRow: number,
  sheet: GoogleAppsScript.Spreadsheet.Sheet,
  headers: string[],
  indices: { status: number; email: number; emailCC: number; lastCol: number },
) {
  const statusCell = sheet.getRange(currentRow, indices.status + 1);
  const rowData = sheet
    .getRange(currentRow, 1, 1, indices.lastCol)
    .getValues()[0];
  const email = rowData[indices.email];
  const emailCC = rowData[indices.emailCC];

  if (!email) {
    throw new Error("Email para envio não preenchido.");
  }

  statusCell.setValue("Processando...");
  SpreadsheetApp.flush();

  const rawInputs = SheetHelper.mapRowToInputs(rowData, headers);
  console.log(
    `Processing "${rawInputs[COLS.MUNICIPIO]}/${rawInputs[COLS.UF]}"...`,
  );

  const isAjf =
    rawInputs[COLS.IS_AJF] === true ||
    String(rawInputs[COLS.IS_AJF]).toLowerCase() === "sim";
  const templateId = isAjf
    ? CONFIG.TEMPLATE_ID_AJF
    : CONFIG.TEMPLATE_ID_DEFAULT;
  console.log(
    `Selected template: ${isAjf ? "AJF" : "Default"} (${templateId})`,
  );

  const results = ProductCalculator.calculateAllProducts(rawInputs);

  const desiredProductsRaw = String(rawInputs[COLS.DESIRED_PRODUCTS] || "");
  const desiredProductsSet = new Set(
    desiredProductsRaw.split(",").map((p) => p.trim()),
  );
  const finalResults = results.filter((r) => desiredProductsSet.has(r.name));
  const missingProducts = results.filter(
    (r) =>
      desiredProductsSet.has(r.name) &&
      (r.value === null || r.value === undefined),
  );

  const pdfFile = SlideGenerator.generatePresentation(
    templateId,
    CONFIG.OUTPUT_FOLDER_ID,
    rawInputs[COLS.MUNICIPIO],
    rawInputs[COLS.UF],
    finalResults,
  );

  EmailService.sendEmailWithAttachment(
    email,
    emailCC,
    rawInputs[COLS.MUNICIPIO],
    rawInputs[COLS.UF],
    pdfFile,
  );

  if (missingProducts.length > 0) {
    sendMissingProductsAlert(
      rawInputs[COLS.MUNICIPIO],
      currentRow,
      missingProducts,
    );
  }

  const url = pdfFile.getUrl();
  statusCell
    .setValue("Concluído")
    .setRichTextValue(
      SpreadsheetApp.newRichTextValue()
        .setText("Concluído")
        .setLinkUrl(url)
        .build(),
    );
}

function sendAdminErrorEmail(
  municipio: string,
  row: number,
  errorMessage: string,
) {
  try {
    MailApp.sendEmail({
      to: CONFIG.ADMIN_EMAIL,
      subject: `[AUTOMAÇÃO] Erro crítico: ${municipio}`,
      htmlBody: `
        <h3>Erro ao processar apresentação</h3>
        <p><strong>Município:</strong> ${municipio}</p>
        <p><strong>Linha:</strong> ${row}</p>
        <p><strong>Erro:</strong> ${errorMessage}</p>
        <br>
        <i>Mensagem automática do sistema. 🤖</i>
      `,
    });
  } catch (e) {
    console.error("Failed to send admin error email.");
  }
}

function sendMissingProductsAlert(
  municipio: string,
  row: number,
  missingProducts: Array<{ name: string }>,
) {
  try {
    let listHtml = "<ul>";
    missingProducts.forEach((p) => (listHtml += `<li>${p.name}</li>`));
    listHtml += "</ul>";

    MailApp.sendEmail({
      to: CONFIG.ADMIN_EMAIL,
      subject: `[AUTOMAÇÃO] Alerta: Produtos não calculados para ${municipio}`,
      htmlBody: `
      <h3>Atenção</h3>
      <p>A apresentação para <strong>${municipio}</strong> (linha ${row}) foi gerada, mas os seguintes produtos solicitados não retornaram valor (ficaram zerados ou erro de cálculo):</p>
      ${listHtml}
      <br>
      <i>Verifique se os dados de entrada (receita, população etc.) estão preenchidos corretamente.</i>
      `,
    });
  } catch (e) {
    console.error("Failed to send missing products alert.");
  }
}
