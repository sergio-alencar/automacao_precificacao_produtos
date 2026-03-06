// apps_script\services\slideGenerator.ts

class SlideGenerator {
  static generatePresentation(
    templateId: string,
    folderId: string,
    cityName: string,
    state: string,
    results: CalculationResult[],
  ): GoogleAppsScript.Drive.File {
    const outputFolder = DriveApp.getFolderById(folderId);
    const templateFile = DriveApp.getFileById(templateId);

    const fileName = SlideGenerator.generateFileName(cityName, state);
    const totalSum = SlideGenerator.calculateTotal(results);

    const presentationFile = templateFile.makeCopy(fileName, outputFolder);
    const presentation = SlidesApp.openById(presentationFile.getId());

    try {
      SlideGenerator.fillGlobalPlaceholders(
        presentation,
        cityName,
        state,
        totalSum,
      );

      const targetSlide =
        presentation.getSlides()[AppConstants.SLIDES.RESULTS_PAGE_INDEX];

      SlideBuilder.createTableOnSlide(
        targetSlide,
        cityName,
        state,
        results,
        totalSum,
      );

      presentation.saveAndClose();

      Utilities.sleep(2500);

      const pdfFile = SlideGenerator.convertToPdfAndDeleteOriginal(
        presentationFile,
        outputFolder,
        fileName,
      );

      return pdfFile;
    } catch (error) {
      presentationFile.setTrashed(true);

      const errorMsg = Utils.getErrorMessage(error);
      console.error(
        `Error generating presentation for ${cityName}/${state}:`,
        errorMsg,
      );
      throw new Error(`Falha no SlideGenerator: ${errorMsg}`);
    }
  }

  private static calculateTotal(results: CalculationResult[]): number {
    return results.reduce((acc, r) => acc + (r.value || 0), 0);
  }

  private static generateFileName(cityName: string, state: string): string {
    const dateStr = Utilities.formatDate(new Date(), "GMT-3", "dd-MM-yyyy");
    return `MSL_Apresentacao_${cityName}_${state}_${dateStr}`;
  }

  private static fillGlobalPlaceholders(
    presentation: GoogleAppsScript.Slides.Presentation,
    cityName: string,
    state: string,
    totalSum: number,
  ): void {
    const cityState = `${cityName}/${state}`;
    const totalFormatted = `R$ ${Utils.formatTotalSummary(totalSum)}`;

    presentation.replaceAllText("{{MUNICIPIO_UF}}", cityState);
    presentation.replaceAllText("{{TOTAL_FINAL}}", totalFormatted);
  }

  private static convertToPdfAndDeleteOriginal(
    slidesFile: GoogleAppsScript.Drive.File,
    folder: GoogleAppsScript.Drive.Folder,
    fileName: string,
  ): GoogleAppsScript.Drive.File {
    const pdfBlob = slidesFile.getAs(MimeType.PDF);
    const pdfFile = folder.createFile(pdfBlob).setName(`${fileName}.pdf`);

    slidesFile.setTrashed(true);

    return pdfFile;
  }
}
