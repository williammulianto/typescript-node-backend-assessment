export function validateDateRange(start?: string | Date, end?: string | Date) {
  if (!start || !end) return;

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return false;
  }

  if (endDate < startDate) {
    return false;
  }
}
