import { localeMeta, locales, type Locale, type LocalizedText } from "@/types/localization";

export { locales, localeMeta };
export type { Locale, LocalizedText };

export function isLocale(value: string): value is Locale { return locales.includes(value as Locale); }
export function localize(value: LocalizedText, locale: Locale): string { return value[locale] || value.en; }
export function pathFor(locale: Locale, path = ""): string { return `/${locale}${path.startsWith("/") ? path : `/${path}`}`.replace(/\/$/, "") || `/${locale}`; }
