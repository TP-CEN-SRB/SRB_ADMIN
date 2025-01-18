import { randomBytes } from "crypto";
export const generateApiKey = () => {
  const buffer = randomBytes(32); // Generate 32 random bytes
  return buffer.toString("base64");
};
