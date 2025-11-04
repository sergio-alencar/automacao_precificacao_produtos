// src/SlideBuilder.gs

const SlideBuilder = {
  /**
   *
   * @param {GoogleAppsScript.Slides.Slide} slide
   * @param {string} municipio
   * @param {string} uf
   * @param {Array<Object>} results
   * @param {number} totalSum
   */
  createTableOnSlide: function (slide, municipio, uf, results, totalSum) {
    const validResults = results.filter((r) => r.value !== null);

    const numRows = validResults.length + 2;
    const numCols = 2;

    const left = 70,
      top = 150,
      width = 800;
    const height = numRows * 25;

    const table = slide.insertTable(numRows, numCols, left, top, width, height);

    table.getRows().forEach((row) => {
      row.getCells().forEach((cell) => {
        cell.getBorderTop().setTransparent();
        cell.getBorderBottom().setTransparent();
        cell.getBorderLeft().setTransparent();
        cell.getBorderRight().setTransparent();
        cell.getFill().setSolidFill(255, 255, 255);
      });
    });

    const titleText = `Estimativas de Potenciais de Recuperação - ${municipio}/${uf}`;

    const newTitleHeight = 40;
    const titleShape = slide.insertShape(
      SlidesApp.ShapeType.TEXT_BOX,
      left,
      top - newTitleHeight,
      width,
      newTitleHeight
    );
    const title = titleShape.getText();
    title.setText(titleText);
    title
      .getTextStyle()
      .setFontSize(14)
      .setBold(true)
      .setForegroundColor(0, 0, 0);

    const headerRow = table.getRow(0);
    const [headerCell0, headerCell1] = headerRow.getCells();

    headerCell0.getText().setText("Produto");
    headerCell1.getText().setText("Estimativa");

    [headerCell0, headerCell1].forEach((cell) => {
      const style = cell.getText().getTextStyle();
      style.fontSize(12).setBold(true).setForegroundColor(100, 100, 100);
      cell.getFill().setSolidFill(240, 240, 240);
    });
    headerCell1
      .getText()
      .getParagraphStyle()
      .setParagraphAlignment(SlidesApp.ParagraphAlignment.END);

    validResults.forEach((result, index) => {
      const row = table.getRow(index + 1);
      const [cell0, cell1] = row.getCells();

      cell0.getText().setText(result.name);

      cell1.getText().setText(formatCurrency(result.value));

      [cell0, cell1].forEach((cell) => {
        cell
          .getText()
          .getTextStyle()
          .setFontSize(10)
          .setBold(false)
          .setForegroundColor(0, 0, 0);
      });
      cell1
        .getText()
        .getParagraphStyle()
        .setParagraphAlignment(SlidesApp.ParagraphAlignment.END);
    });

    const totalRow = table.getRow(numRows - 1);
    const [totalCell0, totalCell1] = totalRow.getCells();

    totalCell0.getText().setText("TOTAL GERAL");
    totalCell1.getText().setText(formatCurrency(totalSum));

    [totalCell0, totalCell1].forEach((cell) => {
      cell
        .getText()
        .getTextStyle()
        .setFontSize(12)
        .setBold(true)
        .setForegroundColor(0, 0, 0);
    });
    totalCell1
      .getText()
      .getParagraphStyle()
      .setParagraphAlignment(SlidesApp.ParagraphAlignment.END);
  },
};
