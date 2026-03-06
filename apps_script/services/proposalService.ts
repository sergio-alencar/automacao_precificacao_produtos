// apps_script\services\proposalService.ts

class ProposalService {
  static processRow(
    sheet: GoogleAppsScript.Spreadsheet.Sheet,
    currentRow: number,
    headers: string[],
    colIndices: {
      status: number;
      email: number;
      emailCC: number;
      lastCol: number;
    },
  ): void {
    const { COLUMNS, CONFIG } = AppConstants;

    const statusCell = sheet.getRange(currentRow, colIndices.status + 1);

    const rowData = sheet
      .getRange(currentRow, 1, 1, colIndices.lastCol)
      .getValues()[0];

    const email = rowData[colIndices.email];
    const emailCC = rowData[colIndices.emailCC];

    if (!email) {
      throw new Error("Email para envio não preenchido.");
    }

    statusCell.setValue("Processando...");
    SpreadsheetApp.flush();

    const rawInputs = SheetHelper.mapRowToInputs(rowData, headers);

    const cityName = String(rawInputs[COLUMNS.CITY] || "");
    const state = String(rawInputs[COLUMNS.STATE] || "");

    console.log(`Starting proposal logic for "${cityName}/${state}"...`);

    const isAjf = Boolean(rawInputs[COLUMNS.IS_AJF]);
    const templateId = isAjf
      ? CONFIG.TEMPLATE_ID_AJF
      : CONFIG.TEMPLATE_ID_DEFAULT;

    const allResults = CalculatorFactory.calculateAllProducts(rawInputs);

    const desiredProductsRaw = String(
      rawInputs[COLUMNS.DESIRED_PRODUCTS] || "",
    );

    const desiredProductsSet = new Set(
      desiredProductsRaw.split(",").map((p) => Utils.normalizeText(p)),
    );

    const finalResults = allResults.filter((r) =>
      desiredProductsSet.has(Utils.normalizeText(r.name)),
    );

    const missingProducts = finalResults.filter(
      (r) => r.value === null || r.value === undefined || isNaN(r.value),
    );

    const pdfFile = SlideGenerator.generatePresentation(
      templateId,
      CONFIG.OUTPUT_FOLDER_ID,
      cityName,
      state,
      finalResults,
    );

    EmailService.sendEmailWithAttachment(
      String(email),
      emailCC ? String(emailCC) : null,
      cityName,
      state,
      pdfFile,
    );

    if (missingProducts.length > 0) {
      NotificationService.sendMissingProductsAlert(
        cityName,
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
}
