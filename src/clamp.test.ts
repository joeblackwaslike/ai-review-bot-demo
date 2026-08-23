import { describe, expect, it } from "vitest";
import { clamp } from "./clamp.js";

describe("clamp", () => {
  it("returns the value when it is inside the range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it("returns min when the value is below the range", () => {
    expect(clamp(-3, 0, 10)).toBe(0);
  });

  it("returns max when the value is above the range", () => {
    expect(clamp(42, 0, 10)).toBe(10);
  });

  it("returns the bounds when the value sits on them", () => {
    expect(clamp(0, 0, 10)).toBe(0);
    expect(clamp(10, 0, 10)).toBe(10);
  });

  it("clamps against negative ranges", () => {
    expect(clamp(-1, -10, -5)).toBe(-5);
    expect(clamp(-20, -10, -5)).toBe(-10);
  });
});
