// src\test.ts

function runAllTests() {
  console.log("=== STARTING TESTS SUITE ===");
  testIssqnCalculatorSuccess();
  testIssqnCalculatorNotFound();
  console.log("=== TESTS FINISHED ===");
}

function testIssqnCalculatorSuccess() {
  const originalGetEstbanData = ExternalDataHelper.getEstbanData;

  try {
    ExternalDataHelper.getEstbanData = () => {
      return [
        ["UF", "MUNICIPIO", "VERBETE_711_CONTAS_CREDORAS"],
        ["MG", "BELO HORIZONTE", 200_000_000],
        ["SP", "SAO PAULO", 500_000],
      ];
    };

    const calculator = new IssqnCalculator();
    const mockInput = {
      uf: "MG",
      municipio: "Belo Horizonte",
    };

    const result = calculator.calculate(mockInput as any);
    const expected = 2_500_000;

    if (result === expected) {
      console.log(`testIssqnCalculatorSuccess: PASSED (Result: ${result})`);
    } else {
      console.error(
        `testIssqnCalculatorSuccess: FAILED. Expected ${expected}, but received ${result}`,
      );
    }
  } catch (error: any) {
    console.error(
      `testIssqnCalculatorSuccess: UNEXPECTED ERROR - ${error.message}`,
    );
  } finally {
    ExternalDataHelper.getEstbanData = originalGetEstbanData;
  }
}

function testIssqnCalculatorNotFound() {
  const originalGetEstbanData = ExternalDataHelper.getEstbanData;

  try {
    ExternalDataHelper.getEstbanData = () => {
      return [
        ["UF", "MUNICIPIO", "VERBETE_711_CONTAS_CREDORAS"],
        ["MG", "BELO HORIZONTE", 100_000],
      ];
    };

    const calculator = new IssqnCalculator();
    const mockInput = {
      uf: "RJ",
      municipio: "RIO DE JANEIRO",
    };

    const result = calculator.calculate(mockInput as any);
    const EXPECTED_FLOOR = 1_500_000;

    if (result === EXPECTED_FLOOR) {
      console.log(
        `testIssqnCalculatorNotFound: PASSED (Default floor result: ${result})`,
      );
    } else {
      console.error(
        `testIssqnCalculatorNotFound: FAILED. Expected ${EXPECTED_FLOOR}, but received ${result}`,
      );
    }
  } finally {
    ExternalDataHelper.getEstbanData = originalGetEstbanData;
  }
}
