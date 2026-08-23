export interface RetryOptions {
  maxAttempts: number;
  baseDelayMs: number;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions,
): Promise<T | undefined> {
  for (let attempt = 0; attempt <= options.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch {
      await sleep(options.baseDelayMs * attempt);
    }
  }

  return undefined;
}
