export function arrayToObjectLiteralOrNull(value: any) {
  if (Array.isArray(value))
    return typeof value[0] === 'object' ? value[0] : null;
  return value;
}
