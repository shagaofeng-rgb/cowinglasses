"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { quoteHref, salesCopy } from "@/messages/sales";
import { messages } from "@/messages";
import { useCart } from "@/providers/cart-provider";
import { localize } from "@/lib/i18n";
import { formatUsdPrice, Price } from "./price";
import { InteriorHead } from "@/components/layout/storefront-ui";
import { storefrontLabels } from "@/messages/storefront";
import { PaymentMethods } from "@/components/compliance/payment-methods";
import type { Product } from "@/types/product";
import styles from "@/components/layout/storefront-design.module.css";

export function CartPage({
  locale,
  products,
}: {
  locale: Locale;
  products: Product[];
}) {
  const { lines, setQuantity, remove, hydrated } = useCart();
  const t = messages[locale];
  const items = lines.flatMap((line) => {
    const product = products.find((item) => item.id === line.productId);
    const sku = product?.colors.find(
      (color) => color.id === line.skuId || color.skuId === line.skuId,
    );
    return product && sku ? [{ line, product, sku }] : [];
  });
  const total = items.reduce(
    (sum, item) => sum + (item.sku.usdPrice ?? item.product.usdPrice) * item.line.quantity,
    0,
  );

  const ui = storefrontLabels(locale);
  const sales = salesCopy[locale];
  const missing = lines.filter((line) => !items.some((item) => item.line === line));
  const limited = items.find(({ line, sku }) => !sku.available || line.quantity > Math.min(sku.availableQuantity ?? 0, 100));
  const canCheckOut = hydrated && !missing.length && !limited;
  return (
    <div className={`${styles.page} ${styles.cartPage}`}>
      <InteriorHead eyebrow={ui.orderDesk} title={t.cart.title} intro={items.length ? t.cart.delivery : t.cart.empty}
        aside={<Link className="button-secondary" href={`/${locale}/shop`}>{t.common.continueShopping}<ArrowUpRight size={16} className="rtl:-rotate-90" /></Link>} />
      <section className={`shell ${styles.section}`}>
        {!lines.length ? <div className={styles.emptyState}>
          <ShoppingBag size={34} aria-hidden="true" /><p>{t.cart.empty}</p>
          <Link className="button-primary" href={`/${locale}/shop`}>{t.common.continueShopping}</Link>
        </div> : <div className={styles.cartLayout}>
          <div>
            {missing.map((line) => <div key={`${line.productId}-${line.skuId}`} className="mb-3 flex items-center justify-between gap-3 border border-[var(--line)] p-4">
              <p>{sales.pending}</p><button type="button" onClick={() => remove(line)} className="button-secondary">{t.common.remove}</button>
            </div>)}
            {items.map(({ line, product, sku }) => (
              <article className={styles.cartItem} key={`${line.productId}-${line.skuId}`}>
                <Image
                  src={sku.images[0] ?? product.heroImage}
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
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-white/10"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  {(!sku.available || line.quantity > Math.min(sku.availableQuantity ?? 0, 100)) && <Link className="mt-3 text-sm font-semibold underline" href={quoteHref(locale, product.slug, sku.id)}>{sales.pending} · {sales.quote}</Link>}
                  <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-6">
                    <div className="flex min-h-10 items-center border border-[var(--line)]">
                      <button
                        type="button"
                        className="px-3"
                        onClick={() => setQuantity(line, line.quantity - 1)}
                        aria-label={ui.decrease}
                      >
                        <Minus size={15} />
                      </button>
                      <span className="min-w-7 text-center text-sm font-bold">{line.quantity}</span>
                      <button
                        type="button"
                        className="px-3"
                        disabled={line.quantity >= Math.min(sku.availableQuantity ?? 0, 100)}
                        onClick={() => setQuantity(line, line.quantity + 1)}
                        aria-label={ui.increase}
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                    <Price usd={(sku.usdPrice ?? product.usdPrice) * line.quantity} locale={locale} compact />
                  </div>
                </div>
              </article>
            ))}
          </div>
          <aside className={styles.cartSummary}>
            <h2 className="text-3xl">{t.cart.orderSummary}</h2>
            <div className="mt-8 flex justify-between border-b border-white/15 pb-5">
              <span>{t.cart.subtotal}</span>
              <strong dir="ltr" className="text-[var(--lime)]">{formatUsdPrice(total)}</strong>
            </div>
            <p className="mt-5 text-sm leading-6">{t.cart.delivery}</p>
            <p className="mt-3 text-sm leading-6">{t.common.finalUsd}</p>
            <p className="mt-3 text-sm leading-6">{t.cart.checkoutNote}</p>
            {canCheckOut ? <Link className="button-primary mt-7 w-full" href={`/${locale}/checkout`}>{t.common.checkout}</Link> :
              <><p className="mt-4 text-sm">{sales.unavailable}</p><Link className="button-primary mt-4 w-full" href={quoteHref(locale, limited?.product.slug, limited?.sku.id)}>{sales.quote}</Link></>}
            <div className="mt-5"><PaymentMethods compact /></div>
          </aside>
        </div>}
      </section>
    </div>
  );
}
