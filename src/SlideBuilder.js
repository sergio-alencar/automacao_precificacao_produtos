// src/SlideBuilder.gs

const SlideBuilder = {
  /**
   * @param {GoogleAppsScript.Slides.Slide} slide
   * @param {string} municipio
   * @param {string} uf
   * @param {Array<Object>} results
   * @param {number} totalSum
   */
  createTableOnSlide(slide, municipio, uf, results, totalSum) {
    const numRows = results.length + 2;
    const numCols = 2;
    const left = 650;
    const top = 250;
    const width = 700;
    const height = numRows * 35;

    const table = slide.insertTable(numRows, numCols, left, top, width, height);
    for (let i = 0; i < numRows; i++) {
      const row = table.getRow(i);
      for (let j = 0; j < numCols; j++) {
        const cell = row.getCell(j);
        cell.getFill().setSolidFill(255, 255, 255);
      }
    }

    const titleText = `Estimativas de Potenciais de Recuperação - ${municipio}/${uf}`;
    const newTitleHeight = 40;
    const titleShape = slide.insertShape(
      SlidesApp.ShapeType.TEXT_BOX,
      left,
      top - newTitleHeight,
      width,
      newTitleHeight
    );

    titleShape.getFill().setSolidFill(255, 255, 255);
    titleShape.setContentAlignment(SlidesApp.ContentAlignment.MIDDLE);

    const title = titleShape.getText();
    title.setText(titleText);
    title
      .getTextStyle()
      .setFontSize(24)
      .setBold(true)
      .setForegroundColor(0, 0, 0);

    const headerRow = table.getRow(0);
    const headerCell0 = headerRow.getCell(0);
    const headerCell1 = headerRow.getCell(1);

    headerCell0.getText().setText("Produto");
    headerCell1.getText().setText("Estimativa");

    [headerCell0, headerCell1].forEach((cell) => {
      const style = cell.getText().getTextStyle();
      style.setFontSize(16).setBold(true).setForegroundColor(0, 0, 0);
      cell.getFill().setSolidFill(255, 255, 255);
      headerCell1
        .getText()
        .getParagraphStyle()
        .setParagraphAlignment(SlidesApp.ParagraphAlignment.END);
    });

    results.forEach((result, index) => {
      const row = table.getRow(index + 1);

      const cell0 = row.getCell(0);
      const cell1 = row.getCell(1);

      cell0.getText().setText(result.name);
      cell1.getText().setText(Utils.formatCurrency(result.value));

      [cell0, cell1].forEach((cell) => {
        cell
          .getText()
          .getTextStyle()
          .setFontSize(16)
          .setBold(false)
          .setForegroundColor(0, 0, 0);
        cell1
          .getText()
          .getParagraphStyle()
          .setParagraphAlignment(SlidesApp.ParagraphAlignment.END);
      });
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
        .setFontSize(16)
        .setBold(true)
        .setForegroundColor(0, 0, 0);
      totalCell1
        .getText()
        .getParagraphStyle()
        .setParagraphAlignment(SlidesApp.ParagraphAlignment.END);
    });
  },
};
