export function handleLambdaError(error: unknown): never {
  if (error instanceof Error) {
    if (
      error.message.includes("[unauthorized]") ||
      error.message.includes("[bad-request]")
    ) {
      throw error;
    }
    throw new Error(`[internal-server-error]: ${error.message}`);
  }
  throw new Error(`[internal-server-error]: ${String(error)}`);
}
