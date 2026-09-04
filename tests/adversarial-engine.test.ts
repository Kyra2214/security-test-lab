import { describe, expect, it } from "vitest";
import { TEST_REGISTRY } from "../lib/test-registry";
import { AdversarialEngine } from "../engine/adversarial-engine";
import { toExecutableTests } from "../engine/registry-adapter";
import { ScopeViolation, assertSafeScope } from "../engine/scope-guard";
import type { ScopeManifest } from "../engine/types";

const scope: ScopeManifest = {
  baseUrl: "http://target:8080",
  allowedHosts: ["target"],
  networkMode: "internal",
  requestBudget: 1000,
  concurrency: 4,
  timeoutMs: 5000,
  syntheticOnly: true,
};

describe("Security Test Lab adversarial engine", () => {
  it("connects all 300 catalog entries to an executor", () => {
    const executable = toExecutableTests(TEST_REGISTRY);
    expect(executable).toHaveLength(300);
    expect(executable.every((test) => test.active && test.executor === "scoped-probe")).toBe(true);
  });

  it("rejects a target outside the internal Docker scope", () => {
    expect(() => assertSafeScope({ ...scope, baseUrl: "https://example.com", allowedHosts: ["example.com"] })).toThrow(ScopeViolation);
  });

  it("continues after findings and emits attack stages", async () => {
    const events: string[] = [];
    const engine = new AdversarialEngine(async (test, _scope, emit) => {
      emit({ at: new Date().toISOString(), stage: "Attack", testId: test.id, message: "synthetic attack", blocked: false });
      return { testId: test.id, category: test.category, hypothesis: test.name, status: "validated", evidence: [], chainCandidates: [] };
    });
    const result = await engine.run(toExecutableTests(TEST_REGISTRY).slice(0, 3), scope, (event) => events.push(event.stage));
    expect(result.completed).toBe(3);
    expect(result.findings).toHaveLength(3);
    expect(events).toContain("Chain");
    expect(events.at(-1)).toBe("Report");
  });
});
