import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import { runCommand } from "../infra/run-command";

interface EvidenceSnippet {
  path: string;
  content: string;
}

interface GeneratePatchInput {
  issue: string;
  repoDir: string;
  allowedFiles: string[];
  snippets: EvidenceSnippet[];
}

export interface GeneratePatchResult {
  backend: "heuristic" | "llm";
  model?: string;
  promptHash: string;
  rawDiff: string;
  changedFiles: string[];
  addedLines: number;
  deletedLines: number;
}

export async function generatePatch({
  issue,
  repoDir,
  allowedFiles,
  snippets,
}: GeneratePatchInput): Promise<GeneratePatchResult> {
  const promptHash = createHash("sha256")
    .update(
      JSON.stringify({
        issue,
        allowedFiles,
        snippets: snippets.map((snippet) => ({
          path: snippet.path,
          content: snippet.content,
        })),
      }),
    )
    .digest("hex")
    .slice(0, 12);

  const candidate = findHeuristicCandidate(snippets, allowedFiles);
  if (!candidate) {
    throw new Error("heuristic backend could not derive a patch from evidence");
  }

  const original = await readFile(join(repoDir, candidate.path), "utf-8");
  const updated = applyHeuristicFix(original);
  if (updated === original) {
    throw new Error("heuristic backend produced no code changes");
  }

  const rawDiff = await buildUnifiedDiff(repoDir, candidate.path, updated);
  const { changedFiles, addedLines, deletedLines } = summarizeDiff(rawDiff);

  if (changedFiles.length === 0) {
    throw new Error("generated diff is empty");
  }

  return {
    backend: "heuristic",
    promptHash,
    rawDiff,
    changedFiles,
    addedLines,
    deletedLines,
  };
}

function findHeuristicCandidate(
  snippets: EvidenceSnippet[],
  allowedFiles: string[],
) {
  const allowed = new Set(allowedFiles);
  return snippets.find(
    (snippet) =>
      allowed.has(snippet.path) && snippet.content.includes("arr.length - 1"),
  );
}

function applyHeuristicFix(content: string) {
  return content.replace("arr.length - 1", "arr.length");
}

async function buildUnifiedDiff(
  repoDir: string,
  relPath: string,
  updated: string,
) {
  const tempDir = await mkdtemp(join(tmpdir(), "agent-patch-"));
  const tempFile = join(tempDir, basename(relPath));

  try {
    await writeFile(tempFile, updated, "utf-8");
    const originalPath = join(repoDir, relPath);
    const res = await runCommand(
      `git diff --no-index -- "${originalPath}" "${tempFile}"`,
      dirname(originalPath),
    );

    const raw = [res.stdout, res.stderr].filter(Boolean).join("\n").trim();
    if (!raw) {
      throw new Error("git diff returned empty output");
    }

    return normalizeNoIndexDiff(raw, relPath);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

function normalizeNoIndexDiff(diff: string, relPath: string) {
  return diff
    .replace(
      /^diff --git a\/.* b\/.*$/m,
      `diff --git a/${relPath} b/${relPath}`,
    )
    .replace(/^--- a\/.*$/m, `--- a/${relPath}`)
    .replace(/^\+\+\+ b\/.*$/m, `+++ b/${relPath}`);
}

function summarizeDiff(rawDiff: string) {
  const changedFiles = new Set<string>();
  let addedLines = 0;
  let deletedLines = 0;

  for (const line of rawDiff.split("\n")) {
    if (line.startsWith("+++ b/")) {
      changedFiles.add(line.slice("+++ b/".length));
    } else if (line.startsWith("+") && !line.startsWith("+++")) {
      addedLines += 1;
    } else if (line.startsWith("-") && !line.startsWith("---")) {
      deletedLines += 1;
    }
  }

  return {
    changedFiles: Array.from(changedFiles),
    addedLines,
    deletedLines,
  };
}
