import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runCommand } from "../infra/run-command";

export interface ApplyPatchResult {
  changedFiles: string[];
}

export class PatchParseError extends Error {
  code = "PATCH_PARSE_FAILED";
}

export class PatchCheckError extends Error {
  code = "PATCH_CHECK_FAILED";
}

export class PatchApplyError extends Error {
  code = "PATCH_APPLY_FAILED";
}

export async function applyPatch(
  rawDiff: string,
  repoDir: string,
  allowedFiles: string[],
): Promise<ApplyPatchResult> {
  const changedFiles = extractChangedFiles(rawDiff);
  if (changedFiles.length === 0) {
    throw new PatchParseError("diff does not contain any changed files");
  }

  const allowed = new Set(allowedFiles);
  for (const file of changedFiles) {
    if (!allowed.has(file)) {
      throw new PatchParseError(`diff touches non-whitelisted file: ${file}`);
    }
  }

  const tempDir = await mkdtemp(join(tmpdir(), "agent-apply-"));
  const patchPath = join(tempDir, "candidate.diff");

  try {
    await writeFile(patchPath, rawDiff, "utf-8");

    const check = await runCommand(
      `git apply --check --whitespace=nowarn "${patchPath}"`,
      repoDir,
    );
    if (check.errorType === "spawn_error") {
      throw new PatchApplyError(check.stderr || "failed to start git apply --check");
    }
    if (check.exitCode !== 0) {
      throw new PatchCheckError(check.stderr || "git apply --check failed");
    }

    const apply = await runCommand(
      `git apply --whitespace=nowarn "${patchPath}"`,
      repoDir,
    );
    if (apply.errorType === "spawn_error") {
      throw new PatchApplyError(apply.stderr || "failed to start git apply");
    }
    if (apply.exitCode !== 0) {
      throw new PatchApplyError(apply.stderr || "git apply failed");
    }

    return { changedFiles };
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

function extractChangedFiles(rawDiff: string) {
  const changed = new Set<string>();
  const lines = rawDiff.split("\n");

  for (const line of lines) {
    if (line.startsWith("+++ b/")) {
      changed.add(line.slice("+++ b/".length));
    }
  }

  return Array.from(changed);
}
