import { existsSync } from "node:fs";
import { runFixTask } from "../app/run-fix-task";

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
  const { savedPath, verifyExitCode } = await runFixTask({ cmd, repo, issue });
  console.log("saved:", savedPath);
  process.exit(verifyExitCode);
}
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
