// Synthetic fixture for the illustrate-it evals: an in-memory job queue.
export class JobQueue {
  #jobs = [];

  enqueue(job) {
    this.#jobs.push({ ...job, attempts: 0 });
  }

  next() {
    return this.#jobs.shift();
  }

  retry(job) {
    this.#jobs.push({ ...job, attempts: job.attempts + 1 });
  }
}
