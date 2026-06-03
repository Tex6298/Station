import type { ChatProvider, ChatProviderInput, ChatProviderResponse } from "@station/ai";

type QueuedJob<T> = {
  run: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: unknown) => void;
};

const MAX_CONCURRENCY = 20;
const MAX_RETRIES = 4;

let activeJobs = 0;
const queue: Array<QueuedJob<unknown>> = [];

export function enqueueLlmCall(provider: ChatProvider, input: ChatProviderInput) {
  return enqueue(() => retryRateLimited(() => provider.sendMessage(input)));
}

function enqueue<T>(run: () => Promise<T>) {
  return new Promise<T>((resolve, reject) => {
    queue.push({ run, resolve, reject } as QueuedJob<unknown>);
    drainQueue();
  });
}

function drainQueue() {
  while (activeJobs < MAX_CONCURRENCY && queue.length > 0) {
    const job = queue.shift()!;
    activeJobs += 1;
    job.run()
      .then(job.resolve)
      .catch(job.reject)
      .finally(() => {
        activeJobs -= 1;
        drainQueue();
      });
  }
}

async function retryRateLimited<T>(run: () => Promise<T>) {
  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      return await run();
    } catch (error) {
      lastError = error;
      if (!isRateLimitError(error) || attempt === MAX_RETRIES) break;
      await sleep(1000 * 2 ** attempt);
    }
  }
  throw lastError;
}

function isRateLimitError(error: unknown) {
  return error instanceof Error && /\b429\b|rate limit/i.test(error.message);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type { ChatProviderResponse };
