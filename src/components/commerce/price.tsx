"use client";

import type { Locale } from "@/lib/i18n";
import { convertFromUsd, formatCurrency, rateUpdatedAt } from "@/lib/currency";
import { messages } from "@/messages";
import { useCart } from "@/providers/cart-provider";
import styles from "@/components/layout/storefront-design.module.css";

export function formatUsdPrice(usd: number) {
  return `USD ${usd.toFixed(2)}`;
}

export function Price({ usd, locale, compact = false, compareAt, tag }: {
  usd: number;
  locale: Locale;
  compact?: boolean;
  compareAt?: number;
  tag?: string;
}) {
  const { currency } = useCart();
  const t = messages[locale].common;
  return (
    <div className={styles.priceBlock}>
      <div className={styles.priceLine}>
        <strong dir="ltr">{formatUsdPrice(usd)}</strong>
        {compareAt !== undefined && compareAt > usd && <s dir="ltr">{formatUsdPrice(compareAt)}</s>}
        {tag && <span className={styles.dataBadge}>{tag}</span>}
      </div>
      {currency !== "USD" && <p className={styles.priceNote}>{t.estimated} · <bdi>{formatCurrency(convertFromUsd(usd, currency), currency)}</bdi></p>}
      {!compact && <p className={styles.priceNote}>{t.finalUsd}{currency !== "USD" && <> {t.exchange} {t.lastUpdated} · <bdi>{rateUpdatedAt(currency)}</bdi></>}</p>}
    </div>
  );
}
