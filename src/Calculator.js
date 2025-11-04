// src/Calculator.gs

const ProductCalculator = {
  GLOBAL_FLOOR: 500000,

  applyGlobalFloor: function (value) {
    if (value === null || value === undefined) {
      return null;
    }
    return Math.max(value, this.GLOBAL_FLOOR);
  },

  cfurh: function (inputs) {
    const defaultTar = 79.62;
    const defaultTotalArea = 250;
    const margin = 1.2;
    const tar = inputs.tar || defaultTar;
    const totalArea = inputs.total_reservoir_area_km2 || defaultTotalArea;

    if (!inputs.energy_generated_mwh || !inputs.municipal_flooded_area_km2) {
      Logger.log(
        "CFURH: Skipping. Missing inputs ('Energia gerada (MWh)' or 'Área inundada no município (km²)')."
      );
      return null;
    }
    const calculation =
      inputs.energy_generated_mwh *
      tar *
      (inputs.municipal_flooded_area_km2 / totalArea) *
      margin;
    return this.applyGlobalFloor(calculation);
  },

  cfem: function (inputs) {
    if (inputs.uf !== "MG" && inputs.uf !== "PA") {
      Logger.log(`CFEM: Skipping. State "${inputs.uf}" is not MG or PA.`);
      return null;
    }
    if (
      inputs.cfem_last_year_revenue === undefined ||
      inputs.cfem_last_year_revenue === null
    ) {
      Logger.log(
        "CFEM: Skipping. Missing input ('CFEM arrecadado nos últimos 5 anos (R$)')."
      );
      return null;
    }
    const floor = 2500000;
    const calculation = inputs.cfem_last_year_revenue * 5 * 0.15;
    return Math.max(calculation, floor);
  },

  irrf: function (inputs) {
    if (!inputs.annual_current_revenue) {
      Logger.log(
        "IRRF: Skipping. Missing input ('Receita corrente anual do município (R$)')."
      );
      return null;
    }
    const rcl = inputs.annual_current_revenue;
    const p1 = rcl * 0.25 * 0.1 * 0.0024;
    const p2 = rcl * 0.25 * 0.2 * 0.01;
    const p3 = rcl * 0.25 * 0.3 * 0.02;
    const p4 = rcl * 0.25 * 0.4 * 0.035;
    const calculation = (p1 + p2 + p3 + p4) * 5 * 1.15;
    return this.applyGlobalFloor(calculation);
  },

  verbas: function (inputs) {
    if (!inputs.num_servidores || !inputs.folha_mensal) {
      Logger.log(
        "Verbas: Skipping. Missing inputs ('Número de servidores' ou 'Folha de pagamento mensal (R$)')."
      );
      return null;
    }
    const folhaAcrescida = inputs.folha_mensal * 1.2;
    let percentual;
    if (inputs.num_servidores <= 300) percentual = 1.0;
    else if (inputs.num_servidores <= 600) percentual = 0.9;
    else if (inputs.num_servidores <= 1000) percentual = 0.8;
    else if (inputs.num_servidores <= 2000) percentual = 0.7;
    else percentual = 0.6;

    // não tem piso de R$ 500k no doc
    return folhaAcrescida * percentual;
  },

  rat_fap: function (inputs) {
    if (!inputs.folha_mensal) {
      Logger.log(
        "RAT/FAP: Skipping. Missing input ('Folha de pagamento mensal (R$)')."
      );
      return null;
    }
    const calculation = inputs.folha_mensal * 60 * 0.01 * 1.15;
    return this.applyGlobalFloor(calculation);
  },

  fundeb_vaar: function (inputs) {
    if (!inputs.num_alunos) {
      Logger.log("VAAR: Skipping. Missing input ('Número de alunos').");
      return null;
    }
    const calculation = inputs.num_alunos * 32.5 * 1 * 1.15;
    return this.applyGlobalFloor(calculation);
  },

  fundeb_vaat: function (inputs) {
    if (!inputs.num_alunos) {
      Logger.log("VAAT: Skipping. Missing input ('Número de alunos').");
      return null;
    }
    const calculation = inputs.num_alunos * 97.5 * 2 * 1.15;
    return this.applyGlobalFloor(calculation);
  },

  fpm: function (inputs) {
    if (!inputs.annual_current_revenue) {
      Logger.log(
        "FPM: Skipping. Missing input ('Receita corrente anual do município (R$)')."
      );
      return null;
    }
    const calculation = inputs.annual_current_revenue * 0.03 * 5 * 1.15;
    return this.applyGlobalFloor(calculation);
  },

  vaf: function (inputs) {
    if (!inputs.icms_anual) {
      Logger.log("VAF: Skipping. Missing input ('ICMS anual').");
      return null;
    }
    const calculation = inputs.icms_anual * 0.04 * 5 * 1.15;
    return this.applyGlobalFloor(calculation);
  },

  tunep: function (inputs) {
    if (!inputs.populacao) {
      Logger.log("TUNEP: Skipping. Missing input ('População').");
      return null;
    }
    const calculation = inputs.populacao * 180 * 5 * 1.15;
    return this.applyGlobalFloor(calculation);
  },

  comprev: function (inputs) {
    if (!inputs.possui_rpps || inputs.possui_rpps !== true) {
      Logger.log("COMPREV: Skipping. Municipality does not have RPPS.");
      return null;
    }
    if (!inputs.populacao) {
      Logger.log("COMPREV: Skipping. Missing input ('População').");
      return null;
    }
    const calculation = inputs.populacao * 0.055 * 2500 * 1.2;
    return this.applyGlobalFloor(calculation);
  },

  /**
   * @param {Object} inputs
   * @returns {Array<Object>}
   */
  calculateAllProducts: function (inputs) {
    const productMap = [
      {
        name: "CFURH",
        fn: this.cfurh.bind(this),
      },
      {
        name: "CFEM",
        fn: this.cfem.bind(this),
      },
      {
        name: "IRRF",
        fn: this.irrf.bind(this),
      },
      {
        name: "Verbas Indenizatórias",
        fn: this.verbas.bind(this),
      },
      {
        name: "RAT/FAP",
        fn: this.rat_fap.bind(this),
      },
      {
        name: "FUNDEB VAAR",
        fn: this.fundeb_vaar.bind(this),
      },
      {
        name: "FUNDEB VAAT",
        fn: this.fundeb_vaat.bind(this),
      },
      {
        name: "FPM",
        fn: this.fpm.bind(this),
      },
      {
        name: "VAF",
        fn: this.vaf.bind(this),
      },
      {
        name: "TUNEP",
        fn: this.tunep.bind(this),
      },
      {
        name: "COMPREV",
        fn: this.comprev.bind(this),
      },
    ];

    const results = [];
    for (const product of productMap) {
      results.push({ name: product.name, value: product.fn(inputs) });
    }
    return results;
  },
};
