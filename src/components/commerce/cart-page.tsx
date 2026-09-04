"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { messages } from "@/messages";
import { useCart } from "@/providers/cart-provider";
import { localize } from "@/lib/i18n";
import { Price } from "./price";
import { formatCurrency, convertFromUsd } from "@/lib/currency";
import type { Product } from "@/types/product";
import styles from "@/components/layout/storefront-design.module.css";

export function CartPage({
  locale,
  products,
}: {
  locale: Locale;
  products: Product[];
}) {
  const { lines, setQuantity, remove, currency } = useCart();
  const t = messages[locale];
  const items = lines.flatMap((line) => {
    const product = products.find((item) => item.id === line.productId);
    const sku = product?.colors.find(
      (color) => color.id === line.skuId || color.skuId === line.skuId,
    );
    return product && sku ? [{ line, product, sku }] : [];
  });
  const total = items.reduce(
    (sum, item) => sum + item.product.usdPrice * item.line.quantity,
    0,
  );

  if (!items.length)
    return (
      <section className={styles.statusPage}>
        <div>
          <h1>{t.cart.title}</h1>
          <p className="mx-auto mt-5 max-w-lg text-[#c2cbce]">{t.cart.empty}</p>
          <Link className="button-primary mt-8" href={`/${locale}/shop`}>
            {t.common.continueShopping}
          </Link>
        </div>
      </section>
    );

  return (
    <section className={`${styles.cartPage} ${styles.section}`}>
      <div className="shell">
        <h1 className={styles.cartTitle}>{t.cart.title}</h1>
        <div className={`${styles.cartLayout} mt-12`}>
          <div>
            {items.map(({ line, product, sku }) => (
              <article className={styles.cartItem} key={`${line.productId}-${line.skuId}`}>
                <Image
                  src={sku.images[0]}
                  alt={localize(product.name, locale)}
                  width={400}
                  height={400}
                  className={styles.cartItemImage}
                  sizes="(max-width: 640px) 104px, 136px"
                />
                <div className="flex min-w-0 flex-col">
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[.13em] text-[var(--muted)]">
                        {localize(sku.name, locale)}
                      </p>
                      <h2 className="mt-2 text-3xl leading-none">
                        {localize(product.name, locale)}
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(line)}
                      aria-label={t.common.remove}
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-white"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-6">
                    <div className="flex min-h-10 items-center rounded-full border border-[var(--line)] bg-white">
                      <button
                        type="button"
                        className="px-3"
                        onClick={() => setQuantity(line, line.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={15} />
                      </button>
                      <span className="min-w-7 text-center text-sm font-bold">{line.quantity}</span>
                      <button
                        type="button"
                        className="px-3"
                        onClick={() => setQuantity(line, line.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                    <Price usd={product.usdPrice * line.quantity} locale={locale} compact />
                  </div>
                </div>
              </article>
            ))}
          </div>
          <aside className={styles.cartSummary}>
            <h2 className="text-3xl">{t.cart.orderSummary}</h2>
            <div className="mt-8 flex justify-between border-b border-white/15 pb-5">
              <span>{t.cart.subtotal}</span>
              <strong>{formatCurrency(convertFromUsd(total, currency), currency)}</strong>
            </div>
            <p className="mt-5 text-sm leading-6">{t.cart.delivery}</p>
            <p className="mt-3 text-sm leading-6">{t.common.finalUsd}</p>
            <p className="mt-3 text-sm leading-6">{t.cart.checkoutNote}</p>
            <Link className="button-primary mt-7 w-full" href={`/${locale}/checkout`}>
              {t.common.checkout}
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
