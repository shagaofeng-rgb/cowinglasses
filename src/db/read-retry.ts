/** Retry only read operations after a transient connection failure. Never wrap writes. */
export async function retryDatabaseRead<T>(read: () => Promise<T>): Promise<T> {
  try { return await read(); } catch (error) {
    const failure = error as { code?: string; cause?: { code?: string; message?: string }; message?: string };
    const code = failure.cause?.code ?? failure.code;
    const message = failure.cause?.message ?? failure.message ?? "";
    if (!["CONNECT_TIMEOUT", "CONNECTION_CLOSED", "ECONNRESET", "ETIMEDOUT"].includes(code ?? "") && !(code === "08P01" && /timed out/i.test(message))) throw error;
    await new Promise(resolve => setTimeout(resolve, 250));
    return read();
  }
}
