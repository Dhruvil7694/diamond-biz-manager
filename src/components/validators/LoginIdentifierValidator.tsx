import { validateEmail } from "@/components/validators/EmailValidator";
import { validateUsername } from "@/components/validators/UsernameValidator";

/**
 * Login field accepts either an email address or a username (mutually exclusive rules).
 */
export function validateLoginIdentifier(value: string): string | undefined {
  const t = value.trim();
  if (!t) return "Email or username is required";
  if (t.includes("@")) return validateEmail(t);
  return validateUsername(t);
}
