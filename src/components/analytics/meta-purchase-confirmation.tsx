"use client";

import { useEffect, useState } from "react";
import { trackMetaPixel } from "./meta-pixel";

type PurchaseData = {
  status: "pending" | "paid" | "failed";
  orderNumber: string;
  value?: number;
  currency?: string;
  contents?: Array<{ id: string; quantity: number; item_price: number }>;
};

export function MetaPurchaseConfirmation({ orderNumber }: { orderNumber: string }) {
  const [status, setStatus] = useState<PurchaseData["status"]>("pending");

  useEffect(() => {
    let active = true;
    let attempts = 0;
    let retry: ReturnType<typeof setTimeout> | undefined;

    const check = async () => {
      try {
        const response = await fetch(
          `/api/storefront/orders/${encodeURIComponent(orderNumber)}/purchase`,
          { credentials: "same-origin", cache: "no-store" },
        );
        const result = (await response.json()) as {
          success?: boolean;
          data?: PurchaseData;
        };
        const data = result.data;
        if (!active || !response.ok || !data) return;
        setStatus(data.status);
        if (
          data.status === "paid" &&
          typeof data.value === "number" &&
          data.currency &&
          data.contents
        ) {
          trackMetaPixel(
            "Purchase",
            {
              value: data.value,
              currency: data.currency,
              contents: data.contents,
              content_ids: data.contents.map((item) => item.id),
              content_type: "product",
            },
            `purchase:${data.orderNumber}`,
          );
          return;
        }
        if (data.status === "pending" && attempts < 12) {
          attempts += 1;
          retry = setTimeout(check, 5_000);
        }
      } catch {
        if (active && attempts < 12) {
          attempts += 1;
          retry = setTimeout(check, 5_000);
        }
      }
    };

    void check();
    return () => {
      active = false;
      if (retry) clearTimeout(retry);
    };
  }, [orderNumber]);

  if (status !== "paid") return null;
  return <p role="status">Payment confirmed. Thank you for your order.</p>;
}
