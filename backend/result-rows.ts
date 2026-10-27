// postgres-js returns an array; PGlite returns { rows, fields, ... }.
export function resultRows<T>(result: unknown): T[] {
  if (Array.isArray(result)) return result as T[];
  if (
    result &&
    typeof result === 'object' &&
    'rows' in result &&
    Array.isArray(result.rows)
  )
    return result.rows as T[];
  throw new Error('Unknown database result shape.');
}
