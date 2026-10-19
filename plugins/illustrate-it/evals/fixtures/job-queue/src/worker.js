// Synthetic fixture: polls the queue, runs each job, retries failures.
export const MAX_ATTEMPTS = 3;
export const POLL_INTERVAL_MS = 500;

export function startWorker(queue, store, handlers) {
  return setInterval(async () => {
    const job = queue.next();
    if (!job) return;
    try {
      const result = await handlers[job.type](job.payload);
      store.save(job.id, { status: "done", result });
    } catch (error) {
      if (job.attempts + 1 < MAX_ATTEMPTS) queue.retry(job);
      else store.save(job.id, { status: "failed", error: error.message });
    }
  }, POLL_INTERVAL_MS);
}
