// Synthetic fixture: keeps the last result of every job.
export class ResultStore {
  #results = new Map();

  save(jobId, result) {
    this.#results.set(jobId, result);
  }

  get(jobId) {
    return this.#results.get(jobId);
  }
}
