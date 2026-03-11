import { readFile } from "node:fs/promises";

export async function readTextFile(path: string, maxLen = 8000) {
  const txt = await readFile(path, "utf-8");
  return txt.length > maxLen ? txt.slice(0, maxLen) : txt;
}
