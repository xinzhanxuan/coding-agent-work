import { execa } from "execa";

export async function searchFilesWithRipgrep(query: string, cwd: string) {
  // --files-with-matches 只输出文件路径
  const { stdout } = await execa(
    `rg --files-with-matches ${JSON.stringify(query)} .`,
    {
      cwd,
      shell: true,
      reject: false,
    },
  );

  return stdout
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}
