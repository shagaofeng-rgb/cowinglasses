"use client";
import { ShoppingBag } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/types/product";
import type { Locale } from "@/lib/i18n";
import { messages } from "@/messages";
import { useCart } from "@/providers/cart-provider";
import { trackStorefrontEvent } from "@/components/analytics/storefront-tracker";

export function AddToCart({ product, skuId, locale, variant = "primary", className }: { product: Product; skuId: string; locale: Locale; variant?: "primary" | "secondary"; className?: string }) { const { add } = useCart(); const [added, setAdded] = useState(false); const t = messages[locale].common; return <button className={`${variant === "primary" ? "button-primary" : "button-secondary"} ${className ?? "w-full"}`} onClick={() => { add({ productId: product.id, skuId, quantity: 1 }); trackStorefrontEvent("add_to_cart", { productId: product.id, skuId }); setAdded(true); window.setTimeout(() => setAdded(false), 1800); }}><ShoppingBag size={18}/>{added ? t.added : t.addToCart}</button>; }
