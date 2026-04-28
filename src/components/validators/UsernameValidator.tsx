/**
 * Username validation when signing in or registering with a username (no @).
 */
const USERNAME_PATTERN = /^[a-zA-Z0-9._-]+$/;

export function validateUsername(value: string): string | undefined {
  const t = value.trim();
  if (!t) return "Username is required";
  if (t.length < 3) return "Username must be at least 3 characters";
  if (t.length > 64) return "Username must be at most 64 characters";
  if (!USERNAME_PATTERN.test(t)) {
    return "Username can only use letters, numbers, dots, hyphens, and underscores";
  }
  return undefined;
}
