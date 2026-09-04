import type { SecurityTest } from "../lib/test-registry";
import type { ExecutableTest } from "./types";

export function toExecutableTests(registry: SecurityTest[]): ExecutableTest[] {
  return registry.map(({ id, name, category, severity, executor, active }) => {
    if (!active) throw new Error(`${id} is not connected to an executor`);
    return { id, name, category, severity, executor, active };
  });
}
