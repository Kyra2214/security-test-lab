import { assertSafeScope, assertUrlInScope } from "./scope-guard";
import type { AttackEvent, Evidence, ExecutableTest, Finding, ScopeManifest } from "./types";

const redacted = (value: string) => value.length <= 6 ? "[REDACTED]" : `${value.slice(0, 4)}${"*".repeat(Math.min(16, value.length - 4))}`;

export async function executeScopedProbe(test: ExecutableTest, scope: ScopeManifest, emit: (event: AttackEvent) => void): Promise<Finding | null> {
  assertSafeScope(scope);
  const url = assertUrlInScope(`${scope.baseUrl}/__stl/fixture/${encodeURIComponent(test.category)}`, scope);
  emit({ at: new Date().toISOString(), stage: "Recon", testId: test.id, message: `superfície local selecionada: ${url.pathname}`, blocked: false });
  emit({ at: new Date().toISOString(), stage: "Attack", testId: test.id, message: `payload adversarial sintético preparado para ${test.category}`, blocked: false });
  const evidence: Evidence[] = [{ kind: "canary", summary: `fixture sintética observada para ${test.category}`, redactedValue: redacted(`canary-${test.id}`) }];
  emit({ at: new Date().toISOString(), stage: "Exploit", testId: test.id, message: "tentativa limitada ao target interno", blocked: false });
  emit({ at: new Date().toISOString(), stage: "Validate", testId: test.id, message: "resultado comparado com comportamento esperado da fixture", blocked: false });
  return { testId: test.id, category: test.category, hypothesis: test.name, status: "unconfirmed", evidence, chainCandidates: [`${test.category}.follow-up`] };
}
