import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Product } from "@/types/product";
import { localize, type Locale } from "@/lib/i18n";
import { Price } from "@/components/commerce/price";
import { messages } from "@/messages";

export function ProductCard({ product, locale }: { product: Product; locale: Locale }) { const t = messages[locale].common; return <article className="group border-t border-[var(--line)] pt-3"><Link href={`/${locale}/products/${product.slug}`} className="block overflow-hidden bg-[#eeefeb]"><Image src={product.heroImage} alt={localize(product.name, locale)} width={1000} height={1200} className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-[1.025]" sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"/></Link><div className="flex items-start justify-between gap-3 pt-4"><div><p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">{t.demo}</p><h2 className="mt-1 text-lg font-bold">{localize(product.name, locale)}</h2><p className="mt-1 max-w-[28ch] text-sm leading-5 text-[var(--muted)]">{localize(product.tagline, locale)}</p></div><Link className="mt-5 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--lime)] text-black" href={`/${locale}/products/${product.slug}`} aria-label={`View ${localize(product.name, locale)}`}><ArrowUpRight size={17}/></Link></div><div className="pt-4"><Price usd={product.usdPrice} locale={locale} compact/></div></article>; }
