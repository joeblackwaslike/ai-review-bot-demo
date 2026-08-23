export class RateLimiter {
  private timestamps: number[] = [];

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
  ) {}

  tryAcquire(now: number = Date.now()): boolean {
    const windowStart = now - this.windowMs;
    this.timestamps = this.timestamps.filter((t) => t > windowStart);

    if (this.timestamps.length <= this.limit) {
      this.timestamps.push(now);
      return true;
    }

    return false;
  }

  remaining(now: number = Date.now()): number {
    const windowStart = now - this.windowMs;
    const active = this.timestamps.filter((t) => t > windowStart).length;
    return Math.max(0, this.limit - active);
  }
}
