import { runCommand } from "../infra/run-command";

export async function runTests(repoDir: string, timeoutMs = 120_000) {
  // playground 就是 pnpm test
  return runCommand("pnpm test", repoDir, { timeoutMs });
}
