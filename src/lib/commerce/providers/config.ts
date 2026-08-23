import "server-only";

type IntegrationStatus = { provider: string; configured: boolean; missing: string[]; webhookPath: string };

function status(provider: string, required: string[], webhookPath: string): IntegrationStatus {
  return { provider, configured: required.every((key) => Boolean(process.env[key])), missing: required.filter((key) => !process.env[key]), webhookPath };
}

export function getPaymentIntegrationStatus(): IntegrationStatus {
  const provider = process.env.PAYMENT_PROVIDER?.trim().toLowerCase() || "unconfigured";
  if (provider === "oceanpayment") return status(provider, ["OCEANPAYMENT_ACCOUNT", "OCEANPAYMENT_CARD_TERMINAL", "OCEANPAYMENT_CARD_SECURE_CODE", "PAYMENT_WEBHOOK_SECRET"], "/api/webhooks/oceanpayment");
  if (provider === "qianhai") return status(provider, ["QIANHAI_MERCHANT_ID", "QIANHAI_GATEWAY_URL", "QIANHAI_SECRET_KEY", "QIANHAI_WEBHOOK_SECRET"], "/api/webhooks/qianhai");
  return { provider, configured: false, missing: ["PAYMENT_PROVIDER", "服务商专属凭据"], webhookPath: "/api/webhooks/{provider}" };
}

export function getLogisticsIntegrationStatus(): IntegrationStatus {
  const provider = process.env.LOGISTICS_PROVIDER?.trim().toLowerCase() || "unconfigured";
  return provider === "unconfigured"
    ? { provider, configured: false, missing: ["LOGISTICS_PROVIDER", "LOGISTICS_API_URL", "LOGISTICS_API_TOKEN", "LOGISTICS_WEBHOOK_SECRET"], webhookPath: "/api/webhooks/{provider}" }
    : status(provider, ["LOGISTICS_API_URL", "LOGISTICS_API_TOKEN", "LOGISTICS_WEBHOOK_SECRET"], `/api/webhooks/${provider}`);
}

export function getNotificationIntegrationStatus(): IntegrationStatus {
  const emailProvider = process.env.EMAIL_PROVIDER?.trim().toLowerCase() || "unconfigured";
  const smsProvider = process.env.SMS_PROVIDER?.trim().toLowerCase() || "unconfigured";
  return { provider: `${emailProvider} / ${smsProvider}`, configured: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS), missing: ["SMTP_HOST", "SMTP_USER", "SMTP_PASS", "SMTP_FROM"].filter((key) => !process.env[key]), webhookPath: "不适用" };
}

export function webhookSecretFor(provider: string) {
  const name = provider.toLowerCase();
  if (name === "oceanpayment") return process.env.PAYMENT_WEBHOOK_SECRET;
  if (name === "qianhai") return process.env.QIANHAI_WEBHOOK_SECRET;
  if (name === process.env.LOGISTICS_PROVIDER?.toLowerCase()) return process.env.LOGISTICS_WEBHOOK_SECRET;
  return undefined;
}
