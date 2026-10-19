// Synthetic fixture: the HTTP handlers in front of the queue.
export function submitJob(queue, request) {
  const id = crypto.randomUUID();
  queue.enqueue({ id, type: request.type, payload: request.payload });
  return { status: 202, body: { id } };
}

export function jobStatus(store, id) {
  const result = store.get(id);
  return result
    ? { status: 200, body: result }
    : { status: 404, body: { status: "pending" } };
}
