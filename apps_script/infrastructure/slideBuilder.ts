// apps_script\infrastructure\slideBuilder.ts

class SlideBuilder {
  private static readonly LAYOUT = {
    TABLE_LEFT: 650,
    TABLE_TOP: 250,
    TABLE_WIDTH: 700,
    ROW_HEIGHT: 35,
    TITLE_HEIGHT: 40,
    FONT_SIZE_HEADER: 16,
    FONT_SIZE_BODY: 16,
    FONT_SIZE_TITLE: 24,
    COLOR_BLACK: "#000000",
    BG_WHITE: "#ffffff",
  } as const;

  static createTableOnSlide(
    slide: GoogleAppsScript.Slides.Slide,
    municipio: string,
    uf: string,
    results: CalculationResult[],
    totalSum: number,
  ): void {
    const validResults = this.getValidResults(results);

    if (validResults.length === 0) {
      console.warn(`No valid result to generate table for ${municipio}/${uf}.`);
      return;
    }

    const numRows = validResults.length + 2;
    const numCols = 2;
    const tableHeight = numRows * this.LAYOUT.ROW_HEIGHT;

    const table = slide.insertTable(
      numRows,
      numCols,
      this.LAYOUT.TABLE_LEFT,
      this.LAYOUT.TABLE_TOP,
      this.LAYOUT.TABLE_WIDTH,
      tableHeight,
    );

    this.applyBaseTableStyling(table, numRows, numCols);
    this.createSlideTitle(slide, municipio, uf);

    this.buildTableHeader(table);
    this.buildTableBody(table, validResults);
    this.buildTableFooter(table, numRows, totalSum);
  }

  private static getValidResults(
    results: CalculationResult[],
  ): CalculationResult[] {
    return results.filter((r) => r.value !== null && r.value !== undefined);
  }

  private static applyBaseTableStyling(
    table: GoogleAppsScript.Slides.Table,
    numRows: number,
    numCols: number,
  ): void {
    for (let i = 0; i < numRows; i++) {
      const row = table.getRow(i);
      for (let j = 0; j < numCols; j++) {
        row.getCell(j).getFill().setSolidFill(this.LAYOUT.BG_WHITE);
      }
    }
  }

  private static buildTableHeader(table: GoogleAppsScript.Slides.Table): void {
    const headerRow = table.getRow(0);
    this.styleCell(headerRow.getCell(0), "Produto", true, false);
    this.styleCell(headerRow.getCell(1), "Estimativa", true, true);
  }

  private static buildTableBody(
    table: GoogleAppsScript.Slides.Table,
    results: CalculationResult[],
  ): void {
    results.forEach((result, index) => {
      const row = table.getRow(index + 1);
      this.styleCell(row.getCell(0), result.name, false, false);

      const formattedValue = Utils.formatCurrency(result.value || 0);
      this.styleCell(row.getCell(1), formattedValue, false, true);
    });
  }

  private static buildTableFooter(
    table: GoogleAppsScript.Slides.Table,
    numRows: number,
    totalSum: number,
  ): void {
    const totalRow = table.getRow(numRows - 1);
    const formattedTotal = Utils.formatCurrency(totalSum);

    this.styleCell(totalRow.getCell(0), "TOTAL GERAL", true, false);
    this.styleCell(totalRow.getCell(1), formattedTotal, true, true);
  }

  private static createSlideTitle(
    slide: GoogleAppsScript.Slides.Slide,
    municipio: string,
    uf: string,
  ): void {
    const titleText = `Estimativas de Potenciais de Recuperação - ${municipio}/${uf}`;

    const titleShape = slide.insertShape(
      SlidesApp.ShapeType.TEXT_BOX,
      this.LAYOUT.TABLE_LEFT,
      this.LAYOUT.TABLE_TOP - this.LAYOUT.TITLE_HEIGHT,
      this.LAYOUT.TABLE_WIDTH,
      this.LAYOUT.TITLE_HEIGHT,
    );

    titleShape.getFill().setSolidFill(this.LAYOUT.BG_WHITE);
    titleShape.setContentAlignment(SlidesApp.ContentAlignment.MIDDLE);

    const textRange = titleShape.getText();
    textRange.setText(titleText);
    textRange
      .getTextStyle()
      .setFontSize(this.LAYOUT.FONT_SIZE_TITLE)
      .setBold(true)
      .setForegroundColor(this.LAYOUT.COLOR_BLACK);
  }

  private static styleCell(
    cell: GoogleAppsScript.Slides.TableCell,
    text: string,
    isBold: boolean,
    alignRight: boolean,
  ): void {
    const textRange = cell.getText();
    textRange.setText(text);

    textRange
      .getTextStyle()
      .setFontSize(
        isBold ? this.LAYOUT.FONT_SIZE_HEADER : this.LAYOUT.FONT_SIZE_BODY,
      )
      .setBold(isBold)
      .setForegroundColor(this.LAYOUT.COLOR_BLACK);

    cell.getFill().setSolidFill(this.LAYOUT.BG_WHITE);

    if (alignRight) {
      textRange
        .getParagraphStyle()
        .setParagraphAlignment(SlidesApp.ParagraphAlignment.END);
    }
  }
}
