// apps_script\core\playground.ts

function debugCalculator() {
  const mockMunicipio = "Belo Horizonte";
  const mockUf = "MG";

  console.log(
    `--- DEBUG: Calculating ISSQN for ${mockMunicipio}/${mockUf} ---`,
  );

  try {
    const issqn = new IssqnCalculator();

    const mockInputs: CalculationInput = {
      municipio: mockMunicipio,
      uf: mockUf,
      populacao: 0,
      receitaAnual: 0,
      folhaMensal: 0,
      numServidores: 0,
      icmsAnual: 0,
      cfemReceita: 0,
      isAjf: false,
    };

    const result = issqn.calculate(mockInputs);

    if (result === null) {
      console.error(
        "Result returned NULL. Check if municipality exists on the ESTBAN processed sheet or if inputs are missing.",
      );
    } else {
      console.log(`Final result calculated: ${Utils.formatCurrency(result)}`);
    }
  } catch (error) {
    console.error(`Error on test: ${Utils.getErrorMessage(error)}`);
  }
}
