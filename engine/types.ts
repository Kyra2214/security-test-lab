export type AttackStage = "Recon" | "Attack" | "Exploit" | "Chain" | "Validate" | "Prove" | "Report";

export type ScopeManifest = {
  baseUrl: string;
  allowedHosts: string[];
  networkMode: "internal";
  requestBudget: number;
  concurrency: number;
  timeoutMs: number;
  syntheticOnly: true;
};

export type Evidence = {
  kind: "observation" | "canary" | "blocked" | "error";
  summary: string;
  redactedValue?: string;
};

export type FindingStatus = "suspected" | "validated" | "impact-measured" | "chained" | "unconfirmed";

export type Finding = {
  testId: string;
  category: string;
  hypothesis: string;
  status: FindingStatus;
  evidence: Evidence[];
  chainCandidates: string[];
};

export type AttackEvent = {
  at: string;
  stage: AttackStage;
  testId?: string;
  message: string;
  blocked: boolean;
};

export type ExecutableTest = {
  id: string;
  name: string;
  category: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  executor: string;
  active: true;
};

export type TestExecutor = (test: ExecutableTest, scope: ScopeManifest, emit: (event: AttackEvent) => void) => Promise<Finding | null>;
