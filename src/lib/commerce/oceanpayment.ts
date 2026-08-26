import "server-only";
import { createHash, timingSafeEqual } from "crypto";

export type OceanpaymentEmbeddedPayload = {
  account: string;
  terminal: string;
  signValue: string;
  key: string;
  order_number: string;
  order_currency: "USD";
  order_amount: string;
  backUrl: string;
  noticeUrl: string;
  methods: "Credit Card";
  billing_lastName: string;
  billing_firstName: string;
  billing_email: string;
  billing_country: string;
  billing_state: string;
  billing_city: string;
  billing_address: string;
  billing_zip: string;
  billing_ip: string;
  productName: string;
  productNum: string;
  productSku: string;
  productPrice: string;
};

export type OceanpaymentEnvironment = "test" | "production";

export type OceanpaymentNotification = {
  response_type: string;
  account: string;
  terminal: string;
  signValue: string;
  order_number: string;
  order_currency: string;
  order_amount: string;
  order_notes: string;
  card_number: string;
  payment_id: string;
  payment_authType: string;
  payment_status: string;
  payment_details: string;
  payment_risk: string;
  methods: string;
  payment_country: string;
  payment_solutions: string;
};

const requiredEnvironment = [
  "OCEANPAYMENT_ACCOUNT",
  "OCEANPAYMENT_CARD_TERMINAL",
  "OCEANPAYMENT_CARD_SECURE_CODE",
  "OCEANPAYMENT_CARD_PUBLIC_KEY",
] as const;

function required(name: (typeof requiredEnvironment)[number]) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Oceanpayment configuration is missing ${name}.`);
  return value;
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex").toUpperCase();
}

export function isOceanpaymentConfigured() {
  return requiredEnvironment.every((name) => Boolean(process.env[name]?.trim()));
}

export function oceanpaymentEnvironment() {
  return process.env.OCEANPAYMENT_ENV === "production" ? "production" : "test";
}

export function oceanpaymentNoticeUrl() {
  return (process.env.OCEANPAYMENT_NOTICE_URL || "https://cowinglasses.com/api/webhooks/oceanpayment").trim();
}

export function signOceanpaymentEmbeddedOrder(input: Pick<OceanpaymentEmbeddedPayload, "order_number" | "order_currency" | "order_amount" | "billing_firstName" | "billing_lastName" | "billing_email">) {
  return sha256(
    required("OCEANPAYMENT_ACCOUNT") +
      required("OCEANPAYMENT_CARD_TERMINAL") +
      input.order_number +
      input.order_currency +
      input.order_amount +
      input.billing_firstName +
      input.billing_lastName +
      input.billing_email +
      required("OCEANPAYMENT_CARD_SECURE_CODE"),
  );
}

export function createOceanpaymentEmbeddedPayload(input: Omit<OceanpaymentEmbeddedPayload, "account" | "terminal" | "signValue" | "key" | "methods" | "noticeUrl">): OceanpaymentEmbeddedPayload {
  const signValue = signOceanpaymentEmbeddedOrder(input);
  return {
    ...input,
    account: required("OCEANPAYMENT_ACCOUNT"),
    terminal: required("OCEANPAYMENT_CARD_TERMINAL"),
    signValue,
    // Oceanpayment's embedded SDK requires this merchant-issued browser key.
    // The secure code remains server-only and is never included in this payload.
    key: required("OCEANPAYMENT_CARD_PUBLIC_KEY"),
    noticeUrl: oceanpaymentNoticeUrl(),
    methods: "Credit Card",
  };
}

function equalSignature(expected: string, supplied: string) {
  const expectedBuffer = Buffer.from(expected, "hex");
  const suppliedBuffer = Buffer.from(supplied, "hex");
  return expectedBuffer.length === suppliedBuffer.length && timingSafeEqual(expectedBuffer, suppliedBuffer);
}

export function verifyOceanpaymentNotification(notification: OceanpaymentNotification) {
  if (!isOceanpaymentConfigured()) return false;
  if (notification.account !== required("OCEANPAYMENT_ACCOUNT") || notification.terminal !== required("OCEANPAYMENT_CARD_TERMINAL")) return false;
  const expected = sha256(
    notification.account +
      notification.terminal +
      notification.order_number +
      notification.order_currency +
      notification.order_amount +
      notification.order_notes +
      notification.card_number +
      notification.payment_id +
      notification.payment_authType +
      notification.payment_status +
      notification.payment_details +
      notification.payment_risk +
      required("OCEANPAYMENT_CARD_SECURE_CODE"),
  );
  return /^[a-f0-9]{64}$/i.test(notification.signValue) && equalSignature(expected, notification.signValue);
}

const xmlFields = [
  "response_type", "account", "terminal", "signValue", "order_number", "order_currency", "order_amount", "order_notes", "card_number", "payment_id", "payment_authType", "payment_status", "payment_details", "payment_risk", "methods", "payment_country", "payment_solutions",
] as const;

function decodeXml(value: string) {
  return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").trim();
}

/** Parses Oceanpayment's documented flat XML notification without evaluating XML entities. */
export function parseOceanpaymentNotification(raw: string): OceanpaymentNotification | null {
  if (/<!DOCTYPE|<!ENTITY/i.test(raw)) return null;
  const result: Record<string, string> = {};
  for (const field of xmlFields) {
    const escaped = field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = raw.match(new RegExp(`<${escaped}[^>]*>([\\s\\S]*?)</${escaped}>`, "i"));
    result[field] = match ? decodeXml(match[1]) : "";
  }
  if (!result.account || !result.terminal || !result.order_number || !result.payment_id || !result.signValue) return null;
  return result as OceanpaymentNotification;
}

export function redactOceanpaymentNotification(notification: OceanpaymentNotification) {
  const { card_number, ...rest } = notification;
  return { ...rest, cardLast4: card_number.slice(-4), cardMasked: card_number ? "present" : "" };
}
