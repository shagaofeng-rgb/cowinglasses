export const locales = ["en", "ar", "es", "pt", "ja", "ko"] as const;
export type Locale = (typeof locales)[number];

export type LocalizedText = { en: string } & Partial<Record<Exclude<Locale, "en">, string>>;

export const localeMeta: Record<Locale, { label: string; nativeLabel: string; direction: "ltr" | "rtl" }> = {
  en: { label: "English", nativeLabel: "English", direction: "ltr" },
  ar: { label: "Arabic", nativeLabel: "العربية", direction: "rtl" },
  es: { label: "Spanish", nativeLabel: "Español", direction: "ltr" },
  pt: { label: "Portuguese", nativeLabel: "Português", direction: "ltr" },
  ja: { label: "Japanese", nativeLabel: "日本語", direction: "ltr" },
  ko: { label: "Korean", nativeLabel: "한국어", direction: "ltr" },
};
