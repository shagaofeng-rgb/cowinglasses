import type { LogisticsProvider, NotificationProvider, PaymentProvider, ProviderResult, StorageProvider } from "@/lib/admin/providers/types";

function unavailable<T>(message: string): ProviderResult<T> {
  return { success: false, error: message, requestId: crypto.randomUUID() };
}

export const unconfiguredPaymentProvider: PaymentProvider = {
  code: "unconfigured",
  isConfigured: () => false,
  createPayment: async () => unavailable("支付服务尚未配置。请在 Vercel Environment Variables 中填写服务商凭据。"),
  verifyWebhook: async () => unavailable("支付 Webhook 尚未配置。"),
  refund: async () => unavailable("退款服务尚未配置。"),
};

export const unconfiguredLogisticsProvider: LogisticsProvider = {
  code: "unconfigured",
  isConfigured: () => false,
  createShipment: async () => unavailable("物流服务尚未配置。"),
  track: async () => unavailable("物流追踪服务尚未配置。"),
};

export const unconfiguredStorageProvider: StorageProvider = {
  code: "unconfigured",
  isConfigured: () => false,
  createUpload: async () => unavailable("对象存储尚未配置。"),
};

export const unconfiguredNotificationProvider: NotificationProvider = {
  code: "unconfigured",
  isConfigured: () => false,
  send: async () => unavailable("通知服务尚未配置。"),
};
