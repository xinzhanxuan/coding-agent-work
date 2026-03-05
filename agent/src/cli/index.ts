import { existsSync } from "node:fs";
import { runTests } from "../core/runTests";
import { saveRun } from "../core/saveRun";
import { json } from "node:stream/consumers";

function getArg(name: string) {
  const idx = process.argv.indexOf(name);
  if (idx === -1) return null;
  return process.argv[idx + 1] ?? null;
}

async function main() {
  const cmd = process.argv[2];
  if (cmd !== "fix") {
    console.log(`Usage: pnpm agent fix --repo <path> --issue "<text>"`);
    process.exit(0);
  }

  const repo = getArg("--repo");
  const issue = getArg("--issue");

  if (!repo || !issue) {
    console.error("Missing --repo or --issue");
    process.exit(1);
  }

  if (!existsSync(repo)) {
    console.error(`Repo path not found: ${repo}`);
    process.exit(1);
  }

  const testRes = await runTests(repo);
  const run = {
    cmd,
    repo,
    issue,
    now: new Date().toISOString(),
    test: {
      exitCode: testRes.exitCode,
      stdout: testRes.stdout,
      stderr: testRes.stderr,
    },
  };
  console.log(JSON.stringify(run));
  const savedPath = await saveRun(run);
  console.log("saved:", savedPath);
  process.exit(testRes.exitCode ?? 0);
}
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
