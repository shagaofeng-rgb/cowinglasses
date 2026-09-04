import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Product } from "@/types/product";
import { localize, type Locale } from "@/lib/i18n";
import { Price } from "@/components/commerce/price";
import { messages } from "@/messages";
import styles from "@/components/layout/storefront-design.module.css";

export function ProductCard({ product, locale }: { product: Product; locale: Locale }) {
  const t = messages[locale].common;
  const name = localize(product.name, locale);

  return (
    <article className={styles.productCard}>
      <Link href={`/${locale}/products/${product.slug}`} className={styles.productCardMedia}>
        <Image src={product.heroImage} alt={name} width={1000} height={800} className={styles.productCardImage} sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" />
      </Link>
      <div className={styles.productCardBody}>
        <div>
          <p className={styles.productCardState}>{product.demo ? t.demo : "Available now"}</p>
          <h2 className={styles.productCardTitle}>{name}</h2>
          <p className={styles.productCardCopy}>{localize(product.tagline, locale)}</p>
        </div>
        <Link className={styles.productCardArrow} href={`/${locale}/products/${product.slug}`} aria-label={`View ${name}`}><ArrowUpRight size={17} /></Link>
        <div className={styles.productCardPrice}>
          {product.demo ? <Price usd={product.usdPrice} locale={locale} compact /> : <p>USD {product.usdPrice.toFixed(2).replace(/\.00$/, "")} {product.compareAtUsdPrice && <span className="ms-2 text-sm text-[var(--muted)] line-through">USD {product.compareAtUsdPrice.toFixed(2).replace(/\.00$/, "")}</span>}</p>}
        </div>
        {!product.demo && <Link href={`/${locale}/checkout?product=${product.slug}`} className={`button-primary ${styles.productCardBuy}`}>Buy now</Link>}
      </div>
    </article>
  );
}
