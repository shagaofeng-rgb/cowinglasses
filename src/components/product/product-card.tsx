import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Product } from "@/types/product";
import { localize, type Locale } from "@/lib/i18n";
import { modelCode } from "@/lib/product-model";
import { Price } from "@/components/commerce/price";
import { storefrontLabels } from "@/messages/storefront";
import styles from "@/components/layout/storefront-design.module.css";

export function ProductCard({ product, locale }: { product: Product; locale: Locale }) {
  const name = localize(product.name, locale);
  const ui = storefrontLabels(locale);
  const href = `/${locale}/products/${product.slug}`;

  return (
    <article className={styles.productCard}>
      <Link href={href} className={styles.productCardMedia} aria-label={name}>
        <Image src={product.heroImage} alt="" fill quality={85} sizes="(max-width: 360px) 92vw, (max-width: 767px) 46vw, (max-width: 1536px) 31vw, 440px" />
        <span className={styles.mediaBadge}>{modelCode(product.slug)}</span>
        <ArrowUpRight size={18} className="rtl:-rotate-90" aria-hidden="true" />
      </Link>
      <div className={styles.productCardBody}>
        <h2 className={styles.productCardTitle}><Link href={href}>{name}</Link></h2>
        <p className={styles.productCardCopy}>{product.colors.length ? product.colors.slice(0, 2).map((sku) => localize(sku.name, locale)).join(" · ") : localize(product.tagline, locale)}</p>
        <div className={styles.productCardPrice}>
          <Price usd={product.usdPrice} locale={locale} compact />
          <Link href={href} className={styles.textLink} aria-label={`${ui.view} · ${name}`}>{ui.view}<ArrowUpRight size={14} className="rtl:-rotate-90" aria-hidden="true" /></Link>
        </div>
      </div>
    </article>
  );
}
