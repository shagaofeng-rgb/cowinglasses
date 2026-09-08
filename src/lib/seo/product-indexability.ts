import { locales, type Locale, type LocalizedText } from "@/lib/i18n";
import type { Product } from "@/types/product";

/**
 * A product locale is indexable only when its essential search-facing content
 * is actually translated. English fallback remains usable for people, but it
 * must not create near-duplicate search results in another language.
 */
function hasTranslation(value: LocalizedText, locale: Locale) {
  return locale === "en" || Boolean(value[locale]?.trim());
}

export function isProductLocaleIndexable(product: Product, locale: Locale) {
  if (product.demo) return false;

  return [product.name, product.tagline, product.description, product.seo.title, product.seo.description]
    .every((value) => hasTranslation(value, locale));
}

export function getProductSearchLocales(product: Product) {
  return locales.filter((locale) => isProductLocaleIndexable(product, locale));
}

export function getProductCanonicalLocale(product: Product, locale: Locale): Locale {
  return isProductLocaleIndexable(product, locale) ? locale : "en";
}

export function getProductLanguageAlternates(product: Product, suffix = "") {
  return Object.fromEntries(
    getProductSearchLocales(product).map((locale) => [locale, `/${locale}/products/${product.slug}${suffix}`]),
  );
}
