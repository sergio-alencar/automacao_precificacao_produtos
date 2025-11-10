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
  generatePresentation(templateId, folderId, municipio, uf, results) {
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
      if (r.value !== null) {
        totalSum += r.value;
      }
    });

    const totalSummaryText = `R$ ${Utils.formatTotalSummary(totalSum)}`;

    newSlide.replaceAllText("{{MUNICIPIO_UF}}", municipioUf);
    newSlide.replaceAllText("{{TOTAL_FINAL}}", totalSummaryText);

    const slide2 = newSlide.getSlides()[1];
    SlideBuilder.createTableOnSlide(slide2, municipio, uf, results, totalSum);
    newSlide.saveAndClose();

    const pdfBlob = newFile.getAs(MimeType.PDF);
    const pdfFile = outputFolder
      .createFile(pdfBlob)
      .setName(newFileName + ".pdf");
    newFile.setTrashed(true);

    return pdfFile;
  },
};
