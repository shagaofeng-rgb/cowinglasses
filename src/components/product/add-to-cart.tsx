"use client";

import { Check, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import type { Product } from "@/types/product";
import type { Locale } from "@/lib/i18n";
import { messages } from "@/messages";
import { useCart } from "@/providers/cart-provider";
import { trackStorefrontEvent } from "@/components/analytics/storefront-tracker";

export function AddToCart({ product, skuId, locale, quantity = 1 }: {
  product: Product;
  skuId: string;
  locale: Locale;
  quantity?: number;
}) {
  const { add, lines, hydrated } = useCart();
  const [added, setAdded] = useState(false);
  const t = messages[locale].common;
  const sku = product.colors.find((color) => (color.skuId ?? color.id) === skuId);
  const inCart = lines.find((line) => line.productId === product.id && line.skuId === skuId)?.quantity ?? 0;
  const canAdd = hydrated && sku?.available && inCart + quantity <= Math.min(sku.availableQuantity ?? 0, 100);

  useEffect(() => {
    if (!added) return;
    const timeout = window.setTimeout(() => setAdded(false), 1800);
    return () => window.clearTimeout(timeout);
  }, [added]);

  return <button type="button" className="button-primary disabled:opacity-60" disabled={!canAdd} onClick={() => {
    add({ productId: product.id, skuId, quantity });
    trackStorefrontEvent("add_to_cart", { productId: product.id, skuId });
    setAdded(true);
  }}>
    <span aria-live="polite">{added ? t.added : t.addToCart}</span>
    {added ? <Check size={18} aria-hidden="true" /> : <ShoppingBag size={18} aria-hidden="true" />}
  </button>;
}
