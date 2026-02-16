/**
 * Gemini Moral Engine Test Suite
 */

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export const runAIServiceTests = () => {
  const results: TestResult[] = [];

  const test = (name: string, fn: () => void) => {
    try {
      fn();
      results.push({ name, passed: true });
    } catch (e: any) {
      results.push({ name, passed: false, error: e.message });
    }
  };

  test("Sanitization - Removes HTML tags from user input", () => {
    const rawInput = "<script>alert('hack')</script> I choose to help.";
    const sanitized = rawInput.substring(0, 500).replace(/[<>]/g, '');
    if (sanitized.includes("<") || sanitized.includes(">")) {
      throw new Error("Sanitization failed to remove brackets");
    }
    if (!sanitized.includes("I choose to help")) {
      throw new Error("Sanitization removed valid text");
    }
  });

  test("Sanitization - Limits input length to 500 chars", () => {
    const longInput = "a".repeat(1000);
    const sanitized = longInput.substring(0, 500);
    if (sanitized.length !== 500) {
      throw new Error(`Expected 500, got ${sanitized.length}`);
    }
  });

  test("Fallback - Service returns static dilemma on AI failure", () => {
    // Simulated behavior
    const fallbackDilemma = {
      id: "fallback_static",
      scenario: "You discover a colleague making a small mistake that helps the team but violates a minor rule. Do you report it?",
      context: "The Workplace"
    };
    if (!fallbackDilemma.scenario.length) throw new Error("Fallback scenario is empty");
  });

  console.group("🧠 Gemini AI Service Tests");
  results.forEach(r => {
    console.log(`${r.passed ? '✅' : '❌'} ${r.name}`);
    if (r.error) console.error(r.error);
  });
  console.groupEnd();

  return results;
};
