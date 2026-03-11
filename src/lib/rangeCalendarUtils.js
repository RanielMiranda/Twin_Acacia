export function startOfMonth(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

export function addMonths(date, count) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + count, 1));
}

export function isSameDay(a, b) {
  if (!a || !b) return false;
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

export function isBetween(date, start, end) {
  if (!start || !end) return false;
  return date > start && date < end;
}

export function getUtcToday() {
  const today = new Date();
  return new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
}

export function buildMonthDays(monthDate) {
  const start = startOfMonth(monthDate);
  const month = start.getUTCMonth();
  const year = start.getUTCFullYear();
  const days = [];
  const firstDay = start.getUTCDay();

  for (let i = 0; i < firstDay; i += 1) days.push(null);

  const cursor = new Date(Date.UTC(year, month, 1));
  while (cursor.getUTCMonth() === month) {
    days.push(new Date(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return { start, month, year, days };
}

export function getNextRange({ date, startDate, endDate, activeDropdown }) {
  if (!date) return { start: startDate, end: endDate };

  const isStart = isSameDay(date, startDate);
  const isEnd = isSameDay(date, endDate);

  if (isStart && isEnd) {
    return { start: null, end: null };
  }

  if (isStart) {
    if (endDate) {
      return { start: endDate, end: null };
    }
    return { start: null, end: null };
  }

  if (isEnd) {
    return { start: startDate, end: null };
  }

  if (!startDate || (startDate && endDate)) {
    return { start: date, end: null };
  }

  if (activeDropdown === "end" && date < startDate) {
    return { start: date, end: startDate };
  }

  return { start: startDate, end: date };
}
