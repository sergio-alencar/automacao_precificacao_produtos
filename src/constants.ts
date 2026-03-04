// src/constants.ts

const CONFIG = {
  TEMPLATE_ID_DEFAULT: ENV.CONFIG.TEMPLATE_ID_DEFAULT,
  TEMPLATE_ID_AJF: ENV.CONFIG.TEMPLATE_ID_AJF,
  OUTPUT_FOLDER_ID: ENV.CONFIG.OUTPUT_FOLDER_ID,
  SHEET_NAME: ENV.CONFIG.SHEET_NAME,
  ADMIN_EMAIL: ENV.CONFIG.ADMIN_EMAIL,
  FIXED_CC_EMAIL: ENV.CONFIG.FIXED_CC_EMAIL,
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
