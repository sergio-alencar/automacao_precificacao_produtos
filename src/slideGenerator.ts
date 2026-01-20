// src/slideGenerator.ts

class SlideGenerator {
  static generatePresentation(
    templateId: string,
    folderId: string,
    municipio: string,
    uf: string,
    results: CalculationResult[],
  ): GoogleAppsScript.Drive.File {
    const outputFolder = DriveApp.getFolderById(folderId);
    const templateFile = DriveApp.getFileById(templateId);

    const dateStr = new Date().toLocaleDateString("pt-BR").replace(/\//g, "-");
    const newFileName = `MSL_Apresentacao_${municipio}_${uf}_${dateStr}`;
    const newFile = templateFile.makeCopy(newFileName, outputFolder);
    const newSlide = SlidesApp.openById(newFile.getId());
    const municipioUf = `${municipio}/${uf}`;
    let totalSum = 0;

    results.forEach((r) => {
      if (typeof r.value === "number") {
        totalSum += r.value;
      }
    });

    const totalSummaryText = `R$ ${Utils.formatTotalSummary(totalSum)}`;

    newSlide.replaceAllText("{{MUNICIPIO_UF}}", municipioUf);
    newSlide.replaceAllText("{{TOTAL_FINAL}}", totalSummaryText);

    const targetSlide = newSlide.getSlides()[1];
    SlideBuilder.createTableOnSlide(
      targetSlide,
      municipio,
      uf,
      results,
      totalSum,
    );
    newSlide.saveAndClose();

    const pdfBlob = newFile.getAs(MimeType.PDF);
    const pdfFile = outputFolder
      .createFile(pdfBlob)
      .setName(newFileName + ".pdf");
    newFile.setTrashed(true);

    return pdfFile;
  }
}
