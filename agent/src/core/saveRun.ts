import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

export async function saveRun(run: any) {
  const dir = join(process.cwd(), "runs");
  await mkdir(dir, { recursive: true });
  const path = join(dir, `${Date.now()}.json`);
  await writeFile(path, JSON.stringify(run, null, 2), "utf-8");
  return path;
}
