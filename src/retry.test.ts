import { describe, expect, it, vi } from "vitest";
import { withRetry } from "./retry.js";

describe("withRetry", () => {
  it("returns the value on first success", async () => {
    const fn = vi.fn().mockResolvedValue("ok");
    await expect(withRetry(fn, { maxAttempts: 3, baseDelayMs: 0 })).resolves.toBe("ok");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("calls fn exactly maxAttempts times before giving up", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("boom"));
    await expect(
      withRetry(fn, { maxAttempts: 3, baseDelayMs: 0 }),
    ).rejects.toThrow("boom");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("throws the final error instead of resolving undefined", async () => {
    const last = new Error("last failure");
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("first"))
      .mockRejectedValueOnce(last);
    await expect(
      withRetry(fn, { maxAttempts: 2, baseDelayMs: 0 }),
    ).rejects.toBe(last);
  });

  it("recovers when a later attempt succeeds", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("transient"))
      .mockResolvedValue("recovered");
    await expect(
      withRetry(fn, { maxAttempts: 3, baseDelayMs: 0 }),
    ).resolves.toBe("recovered");
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
