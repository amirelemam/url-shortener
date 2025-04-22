import * as crypto from "crypto";

/**
 * Generates a random slug of specified length
 */
export function generateSlug(length: number = 6): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(crypto.randomBytes(length))
    .map((byte) => characters[byte % characters.length])
    .join("");
}
