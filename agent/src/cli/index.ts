import { existsSync } from "node:fs";

function getArg(name: string) {
  const idx = process.argv.indexOf(name);
  if (idx === -1) return null;
  return process.argv[idx + 1] ?? null;
}
console.log("process.argv", process.argv);
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

console.log(
  JSON.stringify(
    {
      cmd,
      repo,
      issue,
      now: new Date().toISOString(),
      next: "Tomorrow we will: search repo, read files, and run tests automatically.",
    },
    null,
    2,
  ),
);
