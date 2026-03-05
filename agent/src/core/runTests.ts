import { runCmd } from "../tools/runCmd";

export async function runTests(repoDir: string) {
  // playground 就是 pnpm test
  return runCmd("pnpm test", repoDir);
}
