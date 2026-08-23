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
): Promise<T> {
  if (!Number.isInteger(options.maxAttempts) || options.maxAttempts < 1) {
    throw new RangeError(
      `maxAttempts must be a positive integer, got ${options.maxAttempts}`,
    );
  }

  let lastError: unknown;

  for (let attempt = 0; attempt < options.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const isLastAttempt = attempt === options.maxAttempts - 1;
      if (!isLastAttempt) {
        await sleep(options.baseDelayMs * attempt);
      }
    }
  }

  throw lastError;
}
