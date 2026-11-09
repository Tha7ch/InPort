export interface DrinkRange { min: number; max: number }
export interface DrinkProfile {
  beer?: DrinkRange;
  wine?: DrinkRange;
  cocktails?: DrinkRange;
  sourceUrl: string;
  checkedAt: string;
  coverage?: string;
}

/** Returns an error for invalid input; undefined and null mean no profile. */
export function validateDrinkProfile(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "object" || Array.isArray(value)) return "Drink prices must be an object.";
  const profile = value as Record<string, unknown>;
  let count = 0;
  for (const category of ["beer", "wine", "cocktails"]) {
    const range = profile[category];
    if (range === undefined) continue;
    count++;
    if (!range || typeof range !== "object" || Array.isArray(range)) return `${category}: enter both prices.`;
    const { min, max } = range as Record<string, unknown>;
    if (typeof min !== "number" || typeof max !== "number" || !Number.isFinite(min) || !Number.isFinite(max) || min <= 0 || max <= 0 || min > max) {
      return `${category}: prices must be positive numbers, with minimum no greater than maximum.`;
    }
  }
  if (!count) return "Enter at least one drink price range, or clear the profile.";
  try {
    if (typeof profile.sourceUrl !== "string" || profile.sourceUrl.length > 2000) throw new Error();
    const url = new URL(profile.sourceUrl);
    if (url.protocol !== "https:" || !url.hostname || url.username || url.password) throw new Error();
  } catch { return "Enter an HTTPS menu source URL without credentials."; }
  if (typeof profile.checkedAt !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(profile.checkedAt)) return "Enter the date the menu was checked.";
  const date = new Date(`${profile.checkedAt}T00:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== profile.checkedAt) return "Enter a valid menu check date.";
  if (profile.coverage !== undefined && (typeof profile.coverage !== "string" || profile.coverage.length > 1000)) return "Coverage notes must be 1,000 characters or fewer.";
  return null;
}

export function restaurantSaveError(error: unknown): string {
  if (error && typeof error === "object" && "code" in error && error.code === "42703") {
    return "Drink price storage is not installed yet. Apply the drink profile migration before saving prices.";
  }
  return "Could not save the restaurant. Please try again.";
}
