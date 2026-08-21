export const supportedPaymentBrands = ["Visa", "Mastercard", "American Express", "Discover", "JCB"] as const;

export type PaymentGatewayReadiness = {
  provider: "oceanpayment";
  currency: "USD";
  environment: "test" | "production";
  configured: boolean;
  requiredEnvironment: readonly string[];
};

/**
 * Server-side configuration boundary for the payment provider.
 * Never return credentials, merchant numbers, secret codes or public keys to client components.
 */
export function paymentGatewayReadiness(): PaymentGatewayReadiness {
  const requiredEnvironment = [
    "OCEANPAYMENT_ACCOUNT",
    "OCEANPAYMENT_CARD_TERMINAL",
    "OCEANPAYMENT_CARD_SECURE_CODE",
    "OCEANPAYMENT_CARD_PUBLIC_KEY",
  ] as const;
  const configured = requiredEnvironment.every((name) => Boolean(process.env[name]?.trim()));

  return {
    provider: "oceanpayment",
    currency: "USD",
    environment: process.env.OCEANPAYMENT_ENV === "production" ? "production" : "test",
    configured,
    requiredEnvironment,
  };
}
