// apps_script\core\constants.ts

class AppConstants {
  static get CONFIG() {
    return getEnv().CONFIG;
  }

  static readonly SLIDES = {
    RESULTS_PAGE_INDEX: 1,
  } as const;

  static readonly COLUMNS = {
    CITY: "Nome do município",
    STATE: "Estado",
    EMAIL: "Email(s) para envio (separe os emails com vírgula)",
    CC_EMAIL: "Email(s) em cópia (separe os emails com vírgula)",
    POPULATION: "População",
    ANNUAL_REVENUE: "Receita corrente anual do município (R$)",
    MONTHLY_PAYROLL: "Folha de pagamento mensal (R$)",
    NUM_EMPLOYEES: "Número de servidores",
    ANNUAL_ICMS: "ICMS anual",
    CFEM_REVENUE: "CFEM arrecadado nos últimos 5 anos (R$)",
    STATUS: "Status",
    DESIRED_PRODUCTS: "Produtos que quero incluir na proposta:",
    IS_AJF: "Modelo AJF?",
  } as const;
}

type ColKey = keyof typeof AppConstants.COLUMNS;
