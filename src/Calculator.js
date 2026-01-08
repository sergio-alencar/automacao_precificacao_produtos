// src/Calculator.gs

const ProductCalculator = {
  GLOBAL_FLOOR: 500000,

  applyGlobalFloor(value) {
    if (value === null || value === undefined) {
      return null;
    }

    return Math.max(value, this.GLOBAL_FLOOR);
  },

  /**
   * @param {string} str
   * @returns {string}
   */
  _normalizeString(str) {
    if (!str) return "";
    return str
      .toString()
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");
  },

  /**
   * @param {string | number} value
   * @returns {number}
   */
  _normalizeValue(value) {
    if (value === null || value === undefined || value === "") {
      return NaN;
    }

    let cleanString = String(value);
    cleanString = cleanString.replace("R$", "").replace(/,/g, "");

    return parseFloat(cleanString);
  },

  cfem(inputs) {
    if (inputs[COLS.UF] !== "MG" && inputs[COLS.UF] !== "PA") {
      Logger.log(`CFEM: Skipping. State "${inputs[COLS.UF]}" is not MG or PA.`);
      return null;
    }

    const floor = 2500000;

    if (
      inputs[COLS.CFEM_RECEITA] === undefined ||
      inputs[COLS.CFEM_RECEITA] === null ||
      inputs[COLS.CFEM_RECEITA] === ""
    ) {
      Logger.log(
        `CFEM: Input missing ("${COLS.CFEM_RECEITA}"). Applying default floor value.`
      );
      return floor;
    }

    const calculation = inputs[COLS.CFEM_RECEITA] * 5 * 0.15;
    return Math.max(calculation, floor);
  },

  fpm(inputs) {
    if (!inputs[COLS.RECEITA_ANUAL]) {
      Logger.log(`FPM: Skipping. Missing input ("${COLS.RECEITA_ANUAL}").`);
      return null;
    }

    const calculation = inputs[COLS.RECEITA_ANUAL] * 0.03 * 5 * 1.15;
    return this.applyGlobalFloor(calculation);
  },

  irrf(inputs) {
    if (!inputs[COLS.RECEITA_ANUAL]) {
      Logger.log(`IRRF: Skipping. Missing input ("${COLS.RECEITA_ANUAL}").`);
      return null;
    }

    const rcl = inputs[COLS.RECEITA_ANUAL];
    const p1 = rcl * 0.25 * 0.1 * 0.0024;
    const p2 = rcl * 0.25 * 0.2 * 0.01;
    const p3 = rcl * 0.25 * 0.3 * 0.02;
    const p4 = rcl * 0.25 * 0.4 * 0.035;
    const calculation = (p1 + p2 + p3 + p4) * 5 * 1.15;

    return this.applyGlobalFloor(calculation);
  },

  issqn(inputs) {
    let estbanData;

    try {
      estbanData = getEstbanData();
    } catch (e) {
      Logger.log(`ISSQN: Failed to fetch ESTBAN data. Error: ${e.message}`);
      return null;
    }

    const headers = estbanData[0];
    const ufIndex = headers.indexOf("UF");
    const munIndex = headers.indexOf("MUNICIPIO");
    const verbeteIndex = headers.indexOf("VERBETE_711_CREDORAS");

    if (ufIndex === -1 || munIndex === -1 || verbeteIndex === -1) {
      Logger.log(
        "ISSQN: Skipping. Columns (UF, MUNICIPIO, VERBETE_711_CREDORAS) not found."
      );
      return null;
    }

    const inputUFNorm = this._normalizeString(inputs[COLS.UF]);
    const inputMunNorm = this._normalizeString(inputs[COLS.MUNICIPIO]);

    if (!inputUFNorm || !inputMunNorm) {
      Logger.log(
        "ISSQN: Skipping. Municipality or UF not found in form input."
      );
      return null;
    }

    let sum = 0;

    for (let i = 1; i < estbanData.length; i++) {
      const row = estbanData[i];
      const rowUfNorm = this._normalizeString(row[ufIndex]);
      const rowMunNorm = this._normalizeString(row[munIndex]);

      if (rowMunNorm.startsWith(inputMunNorm) && rowUfNorm === inputUFNorm) {
        const verbeteValue = this._normalizeValue(row[verbeteIndex]);

        if (!isNaN(verbeteValue)) {
          sum += verbeteValue;
        }
      }
    }

    if (sum === 0) {
      Logger.log(
        `ISSQN: No value found for ${inputMunNorm}/${inputUFNorm} on ESTBAN sheet. Applying default floor value.`
      );
      return this.applyGlobalFloor(0);
    }

    const calculation = ((sum * 0.2 * 12 * 0.25 * 0.05) / 12) * 60;
    return this.applyGlobalFloor(calculation);
  },

  rat_fap(inputs) {
    if (!inputs[COLS.FOLHA_MENSAL]) {
      Logger.log(`RAT/FAP: Skipping. Missing input ("${COLS.FOLHA_MENSAL}").`);
      return null;
    }

    const calculation = inputs[COLS.FOLHA_MENSAL] * 60 * 0.01 * 1.15;
    return this.applyGlobalFloor(calculation);
  },

  tunep(inputs) {
    if (!inputs[COLS.POPULACAO]) {
      Logger.log(`TUNEP: Skipping. Missing input ("${COLS.POPULACAO}").`);
      return null;
    }

    const calculation = inputs[COLS.POPULACAO] * 180 * 5 * 1.15;
    return this.applyGlobalFloor(calculation);
  },

  vaf(inputs) {
    if (!inputs[COLS.ICMS_ANUAL]) {
      Logger.log(`VAF: Skipping. Missing input ("${COLS.ICMS_ANUAL}").`);
      return null;
    }

    const calculation = inputs[COLS.ICMS_ANUAL] * 0.04 * 5 * 1.15;
    return this.applyGlobalFloor(calculation);
  },

  verbas(inputs) {
    if (!inputs[COLS.NUM_SERVIDORES] || !inputs[COLS.FOLHA_MENSAL]) {
      Logger.log(
        `Verbas: Skipping. Missing inputs ("${COLS.NUM_SERVIDORES}" or "${COLS.FOLHA_MENSAL}").`
      );
      return null;
    }

    const folhaAcrescida = inputs[COLS.FOLHA_MENSAL] * 1.2;
    let percentual;

    if (inputs[COLS.NUM_SERVIDORES] <= 300) {
      percentual = 1.0;
    } else if (inputs[COLS.NUM_SERVIDORES] <= 600) {
      percentual = 0.9;
    } else if (inputs[COLS.NUM_SERVIDORES] <= 1000) {
      percentual = 0.8;
    } else if (inputs[COLS.NUM_SERVIDORES] <= 2000) {
      percentual = 0.7;
    } else {
      percentual = 0.6;
    }

    return this.applyGlobalFloor(folhaAcrescida * percentual);
  },

  /**
   * @param {Object} inputs
   * @returns {Array<Object>}
   */
  calculateAllProducts(inputs) {
    const productMap = [
      { name: "CFEM", fn: this.cfem.bind(this) },
      { name: "FPM", fn: this.fpm.bind(this) },
      { name: "IRRF", fn: this.irrf.bind(this) },
      { name: "ISSQN", fn: this.issqn.bind(this) },
      { name: "RAT/FAP", fn: this.rat_fap.bind(this) },
      { name: "TUNEP", fn: this.tunep.bind(this) },
      { name: "VAF", fn: this.vaf.bind(this) },
      { name: "Verbas Indenizatórias", fn: this.verbas.bind(this) },
    ];

    const results = [];

    for (const product of productMap) {
      results.push({ name: product.name, value: product.fn(inputs) });
    }

    return results;
  },
};
