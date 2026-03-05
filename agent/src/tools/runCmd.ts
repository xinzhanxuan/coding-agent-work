import { execa } from "execa";

export async function runCmd(cmd: string, cwd: string) {
  const p = execa(cmd, {
    cwd,
    shell: true,
    reject: false,
    env: {
      ...process.env,
      NO_COLOR: "1",
      FORCE_COLOR: "0",
    },
  });
  const { stdout, stderr, exitCode } = await p;
  return { cmd, cwd, stdout, stderr, exitCode };
}
