async function getCurrentYear(): Promise<number> {
  const currentYear = new Date().getFullYear();
  return currentYear;
}

function extractYearFromDate(dateString: string): number {
  const dateObject = new Date(dateString);
  const year = dateObject.getFullYear();
  return year;
}

function isSequentialOrRepeating(pin: string): boolean {
  const repeatingPattern = /(.)\1{2,}/;
  return repeatingPattern.test(pin);
}

export { getCurrentYear, extractYearFromDate, isSequentialOrRepeating };
