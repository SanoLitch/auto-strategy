export function safeSerialize(obj: unknown, depth = 5, seen = new WeakSet()): unknown {
  if (obj === null || typeof obj !== 'object') return obj;

  if (seen.has(obj)) return '[Circular]';

  if (depth === 0) return '[MaxDepth]';

  seen.add(obj);

  // для абстрактных историй лучше использовать unknown, и уже локально чет добавлять по элиасам, либо с джененриками поиграться
  if (Array.isArray(obj)) {
    return obj.map(item => safeSerialize(item, depth - 1, seen));
  }
  const result: Record<string, unknown> = {};

  for (const key of Object.keys(obj)) {
    result[key] = safeSerialize(obj[key], depth - 1, seen);
  }
  seen.delete(obj);

  return result;
}