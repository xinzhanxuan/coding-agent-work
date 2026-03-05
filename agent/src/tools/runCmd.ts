import { execa } from "execa";

export async function runCmd(cmd: string, cwd: string) {
  const p = execa(cmd, {
    cwd,
    shell: true,
    reject: false,
    env: process.env,
  });
  const { stdout, stderr, exitCode } = await p;
  return { cmd, cwd, stdout, stderr, exitCode };
}
