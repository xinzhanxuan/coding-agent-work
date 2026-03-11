import { runTests } from "../verification/run-tests";
import { saveRunRecord } from "../artifacts/save-run-record";
import { retrieveEvidence } from "../retrieval/retrieve-evidence";
import type { FailureType, RunRecord } from "../domain/run-record";

interface RunFixTaskInput {
  cmd: string;
  repo: string;
  issue: string;
}

export async function runFixTask({ cmd, repo, issue }: RunFixTaskInput) {
  const startedAtMs = Date.now();
  const startedAt = new Date(startedAtMs).toISOString();
  const runId = `${startedAtMs}`;

  const testRes = await runTests(repo);
  const retrieveStart = Date.now();
  const evidence = await retrieveEvidence(issue, repo, testRes.stderr);
  const retrieveDurationMs = Date.now() - retrieveStart;
  const finishedAtMs = Date.now();
  const finishedAt = new Date(finishedAtMs).toISOString();

  const verifyStatus = testRes.exitCode === 0 ? "success" : "failed";
  const finalStatus = verifyStatus === "success" ? "success" : "failed";
  const failureType: FailureType | undefined =
    finalStatus === "failed"
      ? testRes.errorType === "timeout" || testRes.errorType === "spawn_error"
        ? "infra_failed"
        : "verify_failed"
      : undefined;

  const runRecord: RunRecord = {
    runId,
    startedAt,
    finishedAt,
    task: {
      cmd,
      repo,
      issue,
    },
    stages: {
      retrieve: {
        status: "success",
        durationMs: retrieveDurationMs,
        query: evidence.query,
        candidates: evidence.files,
        candidateReasons: evidence.reasons,
        selectedSnippets: evidence.snippets.map((s) => ({
          path: s.path,
          previewLen: s.content.length,
        })),
      },
      edit: {
        status: "skipped",
      },
      apply: {
        status: "skipped",
        strategy: "none",
      },
      verify: {
        status: verifyStatus,
        durationMs: testRes.durationMs,
        steps: [
          {
            name: "test",
            cmd: testRes.cmd,
            exitCode: testRes.exitCode ?? null,
            durationMs: testRes.durationMs,
            stdout: testRes.stdout.slice(0, 2000),
            stderr: testRes.stderr.slice(0, 2000),
          },
        ],
        finalExitCode: testRes.exitCode ?? null,
        error:
          testRes.errorType === "timeout"
            ? {
                code: "TIMEOUT",
                message: "verification command timed out",
                details: `cmd=${testRes.cmd}`,
              }
            : testRes.errorType === "spawn_error"
              ? {
                  code: "SPAWN_ERROR",
                  message: "verification command failed to start",
                  details: testRes.stderr.slice(0, 500),
                }
              : undefined,
      },
    },
    metrics: {
      totalDurationMs: finishedAtMs - startedAtMs,
    },
    finalStatus,
    failureType,
  };

  const savedPath = await saveRunRecord(runRecord);
  return {
    savedPath,
    verifyExitCode: testRes.exitCode ?? 0,
  };
}
