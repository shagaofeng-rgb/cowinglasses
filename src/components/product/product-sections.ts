import type { Locale } from "@/lib/i18n";
import type { Product } from "@/types/product";

export const productSectionKeys = ["overview", "features", "specifications", "gallery", "compatibility", "in-the-box", "faq"] as const;
export type ProductSection = (typeof productSectionKeys)[number];

const labels: Record<Locale, Record<ProductSection, string>> = {
  en: { overview: "Overview", features: "Features", specifications: "Specifications", gallery: "Gallery", compatibility: "Compatibility", "in-the-box": "In the box", faq: "FAQ" },
  ar: { overview: "نظرة عامة", features: "المزايا", specifications: "المواصفات", gallery: "المعرض", compatibility: "التوافق", "in-the-box": "محتويات العلبة", faq: "الأسئلة الشائعة" },
  es: { overview: "Resumen", features: "Funciones", specifications: "Especificaciones", gallery: "Galería", compatibility: "Compatibilidad", "in-the-box": "En la caja", faq: "Preguntas frecuentes" },
  pt: { overview: "Visão geral", features: "Recursos", specifications: "Especificações", gallery: "Galeria", compatibility: "Compatibilidade", "in-the-box": "Na caixa", faq: "Perguntas frequentes" },
  ja: { overview: "概要", features: "機能", specifications: "仕様", gallery: "ギャラリー", compatibility: "互換性", "in-the-box": "同梱内容", faq: "よくある質問" },
  ko: { overview: "개요", features: "기능", specifications: "사양", gallery: "갤러리", compatibility: "호환성", "in-the-box": "구성품", faq: "자주 묻는 질문" },
};

export function isProductSection(value: string): value is ProductSection {
  return productSectionKeys.includes(value as ProductSection);
}

export function productSectionsFor(product: Product): ProductSection[] {
  return productSectionKeys.filter((section) => {
    if (section === "gallery") return Boolean(product.detailImages?.length || product.colors.some((color) => color.images.length > 1));
    if (section === "faq") return product.faq.length > 0;
    return true;
  });
}

export function productSectionLabel(locale: Locale, section: ProductSection) {
  return labels[locale][section];
}
