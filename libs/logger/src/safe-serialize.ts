export function safeSerialize(obj: any, depth = 5, seen = new WeakSet()): any {
  if (obj === null || typeof obj !== 'object') return obj;

  if (seen.has(obj)) return '[Circular]';

  if (depth === 0) return '[MaxDepth]';

  seen.add(obj);

  if (Array.isArray(obj)) {
    return obj.map(item => safeSerialize(item, depth - 1, seen));
  }
  const result: Record<string, any> = {};

  for (const key of Object.keys(obj)) {
    result[key] = safeSerialize(obj[key], depth - 1, seen);
  }
  seen.delete(obj);

  return result;
}
