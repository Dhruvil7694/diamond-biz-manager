/** Minimum password length accepted on the login form (server may enforce more on register). */
export const LOGIN_PASSWORD_MIN_LENGTH = 5;
export const LOGIN_PASSWORD_MAX_LENGTH = 128;

export function validateLoginPassword(value: string): string | undefined {
  if (!value) return "Password is required";
  if (value.length < LOGIN_PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${LOGIN_PASSWORD_MIN_LENGTH} characters`;
  }
  if (value.length > LOGIN_PASSWORD_MAX_LENGTH) {
    return `Password must be at most ${LOGIN_PASSWORD_MAX_LENGTH} characters`;
  }
  return undefined;
}
