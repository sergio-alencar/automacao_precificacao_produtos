// src/SlideGenerator.gs

const SlideGenerator = {
  /**
   * @param {string} templateId
   * @param {string} folderId
   * @param {string} municipio
   * @param {string} uf
   * @param {Array<Object>} results
   * @returns {GoogleAppsScript.Drive.File}
   */
  generatePresentation: function (
    templateId,
    folderId,
    municipio,
    uf,
    results
  ) {
    const outputFolder = DriveApp.getFolderById(folderId);
    const templateFile = DriveApp.getFileById(templateId);

    const newFileName = `MSL_Apresentacao_${municipio}_${uf}_${new Date()
      .toLocaleDateString("pt-BR")
      .replace(/\//g, "-")}`;
    const newFile = templateFile.makeCopy(newFileName, outputFolder);
    const newSlide = SlidesApp.openById(newFile.getId());

    const municipioUf = `${municipio}/${uf}`;
    let totalSum = 0;
    results.forEach((r) => {
      if (r.value !== null) totalSum += r.value;
    });

    const totalSummaryText = `R$ ${Utils.formatTotalSummary(totalSum)}`;

    newSlide.replaceAllText("{{MUNICIPIO_UF}}", municipioUf);
    newSlide.replaceAllText("{{TOTAL_FINAL}}", totalSummaryText);

    const slide2 = newSlide.getSlides()[1];
    this.createTableOnSlide(slide2, municipio, uf, results, totalSum);

    newSlide.saveAndClose();

    const pdfBlob = newFile.getAs(MimeType.PDF);
    const pdfFile = outputFolder
      .createFile(pdfBlob)
      .setName(newFileName + ".pdf");

    newFile.setTrashed(true);

    return pdfFile;
  },

  createTableOnSlide: function (slide, municipio, uf, results, totalSum) {
    const validResults = results.filter((r) => r.value !== null);

    const numRows = validResults.length + 2;
    const numCols = 2;

    const left = 650;
    const top = 250;
    const width = 700;
    const height = numRows * 40;

    const table = slide.insertTable(numRows, numCols, left, top, width, height);

    for (let i = 0; i < numRows; i++) {
      const row = table.getRow(i);

      for (let j = 0; j < numCols; j++) {
        const cell = row.getCell(j);

        cell.getFill().setSolidFill(255, 255, 255);
      }
    }

    const titleText = `Estimativa de Potenciais de Recuperação - ${municipio}/${uf}`;
    const titleShape = slide.insertShape(
      SlidesApp.ShapeType.TEXT_BOX,
      left,
      top - 30,
      width,
      30
    );

    titleShape.getFill().setSolidFill(255, 255, 255);

    const title = titleShape.getText();
    title.setText(titleText);
    title
      .getTextStyle()
      .setFontSize(20)
      .setBold(true)
      .setForegroundColor(0, 0, 0);

    const headerRow = table.getRow(0);
    const headerCell0 = headerRow.getCell(0);
    const headerCell1 = headerRow.getCell(1);

    headerCell0.getText().setText("Produto");
    headerCell1.getText().setText("Estimativa");

    [headerCell0, headerCell1].forEach((cell) => {
      const style = cell.getText().getTextStyle();
      style.setFontSize(14).setBold(true).setForegroundColor(0, 0, 0);
      cell.getFill().setSolidFill(255, 255, 255);
    });

    validResults.forEach((result, index) => {
      const row = table.getRow(index + 1);
      const cell0 = row.getCell(0);
      const cell1 = row.getCell(1);

      cell0.getText().setText(result.name);

      cell1.getText().setText(Utils.formatCurrency(result.value));

      [cell0, cell1].forEach((cell) => {
        cell
          .getText()
          .getTextStyle()
          .setFontSize(14)
          .setBold(false)
          .setForegroundColor(0, 0, 0);
      });
      cell0.getText().getTextStyle().setBold(true);
    });

    const totalRow = table.getRow(numRows - 1);
    const totalCell0 = totalRow.getCell(0);
    const totalCell1 = totalRow.getCell(1);

    totalCell0.getText().setText("TOTAL GERAL");
    totalCell1.getText().setText(Utils.formatCurrency(totalSum));

    [totalCell0, totalCell1].forEach((cell) => {
      cell
        .getText()
        .getTextStyle()
        .setFontSize(14)
        .setBold(true)
        .setForegroundColor(0, 0, 0);
    });
  },
};
