export function formatReturnNumber(num: number | string): string {
  const numString = String(num);
  return `RET-${numString.padStart(6, '0')}`;
}