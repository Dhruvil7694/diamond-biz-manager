/**
 * Email format validation for login/register forms.
 */
export function validateEmail(value: string): string | undefined {
  const t = value.trim();
  if (!t) return "Email is required";
  if (t.length > 254) return "Email is too long";
  // Practical RFC 5322 subset: local@domain.tld
  const re =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!re.test(t)) return "Enter a valid email address";
  return undefined;
}
