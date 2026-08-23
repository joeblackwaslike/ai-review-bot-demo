import { afterEach, describe, expect, it, vi } from "vitest";
import { withRetry } from "./retry.js";

afterEach(() => {
  vi.useRealTimers();
});

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

  it("rejects a non-positive maxAttempts instead of throwing undefined", async () => {
    const fn = vi.fn();
    await expect(withRetry(fn, { maxAttempts: 0, baseDelayMs: 0 })).rejects.toThrow(
      RangeError,
    );
    expect(fn).not.toHaveBeenCalled();
  });

  it("backs off baseDelayMs * attempt between retries and skips the final sleep", async () => {
    vi.useFakeTimers();
    const delays: number[] = [];
    const timeoutSpy = vi
      .spyOn(globalThis, "setTimeout")
      .mockImplementation(((cb: () => void, ms?: number) => {
        delays.push(ms ?? 0);
        cb();
        return 0 as unknown as ReturnType<typeof setTimeout>;
      }) as typeof setTimeout);

    const fn = vi.fn().mockRejectedValue(new Error("boom"));
    await expect(
      withRetry(fn, { maxAttempts: 4, baseDelayMs: 100 }),
    ).rejects.toThrow("boom");

    // 3 sleeps for 4 attempts: none after the last failure.
    expect(delays).toEqual([0, 100, 200]);
    expect(fn).toHaveBeenCalledTimes(4);
    timeoutSpy.mockRestore();
  });
});
