import "server-only";
import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes } from "crypto";

const IP_RETENTION_DAYS = 30;

function secret() {
  return process.env.ANALYTICS_VISITOR_SECRET || process.env.AUTH_SECRET || "cowin-analytics-development-only";
}

export function hashValue(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

function encryptionKey() {
  const configured = process.env.ANALYTICS_IP_ENCRYPTION_KEY;
  if (configured && /^[a-f0-9]{64}$/i.test(configured)) return Buffer.from(configured, "hex");
  const authSecret = process.env.AUTH_SECRET;
  return authSecret ? createHash("sha256").update(`cowin-traffic-ip:${authSecret}`).digest() : undefined;
}

export function maskIp(ip: string | undefined) {
  if (!ip) return undefined;
  if (ip.includes(".")) {
    const parts = ip.split(".");
    return parts.length === 4 ? `${parts[0]}.${parts[1]}.${parts[2]}.*` : undefined;
  }
  const parts = ip.split(":").filter(Boolean);
  return parts.length ? `${parts.slice(0, 3).join(":")}::` : undefined;
}

export function encryptIp(ip: string | undefined) {
  const key = encryptionKey();
  if (!ip || !key) return undefined;
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(ip, "utf8"), cipher.final()]);
  return `${iv.toString("base64url")}.${cipher.getAuthTag().toString("base64url")}.${encrypted.toString("base64url")}`;
}

export function decryptIp(value: string | null | undefined) {
  const key = encryptionKey();
  if (!value || !key) return undefined;
  const [ivValue, tagValue, encryptedValue] = value.split(".");
  if (!ivValue || !tagValue || !encryptedValue) return undefined;
  try {
    const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivValue, "base64url"));
    decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
    return Buffer.concat([decipher.update(Buffer.from(encryptedValue, "base64url")), decipher.final()]).toString("utf8");
  } catch {
    return undefined;
  }
}

export function ipExpiryDate(now = new Date()) {
  const expires = new Date(now);
  expires.setDate(expires.getDate() + IP_RETENTION_DAYS);
  return expires;
}

export const rawIpRetentionDays = IP_RETENTION_DAYS;
