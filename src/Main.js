// src/Main.gs

/**
 * @OnlyCurrentDoc
 */

const TEMPLATE_ID = "1wWHtPJAXyRPZpG9kVka9qfzrsAogpHHT2_3e3zPpN0o";
const OUTPUT_FOLDER_ID = "1edKkvPT0XXP-SrRHXw_tRATdnUamXBCR";
const SHEET_NAME = "Respostas ao formulário 1";
const STATUS_COLUMN_NAME = COLS.STATUS;
const EMAIL_COLUMN_NAME = COLS.EMAIL;
const EMAIL_CC_COLUMN_NAME = COLS.EMAIL_CC;
const ADMIN_NOTIFICATION_EMAIL = "gabriela.leao@msladvocacia.com.br";

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Automação MSL")
    .addItem("1. Gerar Apresentações Selecionadas", "processActiveRows")
    .addToUi();
}

/**
 * processa as linhas que estão selecionadas manualmente pelo usuário na planilha
 */
function processActiveRows() {
  const ui = SpreadsheetApp.getUi();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

  if (!sheet) {
    ui.alert(`Erro: A aba "${SHEET_NAME}" não foi encontrada.`);
    return;
  }

  const rowsToProcess = SheetHelper.getRowsToProcess(sheet);

  if (rowsToProcess.length === 0) {
    ui.alert("Por favor, selecione uma ou mais células em linhas de dados (abaixo do cabeçalho).");
    return;
  }

  const headers = SheetHelper.getHeaders(sheet);
  const lastCol = sheet.getLastColumn();
  const statusColIdx = SheetHelper.getColumnIndex(headers, STATUS_COLUMN_NAME);
  const emailColIdx = SheetHelper.getColumnIndex(headers, EMAIL_COLUMN_NAME);
  const emailCCColIdx = SheetHelper.getColumnIndex(headers, EMAIL_CC_COLUMN_NAME);

  let successCount = 0;
  let errorCount = 0;

  for (const currentRow of rowsToProcess) {
    try {
      processSingleRow(currentRow, sheet, headers, lastCol, statusColIdx, emailColIdx, emailCCColIdx);
      successCount++;
    } catch (e) {
      Logger.log(`Error processing row ${currentRow}: ${e}`);
      const statusCell = sheet.getRange(currentRow, statusColIdx + 1);
      statusCell.setValue(`Erro: ${e.message}`);
      errorCount++;
    }
  }

  ui.alert(`Processamento concluído.\nSucessos: ${successCount}\nErros: ${errorCount}`);
}

/**
 * processa a linha que acabou de ser enviada via Google Forms
 * @param {Object} e
 */
function handleFormSubmit(e) {
  const currentRow = e.range.getRow();

  if (currentRow === 1) {
    Logger.log("Trigger activated for row 1 (header). Ignoring.");
    return;
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const headers = SheetHelper.getHeaders(sheet);
  const lastCol = sheet.getLastColumn();
  const statusColIdx = SheetHelper.getColumnIndex(headers, STATUS_COLUMN_NAME);
  const emailColIdx = SheetHelper.getColumnIndex(headers, EMAIL_COLUMN_NAME);
  const emailCCColIdx = SheetHelper.getColumnIndex(headers, EMAIL_CC_COLUMN_NAME);
  const statusCell = sheet.getRange(currentRow, statusColIdx + 1);

  try {
    processSingleRow(currentRow, sheet, headers, lastCol, statusColIdx, emailColIdx, emailCCColIdx);
  } catch (err) {
    Logger.log(`Error processing row ${currentRow}: ${err.stack}`);
    statusCell.setValue(`Erro: ${err.message}`);

    try {
      const rowData = sheet.getRange(currentRow, 1, 1, lastCol).getValues()[0];
      const municipio = rowData[headers.indexOf(COLS.MUNICIPIO)] || "Município Desconhecido";
      const subject = `[AUTOMAÇÃO ]Erro ao gerar apresentação para ${municipio}`;
      const body = `
            Olá,
            <br>
            Ocorreu um erro fatal ao tentar gerar automaticamente a apresentação para a <strong>Prefeitura Municipal de ${municipio}</strong> (Linha ${currentRow}).
            <br><br>
            <strong>Detalhe do erro:</strong> ${err.message}
            <br><br>
            <i>Esta é uma mensagem automática.</i>
        `;
      MailApp.sendEmail({
        to: ADMIN_NOTIFICATION_EMAIL,
        subject: subject,
        htmlBody: body,
      });
      Logger.log(`Error notification email sent to ${ADMIN_NOTIFICATION_EMAIL}.`);
    } catch (emailError) {
      Logger.log(`CRITICAL: Failed to send error notification email. ${emailError.stack}`);
    }
  }
}

function processSingleRow(currentRow, sheet, headers, lastCol, statusColIdx, emailColIdx, emailCCColIdx) {
  const statusCell = sheet.getRange(currentRow, statusColIdx + 1);
  const rowData = sheet.getRange(currentRow, 1, 1, lastCol).getValues()[0];
  const email = rowData[emailColIdx];
  const emailCC = rowData[emailCCColIdx];

  if (!email) {
    statusCell.setValue("Erro: Email para envio não preenchido.");
    throw new Error("Email para envio não preenchido.");
  }

  statusCell.setValue("Processando...");
  SpreadsheetApp.flush();

  const inputs = SheetHelper.mapRowToInputs(rowData, headers);
  Logger.log(`Processing "${inputs[COLS.MUNICIPIO]}/${inputs[COLS.UF]}"...`);

  const results = ProductCalculator.calculateAllProducts(inputs);
  Logger.log(`Calculated results: ${JSON.stringify(results)}`);

  const desiredProductsRaw = inputs[COLS.DESIRED_PRODUCTS] || "";
  const desiredProductsSet = new Set(
    desiredProductsRaw.split(",").map((p) => {
      const trimmed = p.trim();

      if (trimmed === "FUNDEB/VAAR") {
        return "FUNDEB VAAR";
      }

      if (trimmed === "FUNDEB/VAAT") {
        return "FUNDEB VAAT";
      }

      return trimmed;
    })
  );

  const finalResults = results.filter((r) => desiredProductsSet.has(r.name));

  const missingProducts = results.filter(
    (r) => (desiredProductsSet.has(r.name) && r.value === null) || r.value === undefined
  );

  const pdfFile = SlideGenerator.generatePresentation(
    TEMPLATE_ID,
    OUTPUT_FOLDER_ID,
    inputs[COLS.MUNICIPIO],
    inputs[COLS.UF],
    finalResults
  );
  Logger.log(`Presentation created: ${pdfFile.getName()}`);

  EmailService.sendEmailWithAttachment(email, emailCC, inputs[COLS.MUNICIPIO], inputs[COLS.UF], pdfFile);

  Logger.log(`Email sent to ${email}` + (emailCC ? ` with copy to ${emailCC}.` : "."));

  if (missingProducts.length > 0) {
    try {
      const subject = `[AUTOMAÇÃO] Alerta de produtos faltantes para ${inputs[COLS.MUNICIPIO]}`;
      let body = `
        Olá,
        <br><br>
        A apresentação para <strong>${
          inputs[COLS.MUNICIPIO]
        }</strong> (Linha ${currentRow}) foi gerada com sucesso, mas os seguintes produtos selecionados não puderam ser calculados:
        <br>
        <ul>
      `;

      missingProducts.forEach((product) => {
        body += `<li>${product.name}</li>`;
      });

      body += "</ul><br><i>Esta é uma mensagem automática.</i>";

      MailApp.sendEmail({
        to: ADMIN_NOTIFICATION_EMAIL,
        subject: subject,
        htmlBody: body,
      });
      Logger.log(`Missing products alert sent to ${ADMIN_NOTIFICATION_EMAIL}.`);
    } catch (alertError) {
      Logger.log(`Failed to send missing product alert email. ${alertError.stack}`);
    }
  }

  const url = pdfFile.getUrl();
  statusCell
    .setValue("Concluído")
    .setRichTextValue(SpreadsheetApp.newRichTextValue().setText("Concluído").setLinkUrl(url).build());
}
