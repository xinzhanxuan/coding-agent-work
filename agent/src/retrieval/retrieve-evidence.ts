import { access } from "node:fs/promises";
import { dirname, join, normalize } from "node:path";
import { readTextFile } from "../infra/read-text-file";
import { searchFilesWithRipgrep } from "../infra/search-files";
import { extractFilePathsFromTestOutput } from "./parse-test-output";

export async function retrieveEvidence(
  issue: string,
  repoDir: string,
  testStderr?: string,
) {
  // 先用 issue 里的关键词（简单策略：取前 5 个词）
  const q = issue.split(/\s+/).slice(0, 5).join(" ");

  const reasons = new Map<string, Set<string>>();
  const addReason = (path: string, reason: string) => {
    if (!path) return;
    const p = normalizeRel(path);
    if (!reasons.has(p)) reasons.set(p, new Set<string>());
    reasons.get(p)!.add(reason);
  };

  const rgMatched = await searchFilesWithRipgrep(q, repoDir);
  const stderrMatched = testStderr
    ? extractFilePathsFromTestOutput(testStderr)
    : [];

  for (const p of stderrMatched) addReason(p, "from_stderr");
  for (const p of rgMatched) addReason(p, "from_issue_rg");

  const seedFiles = uniqueInOrder([...stderrMatched, ...rgMatched]).slice(0, 8);
  for (const relPath of seedFiles) {
    if (!isTestFile(relPath)) continue;
    const absPath = join(repoDir, relPath);
    let content = "";
    try {
      content = await readTextFile(absPath, 12000);
    } catch {
      continue;
    }
    const mods = extractRelativeImports(content);
    for (const m of mods) {
      const implCandidates = await resolveImportToFiles(repoDir, relPath, m);
      for (const implPath of implCandidates) addReason(implPath, "from_test_import");
    }
  }

  const files = Array.from(reasons.keys()).sort(byReasonPriority(reasons));
  const topFiles = files.slice(0, 5); // 先 5 个
  const snippets = await Promise.all(
    topFiles.slice(0, 3).map(async (relPath) => {
      const abs = join(repoDir, relPath);
      const content = await readTextFile(abs, 8000);
      return { path: relPath, content };
    }),
  );

  return {
    query: q,
    files: topFiles,
    snippets,
    reasons: Object.fromEntries(
      Array.from(reasons.entries()).map(([k, v]) => [k, Array.from(v)]),
    ),
  };
}

function extractRelativeImports(tsCode: string) {
  // 捕获：from "./sum" / from '../x' / require("./sum")
  const mods = new Set<string>();

  const fromRe = /\bfrom\s+["'](\.\/[^"']+|\.\.\/[^"']+)["']/g;
  const reqRe = /\brequire\(\s*["'](\.\/[^"']+|\.\.\/[^"']+)["']\s*\)/g;

  let m: RegExpExecArray | null;
  while ((m = fromRe.exec(tsCode))) mods.add(m[1]);
  while ((m = reqRe.exec(tsCode))) mods.add(m[1]);

  return Array.from(mods);
}

function normalizeRel(relPath: string) {
  return relPath.replace(/\\/g, "/").replace(/^\.\//, "");
}

function uniqueInOrder(items: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const k = normalizeRel(item);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(k);
  }
  return out;
}

function isTestFile(relPath: string) {
  return /\.test\.(ts|tsx|js|jsx)$/.test(relPath);
}

async function resolveImportToFiles(
  repoDir: string,
  importerRelPath: string,
  relativeModule: string,
) {
  const importerDir = dirname(importerRelPath);
  const base = normalizeRel(normalize(join(importerDir, relativeModule)));
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.js`,
    `${base}.jsx`,
    `${base}/index.ts`,
    `${base}/index.tsx`,
    `${base}/index.js`,
    `${base}/index.jsx`,
  ];

  const found: string[] = [];
  for (const rel of uniqueInOrder(candidates)) {
    try {
      await access(join(repoDir, rel));
      found.push(rel);
    } catch {
      // noop
    }
  }
  return found;
}

function byReasonPriority(reasons: Map<string, Set<string>>) {
  return (a: string, b: string) => score(b) - score(a);

  function score(path: string) {
    const tags = reasons.get(path) ?? new Set<string>();
    let s = 0;
    if (tags.has("from_stderr")) s += 100;
    if (tags.has("from_test_import")) s += 60;
    if (tags.has("from_issue_rg")) s += 20;
    if (isTestFile(path)) s -= 5;
    return s;
  }
}
