export function sortData<T>(data: T[], col: string, dir: 'asc' | 'desc'): T[] {
  if (!col) return data;
  return [...data].sort((a, b) => {
    const av = (a as any)[col] ?? '';
    const bv = (b as any)[col] ?? '';
    const cmp = String(av).toLowerCase() < String(bv).toLowerCase() ? -1 : String(av).toLowerCase() > String(bv).toLowerCase() ? 1 : 0;
    return dir === 'asc' ? cmp : -cmp;
  });
}
