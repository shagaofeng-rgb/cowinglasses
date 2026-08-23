export type ProviderResult<T> = { success: true; data: T; requestId: string } | { success: false; error: string; requestId: string };

export type PaymentIntentInput = { orderId: string; orderNumber: string; amount: string; currency: string; returnUrl: string; notifyUrl: string };
export type PaymentWebhookInput = { headers: Headers; rawBody: string };
export type PaymentWebhookResult = { externalEventId: string; transactionNumber: string; status: "paid" | "failed" | "cancelled" | "refunded"; amount: string; currency: string; rawPayload: Record<string, unknown> };

export interface PaymentProvider {
  readonly code: string;
  isConfigured(): boolean;
  createPayment(input: PaymentIntentInput): Promise<ProviderResult<{ redirectUrl: string; providerReference: string }>>;
  verifyWebhook(input: PaymentWebhookInput): Promise<ProviderResult<PaymentWebhookResult>>;
  refund(input: { transactionNumber: string; amount: string; reason?: string }): Promise<ProviderResult<{ providerReference: string }>>;
}

export interface LogisticsProvider {
  readonly code: string;
  isConfigured(): boolean;
  createShipment(input: { orderNumber: string; recipient: Record<string, string>; items: Array<{ sku: string; quantity: number }> }): Promise<ProviderResult<{ trackingNumber: string; labelUrl?: string }>>;
  track(input: { trackingNumber: string }): Promise<ProviderResult<{ status: string; events: Array<{ occurredAt: string; description: string }> }>>;
}

export interface StorageProvider {
  readonly code: string;
  isConfigured(): boolean;
  createUpload(input: { filename: string; contentType: string; sizeBytes: number }): Promise<ProviderResult<{ uploadUrl: string; objectKey: string; publicUrl?: string }>>;
}

export interface NotificationProvider {
  readonly code: string;
  isConfigured(): boolean;
  send(input: { event: "order_created" | "payment_succeeded" | "shipment_created" | "refund_completed" | "aftersales_changed" | "abandoned_cart"; recipient: string; payload: Record<string, unknown> }): Promise<ProviderResult<{ messageId: string }>>;
}
