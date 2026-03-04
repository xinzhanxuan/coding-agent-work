export function sum(arr: number[]) {
  // BUG: off-by-one (故意写错)
  let s = 0;
  for (let i = 0; i < arr.length - 1; i++) {
    s += arr[i];
  }
  return s;
}
