import { execa } from "execa";

export async function runCmd(cmd: string, cwd: string) {
  const p = execa(cmd, {
    cwd,
    shell: true,
    // Keep non-zero exits as data so callers can handle failure via exitCode.
    reject: false,
    env: {
      ...process.env,
      // Reduce ANSI/control noise so logs are machine-readable in JSON artifacts.
      NO_COLOR: "1",
      FORCE_COLOR: "0",
      TERM: "dumb",
      CI: "1",
    },
  });
  const { stdout, stderr, exitCode } = await p;

  // Normalize line endings and trim trailing whitespace for stable snapshots/log diffs.
  const clean = (s: string) => s.replace(/\r\n/g, "\n").trimEnd();

  return {
    cmd,
    cwd,
    exitCode,
    stdout: clean(stdout),
    stderr: clean(stderr),
  };
}
