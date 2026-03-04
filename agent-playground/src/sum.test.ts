import { describe, it, expect } from "vitest";
import { sum } from "./sum";

describe("sum", () => {
  it("should sum all numbers", () => {
    expect(sum([1, 2, 3])).toBe(6);
  });
});
