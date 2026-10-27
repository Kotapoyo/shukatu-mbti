export function isDemoEmail(email: unknown): boolean {
  return typeof email === "string" && /^[^@\s]+@example\.com$/i.test(email);
}
