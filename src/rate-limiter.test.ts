import { describe, expect, it } from "vitest";
import { RateLimiter } from "./rate-limiter.js";

describe("RateLimiter", () => {
  it("allows requests under the limit", () => {
    const limiter = new RateLimiter(3, 1000);
    expect(limiter.tryAcquire(0)).toBe(true);
    expect(limiter.tryAcquire(0)).toBe(true);
  });

  it("frees capacity once the window rolls forward", () => {
    const limiter = new RateLimiter(2, 1000);
    limiter.tryAcquire(0);
    limiter.tryAcquire(0);
    expect(limiter.tryAcquire(1500)).toBe(true);
  });

  it("rejects exactly the limit+1th request in a window", () => {
    const limiter = new RateLimiter(3, 1000);
    expect(limiter.tryAcquire(0)).toBe(true);
    expect(limiter.tryAcquire(0)).toBe(true);
    expect(limiter.tryAcquire(0)).toBe(true);
    expect(limiter.tryAcquire(0)).toBe(false);
  });
});
