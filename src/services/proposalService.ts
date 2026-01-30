// src/services/ProposalService.ts

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

    console.log(
      "DEBUG INPUTS:",
      JSON.stringify({
        municipio: rawInputs[COLS.MUNICIPIO],
        contaLuz: rawInputs[COLS.CONTA_LUZ],
        servidores: rawInputs[COLS.NUM_SERVIDORES],
        folha: rawInputs[COLS.FOLHA_MENSAL],
        headersEncontrados: headers,
      }),
    );

    const municipio = rawInputs[COLS.MUNICIPIO];
    const uf = rawInputs[COLS.UF];

    console.log(`Starting proposal logic for "${municipio}/${uf}"...`);

    const isAjf =
      rawInputs[COLS.IS_AJF] === true ||
      String(rawInputs[COLS.IS_AJF]).toLowerCase() === "sim";
    const templateId = isAjf
      ? CONFIG.TEMPLATE_ID_AJF
      : CONFIG.TEMPLATE_ID_DEFAULT;

    const allResults = ProductCalculator.calculateAllProducts(rawInputs);

    const desiredProductsRaw = String(rawInputs[COLS.DESIRED_PRODUCTS] || "");
    const desiredProductsSet = new Set(
      desiredProductsRaw.split(",").map((p) => this.normalizeKey(p)),
    );

    const finalResults = allResults.filter((r) =>
      desiredProductsSet.has(this.normalizeKey(r.name)),
    );

    const missingProducts = finalResults.filter(
      (r) => r.value === null || r.value === undefined,
    );

    const pdfFile = SlideGenerator.generatePresentation(
      templateId,
      CONFIG.OUTPUT_FOLDER_ID,
      municipio,
      uf,
      finalResults,
    );

    EmailService.sendEmailWithAttachment(
      email,
      emailCC,
      municipio,
      uf,
      pdfFile,
    );

    if (missingProducts.length > 0) {
      NotificationService.sendMissingProductsAlert(
        municipio,
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

  private static normalizeKey(str: string): string {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }
}
