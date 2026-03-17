export type StageStatus =
  | "pending"
  | "running"
  | "success"
  | "failed"
  | "skipped";

export type FinalStatus = "success" | "failed";

export type FailureType =
  | "retrieve_failed"
  | "edit_failed"
  | "apply_failed"
  | "verify_failed"
  | "infra_failed"
  | "unknown";

export interface StageError {
  code?: string;
  message: string;
  details?: string;
}

export interface SnippetPreview {
  path: string;
  previewLen: number;
}

export interface RetrieveStage {
  status: StageStatus;
  durationMs?: number;
  query?: string;
  candidates?: string[];
  candidateReasons?: Record<string, string[]>;
  selectedSnippets?: SnippetPreview[];
  error?: StageError;
}

export interface EditStage {
  status: StageStatus;
  durationMs?: number;
  backend?: "heuristic" | "llm";
  model?: string;
  promptHash?: string;
  rawDiffBytes?: number;
  diffSummary?: {
    changedFiles: string[];
    addedLines?: number;
    deletedLines?: number;
  };
  error?: StageError;
}

export interface ApplyStage {
  status: StageStatus;
  durationMs?: number;
  strategy?: "git-apply" | "manual" | "none";
  changedFiles?: string[];
  error?: StageError;
}

export interface VerifyStep {
  name: string;
  cmd: string;
  exitCode: number | null;
  durationMs?: number;
  stdout?: string;
  stderr?: string;
}

export interface VerifyStage {
  status: StageStatus;
  durationMs?: number;
  steps: VerifyStep[];
  finalExitCode?: number | null;
  error?: StageError;
}

export interface RunRound {
  round: number;
  status: StageStatus;
  stopReason?:
    | "success"
    | "retrieve_failed"
    | "edit_failed"
    | "apply_failed"
    | "verify_failed"
    | "infra_failed";
  stages: {
    retrieve: RetrieveStage;
    edit: EditStage;
    apply: ApplyStage;
    verify: VerifyStage;
  };
}

export interface RunMetrics {
  totalDurationMs?: number;
  tokenIn?: number;
  tokenOut?: number;
}

export interface RunTask {
  cmd: string;
  repo: string;
  issue: string;
}

export interface RunArtifacts {
  runFilePath?: string;
}

export interface RunRecord {
  runId: string;
  startedAt: string;
  finishedAt?: string;
  task: RunTask;
  rounds: RunRound[];
  metrics: RunMetrics;
  finalStatus: FinalStatus;
  failureType?: FailureType;
  artifacts?: RunArtifacts;
}
