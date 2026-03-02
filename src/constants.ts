// src/constants.ts

const CONFIG = {
  TEMPLATE_ID_DEFAULT: "1wWHtPJAXyRPZpG9kVka9qfzrsAogpHHT2_3e3zPpN0o",
  TEMPLATE_ID_AJF: "1D42iOhftG6mFEGrXSh8OsCFIMfNJMUPzJQMiyxzLsck",
  OUTPUT_FOLDER_ID: "1edKkvPT0XXP-SrRHXw_tRATdnUamXBCR",
  SHEET_NAME: "Respostas ao formulário 1",
  ADMIN_EMAIL: "gabriela.leao@msladvocacia.com.br",
  FIXED_CC_EMAIL: "ativacoes@msladvocacia.com.br",
} as const;

const COLS = {
  MUNICIPIO: "Nome do município",
  UF: "Estado",
  EMAIL: "Email(s) para envio (separe os emails com vírgula)",
  EMAIL_CC: "Email(s) em cópia (separe os emails com vírgula)",
  POPULACAO: "População",
  RECEITA_ANUAL: "Receita corrente anual do município (R$)",
  FOLHA_MENSAL: "Folha de pagamento mensal (R$)",
  NUM_SERVIDORES: "Número de servidores",
  ICMS_ANUAL: "ICMS anual",
  CFEM_RECEITA: "CFEM arrecadado nos últimos 5 anos (R$)",
  CONTA_LUZ: "Conta de luz do município (R$)",
  STATUS: "Status",
  DESIRED_PRODUCTS: "Produtos que quero incluir na proposta:",
  IS_AJF: "Modelo AJF?",
} as const;

type ColKey = keyof typeof COLS;
