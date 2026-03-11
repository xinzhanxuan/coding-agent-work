export function extractFilePathsFromTestOutput(stderr: string) {
  const paths = new Set<string>();
  const re = /([a-zA-Z0-9_\-./]+\.(ts|tsx|js|jsx)):\d+:\d+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(stderr))) paths.add(m[1]);
  return Array.from(paths);
}
