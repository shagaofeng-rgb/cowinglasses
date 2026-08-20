"use client";
import { ShoppingBag } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/types/product";
import type { Locale } from "@/lib/i18n";
import { messages } from "@/messages";
import { useCart } from "@/providers/cart-provider";

export function AddToCart({ product, skuId, locale }: { product: Product; skuId: string; locale: Locale }) { const { add } = useCart(); const [added, setAdded] = useState(false); const t = messages[locale].common; return <button className="button-primary w-full" onClick={() => { add({ productId: product.id, skuId, quantity: 1 }); setAdded(true); window.setTimeout(() => setAdded(false), 1800); }}><ShoppingBag size={18}/>{added ? t.added : t.addToCart}</button>; }
