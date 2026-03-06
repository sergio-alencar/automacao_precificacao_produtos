// apps_script\shared\types.ts

interface CalculationInput {
  uf: string;
  municipio: string;
  receitaAnual?: number;
  folhaMensal?: number;
  populacao?: number;
  numServidores?: number;
  icmsAnual?: number;
  cfemReceita?: number;
  contaLuz?: number;
  isAjf?: boolean;
}

interface CalculationResult {
  name: string;
  value: number | null;
}
