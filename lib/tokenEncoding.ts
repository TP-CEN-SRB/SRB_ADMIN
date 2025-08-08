// utils/tokenEncoding.ts

export function encodeBase64UrlSafe(input: string): string {
  return Buffer.from(input, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function decodeBase64UrlSafe(input: string): string {
  try {
    const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");
    return Buffer.from(padded, "base64").toString("utf8");
  } catch (err) {
    console.error("[decodeBase64UrlSafe] Failed to decode:", err);
    return "";
  }
}
