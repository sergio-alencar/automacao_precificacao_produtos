// apps_script/test.ts

function runAllTests(): void {
  console.log("=== STARTING TESTS SUITE ===");

  testIssqnCalculatorSuccess();
  testIssqnCalculatorNotFound();

  console.log("=== TESTS FINISHED ===");
}

function testIssqnCalculatorSuccess(): void {
  const testName = "testIssqnCalculatorSuccess";
  const originalMethod = ExternalDataHelper.getEstbanData;

  try {
    ExternalDataHelper.getEstbanData = () => [
      ["UF", "MUNICIPIO", "VERBETE_711_CONTAS_CREDORAS"],
      ["MG", "BELO HORIZONTE", 200_000_000],
    ];

    const calculator = new IssqnCalculator();
    const mockInput: CalculationInput = {
      uf: "MG",
      municipio: "Belo Horizonte",
    };

    const result = calculator.calculate(mockInput);
    const expected = 12_500_000;

    assert(testName, result, expected);
  } catch (error) {
    reportError(testName, error);
  } finally {
    ExternalDataHelper.getEstbanData = originalMethod;
  }
}

function testIssqnCalculatorNotFound(): void {
  const testName = "testIssqnCalculatorNotFound";
  const originalMethod = ExternalDataHelper.getEstbanData;

  try {
    ExternalDataHelper.getEstbanData = () => [
      ["UF", "MUNICIPIO", "VERBETE_711_CONTAS_CREDORAS"],
      ["MG", "OUTRA CIDADE", 100_000],
    ];

    const calculator = new IssqnCalculator();
    const mockInput: CalculationInput = {
      uf: "RJ",
      municipio: "RIO DE JANEIRO",
    };

    const result = calculator.calculate(mockInput);
    const EXPECTED_FLOOR = 1_500_000;

    assert(testName, result, EXPECTED_FLOOR);
  } catch (error) {
    reportError(testName, error);
  } finally {
    ExternalDataHelper.getEstbanData = originalMethod;
  }
}

function assert(name: string, received: number | null, expected: number): void {
  if (received === expected) {
    console.log(`✅ [PASSED] ${name} (Received: ${received})`);
  } else {
    console.error(
      `[FAILED] ${name}\n   Expected: ${expected}\n   Received: ${received}`,
    );
  }
}

function reportError(name: string, error: unknown): void {
  console.error(
    `[ERROR] ${name}: UNEXPECTED EXCEPTION - ${Utils.getErrorMessage(error)}`,
  );
}
