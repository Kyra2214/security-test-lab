import { assertSafeScope } from "./scope-guard";
import { executeScopedProbe } from "./primitives";
import type { AttackEvent, ExecutableTest, Finding, ScopeManifest, TestExecutor } from "./types";

export type CampaignResult = { events: AttackEvent[]; findings: Finding[]; completed: number; blocked: number };

export class AdversarialEngine {
  constructor(private readonly executor: TestExecutor = executeScopedProbe) {}

  async run(tests: ExecutableTest[], scope: ScopeManifest, onEvent?: (event: AttackEvent) => void): Promise<CampaignResult> {
    assertSafeScope(scope);
    const events: AttackEvent[] = [];
    const findings: Finding[] = [];
    let completed = 0;
    let blocked = 0;
    const emit = (event: AttackEvent) => { events.push(event); onEvent?.(event); };
    emit({ at: new Date().toISOString(), stage: "Recon", message: `campanha iniciada com ${tests.length} hipóteses`, blocked: false });
    for (const test of tests) {
      try {
        const finding = await this.executor(test, scope, emit);
        if (finding) {
          findings.push(finding);
          emit({ at: new Date().toISOString(), stage: "Chain", testId: test.id, message: "finding registrado; candidatos de encadeamento avaliados; campanha continua", blocked: false });
        }
        completed += 1;
      } catch (error) {
        blocked += 1;
        emit({ at: new Date().toISOString(), stage: "Report", testId: test.id, message: error instanceof Error ? error.message : "execução bloqueada", blocked: true });
      }
    }
    emit({ at: new Date().toISOString(), stage: "Report", message: `campanha finalizada: ${completed} concluídos, ${blocked} bloqueados`, blocked: false });
    return { events, findings, completed, blocked };
  }
}
