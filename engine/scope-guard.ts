import type { ScopeManifest } from "./types";

export class ScopeViolation extends Error {
  constructor(message: string) {
    super(`SCOPE_BLOCKED: ${message}`);
    this.name = "ScopeViolation";
  }
}

export function assertSafeScope(scope: ScopeManifest): void {
  if (scope.networkMode !== "internal") throw new ScopeViolation("network must be internal");
  if (scope.syntheticOnly !== true) throw new ScopeViolation("synthetic-only mode is mandatory");
  if (!Number.isInteger(scope.requestBudget) || scope.requestBudget < 1 || scope.requestBudget > 100_000) {
    throw new ScopeViolation("request budget is invalid");
  }
  if (!Number.isInteger(scope.concurrency) || scope.concurrency < 1 || scope.concurrency > 64) {
    throw new ScopeViolation("concurrency is outside the allowed range");
  }
  if (!Number.isInteger(scope.timeoutMs) || scope.timeoutMs < 100 || scope.timeoutMs > 300_000) {
    throw new ScopeViolation("timeout is invalid");
  }
  const target = new URL(scope.baseUrl);
  if (target.protocol !== "http:") throw new ScopeViolation("target must use internal HTTP");
  if (!scope.allowedHosts.includes(target.hostname)) throw new ScopeViolation("target host is not allowlisted");
  if (!["target", "localhost", "127.0.0.1"].includes(target.hostname) && !target.hostname.endsWith(".internal")) {
    throw new ScopeViolation("target must resolve inside the Docker lab");
  }
}

export function assertUrlInScope(url: string, scope: ScopeManifest): URL {
  const parsed = new URL(url);
  const base = new URL(scope.baseUrl);
  if (parsed.protocol !== base.protocol || parsed.hostname !== base.hostname || parsed.port !== base.port) {
    throw new ScopeViolation(`URL outside target origin: ${parsed.origin}`);
  }
  return parsed;
}
