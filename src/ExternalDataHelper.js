// src/ExternalDataHelper.js

const ESTBAN_FILE_ID = "1QZ9YtVX-DCIiPO5xdg8UwuBSWMhndEbVP4lgQ61dXR0";
const ESTBAN_SHEET_NAME = "ESTBAN";

/**
 * @returns {Array<Array<any>>}
 */
function getEstbanData() {
  const cache = CacheService.getScriptCache();
  const CACHE_KEY = "ESTBAN_DATA_V2_GHEET";

  const cachedData = cache.get(CACHE_KEY);
  if (cachedData) {
    Logger.log("Buscando dados ESTBAN do cache (descompactando)...");
    try {
      const blob = Utilities.newBlob(cachedData, MimeType.ZIP, "estban.zip");
      const unzippedBlob = Utilities.unzip(blob)[0];
      const jsonString = unzippedBlob.getDataAsString();
      return JSON.parse(jsonString);
    } catch (e) {
      Logger.log(
        `Falha ao descompactar/parsear dados do cache. Buscando ao vivo. Erro: ${e}`
      );
    }
  }

  Logger.log("Buscando dados ESTBAN do Google Sheet (leitura ao vivo)...");

  try {
    const ss = SpreadsheetApp.openById(ESTBAN_FILE_ID);
    const sheet = ss.getSheetByName(ESTBAN_SHEET_NAME);
    if (!sheet) {
      throw new Error(`Aba "${ESTBAN_SHEET_NAME}" não encontrada no arquivo.`);
    }

    const data = sheet
      .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
      .getValues();

    const jsonString = JSON.stringify(data);
    const dataBlob = Utilities.newBlob(
      jsonString,
      MimeType.PLAIN_TEXT,
      "estban.json"
    );
    const zippedBlob = Utilities.zip([dataBlob]);

    try {
      cache.put(CACHE_KEY, zippedBlob.getBytes(), 21600);
      Logger.log(
        `Dados ESTBAN salvos no cache (${
          zippedBlob.getBytes().length
        } bytes compactados).`
      );
    } catch (cacheError) {
      if (cacheError.message.includes("Argument too large")) {
        Logger.log(
          `Falha ao salvar no cache, dados muito grandes mesmo compactados (${
            zippedBlob.getBytes().length
          } bytes). O cache está desabilitado para esta execução.`
        );
      } else {
        throw cacheError;
      }
    }

    return data;
  } catch (e) {
    Logger.log(`Falha ao ler dados ESTBAN: ${e}`);
    throw e;
  }
}
