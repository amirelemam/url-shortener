import isURL from "validator/lib/isURL";

export function validateUrl(input: string): boolean {
  try {
    return isURL(input, { require_protocol: false });
  } catch {
    return false;
  }
}
