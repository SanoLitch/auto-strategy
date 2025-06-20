export function hasMessage(obj: unknown): obj is { message: string } {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'message' in obj &&
    typeof (obj as { message?: unknown }).message === 'string'
  );
}

export function hasStack(obj: unknown): obj is { stack: string } {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'stack' in obj &&
    typeof (obj as { stack?: unknown }).stack === 'string'
  );
}
