import { execa } from "execa";

export interface RunCmdOptions {
  timeoutMs?: number;
}

export interface CommandResult {
  cmd: string;
  cwd: string;
  exitCode: number | null;
  stdout: string;
  stderr: string;
  durationMs: number;
  timedOut: boolean;
  errorType?: "timeout" | "spawn_error";
}

export async function runCommand(
  cmd: string,
  cwd: string,
  options: RunCmdOptions = {},
): Promise<CommandResult> {
  const { timeoutMs = 120_000 } = options;
  const startedAt = Date.now();

  try {
    const p = execa(cmd, {
      cwd,
      shell: true,
      // Keep non-zero exits as data so callers can handle failure via exitCode.
      reject: false,
      timeout: timeoutMs,
      env: {
        ...process.env,
        // Reduce ANSI/control noise so logs are machine-readable in JSON artifacts.
        NO_COLOR: "1",
        FORCE_COLOR: "0",
        TERM: "dumb",
        CI: "1",
      },
    });
    const res = await p;

    // Normalize line endings and trim trailing whitespace for stable snapshots/log diffs.
    const clean = (s: string) => s.replace(/\r\n/g, "\n").trimEnd();

    return {
      cmd,
      cwd,
      exitCode: res.exitCode ?? null,
      stdout: clean(res.stdout),
      stderr: clean(res.stderr),
      durationMs: Date.now() - startedAt,
      timedOut: Boolean((res as { timedOut?: boolean }).timedOut),
      errorType: (res as { timedOut?: boolean }).timedOut ? "timeout" : undefined,
    };
  } catch (error) {
    return {
      cmd,
      cwd,
      exitCode: null,
      stdout: "",
      stderr: error instanceof Error ? error.message : String(error),
      durationMs: Date.now() - startedAt,
      timedOut: false,
      errorType: "spawn_error",
    };
  }
}
