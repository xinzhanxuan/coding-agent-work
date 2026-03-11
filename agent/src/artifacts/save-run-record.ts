import { mkdir, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { RunRecord } from "../domain/run-record";

function safeId(input: string) {
  return input.replace(/[^a-zA-Z0-9_-]/g, "_");
}

export async function saveRunRecord(run: RunRecord) {
  const dir = join(process.cwd(), "runs");
  await mkdir(dir, { recursive: true });
  const base = `${Date.now()}-${safeId(run.runId)}`;
  const tmpPath = join(dir, `.${base}.tmp`);
  const finalPath = join(dir, `${base}.json`);

  // Write-then-rename to avoid partial/corrupted artifacts when interrupted.
  await writeFile(tmpPath, JSON.stringify(run, null, 2), "utf-8");
  await rename(tmpPath, finalPath);
  return finalPath;
}
