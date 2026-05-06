/**
 * Safely parse and validate datetime strings for form submission.
 * Prevents invalid dates from being sent to the API.
 */
export function safeParseDate(dateString: string): string | null {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return date.toISOString();
  } catch {
    return null;
  }
}

/**
 * Validate that a date string is valid and not empty.
 */
export function isValidDateString(dateString: string | undefined): boolean {
  if (!dateString) return false;
  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
}

/**
 * Validate that end date is after start date.
 */
export function isEndDateAfterStartDate(
  startDate: string,
  endDate: string
): boolean {
  try {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    return end > start;
  } catch {
    return false;
  }
}
