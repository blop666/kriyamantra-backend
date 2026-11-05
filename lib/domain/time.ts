const DEFAULT_TIMEZONE = "Asia/Makassar";

export function isValidTimeZone(value: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
}

function parts(date: Date, timeZone: string) {
  const values = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  return Object.fromEntries(values.filter(({ type }) => type !== "literal").map(({ type, value }) => [type, Number(value)])) as Record<string, number>;
}

function offsetMinutes(date: Date, timeZone: string) {
  const value = parts(date, timeZone);
  return (Date.UTC(value.year, value.month - 1, value.day, value.hour, value.minute, value.second) - date.getTime()) / 60_000;
}

function fromLocal(local: Date, timeZone: string) {
  let result = new Date(local.getTime() - offsetMinutes(local, timeZone) * 60_000);
  result = new Date(local.getTime() - offsetMinutes(result, timeZone) * 60_000);
  return result;
}

export function weeklyPeriod(now = new Date(), timeZone = DEFAULT_TIMEZONE) {
  if (!isValidTimeZone(timeZone)) throw new Error("Invalid business timezone");
  const local = parts(now, timeZone);
  const localDay = new Date(Date.UTC(local.year, local.month - 1, local.day));
  const mondayOffset = (localDay.getUTCDay() + 6) % 7;
  localDay.setUTCDate(localDay.getUTCDate() - mondayOffset);
  const startLocal = new Date(Date.UTC(localDay.getUTCFullYear(), localDay.getUTCMonth(), localDay.getUTCDate(), 0, 0, 0, 0));
  const endLocal = new Date(startLocal.getTime() + 7 * 24 * 60 * 60_000 - 1);
  return { start: fromLocal(startLocal, timeZone), end: fromLocal(endLocal, timeZone), timeZone };
}

export function nextWeeklyPeriod(now = new Date(), timeZone = DEFAULT_TIMEZONE) {
  const current = weeklyPeriod(now, timeZone);
  const nextStart = new Date(current.end.getTime() + 1);
  return weeklyPeriod(nextStart, timeZone);
}
