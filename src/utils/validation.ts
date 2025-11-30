export function validateDateRange(start?: string | Date, end?: string | Date) {
  if (!start || !end) return;

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (endDate < startDate) {
    return false;
  }
}
