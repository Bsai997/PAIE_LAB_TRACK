export function getCurrentWeek() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now - start;
  const oneWeek = 604800000;
  const weekNumber = Math.ceil((diff + start.getDay() * 86400000) / oneWeek);
  return { weekNumber, year: now.getFullYear() };
}
