import { saveRunRecord } from "../artifacts/save-run-record";
import {
  applyPatch,
  PatchApplyError,
  PatchCheckError,
  PatchParseError,
} from "../apply/apply-patch";
import type {
  FinalStatus,
  FailureType,
  RunRecord,
  RunRound,
  StageError,
} from "../domain/run-record";
import { generatePatch } from "../edit/generate-patch";
import { retrieveEvidence } from "../retrieval/retrieve-evidence";
import { runTests } from "../verification/run-tests";

interface RunFixTaskInput {
  cmd: string;
  repo: string;
  issue: string;
}

export async function runFixTask({ cmd, repo, issue }: RunFixTaskInput) {
  const startedAtMs = Date.now();
  const startedAt = new Date(startedAtMs).toISOString();
  const runId = `${startedAtMs}`;
  const round: RunRound = {
    round: 1,
    status: "running",
    stages: {
      retrieve: {
        status: "pending",
      },
      edit: {
        status: "pending",
      },
      apply: {
        status: "pending",
        strategy: "git-apply",
      },
      verify: {
        status: "pending",
        steps: [],
      },
    },
  };

  let failureType: FailureType | undefined;
  let finalStatus: FinalStatus = "failed";

  try {
    const baseline = await runTests(repo);
    const retrieveStart = Date.now();
    let evidence: Awaited<ReturnType<typeof retrieveEvidence>>;
    try {
      evidence = await retrieveEvidence(issue, repo, baseline.stderr);
      round.stages.retrieve = {
        status: "success",
        durationMs: Date.now() - retrieveStart,
        query: evidence.query,
        candidates: evidence.files,
        candidateReasons: evidence.reasons,
        selectedSnippets: evidence.snippets.map((s) => ({
          path: s.path,
          previewLen: s.content.length,
        })),
      };
    } catch (error) {
      failureType = "retrieve_failed";
      round.status = "failed";
      round.stopReason = "retrieve_failed";
      round.stages.retrieve = {
        status: "failed",
        durationMs: Date.now() - retrieveStart,
        error: {
          code: "RETRIEVE_FAILED",
          message: error instanceof Error ? error.message : String(error),
        },
      };
      round.stages.edit = {
        ...round.stages.edit,
        status: "skipped",
      };
      round.stages.apply = {
        ...round.stages.apply,
        status: "skipped",
        strategy: "none",
      };
      round.stages.verify = {
        ...round.stages.verify,
        status: "skipped",
        steps: [],
      };
      throw new AbortRoundError();
    }

    const allowedFiles = evidence.files.slice(0, 3);

    const editStart = Date.now();
    const patch = await generatePatch({
      issue,
      repoDir: repo,
      allowedFiles,
      snippets: evidence.snippets,
    });
    round.stages.edit = {
      status: "success",
      durationMs: Date.now() - editStart,
      backend: patch.backend,
      model: patch.model,
      promptHash: patch.promptHash,
      rawDiffBytes: Buffer.byteLength(patch.rawDiff, "utf-8"),
      diffSummary: {
        changedFiles: patch.changedFiles,
        addedLines: patch.addedLines,
        deletedLines: patch.deletedLines,
      },
    };

    const applyStart = Date.now();
    const applyRes = await applyPatch(patch.rawDiff, repo, allowedFiles);
    round.stages.apply = {
      status: "success",
      durationMs: Date.now() - applyStart,
      strategy: "git-apply",
      changedFiles: applyRes.changedFiles,
    };

    const verifyStart = Date.now();
    const testRes = await runTests(repo);
    round.stages.verify = {
      status: testRes.exitCode === 0 ? "success" : "failed",
      durationMs: Date.now() - verifyStart,
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
      error: toVerifyError(testRes.errorType, testRes.cmd, testRes.stderr),
    };

    if (testRes.errorType === "timeout" || testRes.errorType === "spawn_error") {
      failureType = "infra_failed";
      round.status = "failed";
      round.stopReason = "infra_failed";
      finalStatus = "failed";
    } else if (testRes.exitCode !== 0) {
      failureType = "verify_failed";
      round.status = "failed";
      round.stopReason = "verify_failed";
      finalStatus = "failed";
    } else {
      round.status = "success";
      round.stopReason = "success";
      finalStatus = "success";
    }
  } catch (error) {
    if (error instanceof AbortRoundError) {
      finalStatus = "failed";
    } else {
      const result = classifyFailure(error);
      failureType = result.failureType;
      round.status = "failed";
      round.stopReason = result.stopReason;
      result.assign(round);
      finalStatus = "failed";
    }
  }

  const finishedAtMs = Date.now();
  const runRecord: RunRecord = {
    runId,
    startedAt,
    finishedAt: new Date(finishedAtMs).toISOString(),
    task: {
      cmd,
      repo,
      issue,
    },
    rounds: [round],
    metrics: {
      totalDurationMs: finishedAtMs - startedAtMs,
    },
    finalStatus,
    failureType,
  };

  const savedPath = await saveRunRecord(runRecord);
  return {
    savedPath,
    verifyExitCode: round.stages.verify.finalExitCode ?? (finalStatus === "success" ? 0 : 1),
  };
}

class AbortRoundError extends Error {}

function toVerifyError(
  errorType: "timeout" | "spawn_error" | undefined,
  cmd: string,
  stderr: string,
): StageError | undefined {
  if (errorType === "timeout") {
    return {
      code: "TIMEOUT",
      message: "verification command timed out",
      details: `cmd=${cmd}`,
    };
  }
  if (errorType === "spawn_error") {
    return {
      code: "SPAWN_ERROR",
      message: "verification command failed to start",
      details: stderr.slice(0, 500),
    };
  }
  return undefined;
}

function classifyFailure(error: unknown) {
  if (error instanceof PatchParseError) {
    return stageFailure("edit_failed", "edit_failed", "edit", {
      code: error.code,
      message: error.message,
    });
  }
  if (error instanceof PatchCheckError || error instanceof PatchApplyError) {
    return stageFailure("apply_failed", "apply_failed", "apply", {
      code: error.code,
      message: error.message,
    });
  }
  if (error instanceof Error) {
    return stageFailure("edit_failed", "edit_failed", "edit", {
      code: "EDIT_FAILED",
      message: error.message,
    });
  }
  return stageFailure("unknown", "infra_failed", "verify", {
    code: "UNKNOWN",
    message: String(error),
  });
}

function stageFailure(
  failureType: FailureType,
  stopReason: RunRound["stopReason"],
  stage: "edit" | "apply" | "verify",
  error: StageError,
) {
  return {
    failureType,
    stopReason,
    assign(round: RunRound) {
      if (stage === "edit") {
        round.stages.edit = {
          ...round.stages.edit,
          status: "failed",
          error,
        };
        round.stages.apply = {
          ...round.stages.apply,
          status: "skipped",
          strategy: "none",
        };
        round.stages.verify = {
          ...round.stages.verify,
          status: "skipped",
          steps: [],
        };
      } else if (stage === "apply") {
        round.stages.apply = {
          ...round.stages.apply,
          status: "failed",
          error,
        };
        round.stages.verify = {
          ...round.stages.verify,
          status: "skipped",
          steps: [],
        };
      } else {
        round.stages.verify = {
          ...round.stages.verify,
          status: "failed",
          error,
        };
      }
    },
  };
}
