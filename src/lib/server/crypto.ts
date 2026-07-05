import crypto from "crypto";

export function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("base64url");
}

export function hashToken(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function encryptionKey() {
  const source = process.env.ENCRYPTION_KEY || process.env.AUTH_SECRET;
  if (!source) throw new Error("ENCRYPTION_KEY or AUTH_SECRET is not configured");
  return crypto.createHash("sha256").update(source).digest();
}

export function encryptSecret(plainText: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, encrypted].map((part) => part.toString("base64url")).join(".");
}

export function decryptSecret(payload: string) {
  const [ivEncoded, tagEncoded, encryptedEncoded] = payload.split(".");
  if (!ivEncoded || !tagEncoded || !encryptedEncoded) throw new Error("Invalid encrypted secret");
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    encryptionKey(),
    Buffer.from(ivEncoded, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tagEncoded, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedEncoded, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}
